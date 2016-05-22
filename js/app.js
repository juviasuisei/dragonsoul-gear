var colors = ['white','green','green1','blue','blue1','blue2','purple','purple1','purple2','purple3','purple4','orange','orange1']

var needed = {};
var cost = 0;

function sanity_check() {
	var litmus = false;
	$.each(heroes, function(hk,hero) {
		$.each(hero.gearsets, function(gk,gearset) {
			$.each(gearset, function(slot,item) {
				if(false === item in gear) {
					$('#error').html($('#error').html() + 'UNMATCHED GEAR: ' + hk + '/' + gk + '/' + (slot + 1) + '/' + item + '<br />');
					litmus = true;
				}
			});
		});
		$.each(hero.quests, function(qk,quest) {
			if('gear' === quest.type && false === quest.specific in gear) {
				$('#error').html($('#error').html() + 'UNMATCHED GEAR: ' + hk + '/quest/' + qk + '/' + quest.specific + '<br />');
				litmus = true;
			}
		});
	});
	$.each(recipes, function(rk,recipe) {
		$.each(recipe.materials, function(mk,material) {
			if(false === material.item in gear) {
				$('#error').html($('#error').html() + 'UNMATCHED GEAR: ' + rk + '/' + mk + '/' + material.item + '<br />');
				litmus = true;
			}
		});
	});
	if(false === litmus) {
		$.tablesorter.addParser({
			id: 'color',
			is: function(s) {
				return false;
			},
			format: function(s) {
				switch(s) {
					case 'white':
						return 0;
						break;
					case 'green':
						return 1;
						break;
					case 'blue':
						return 2;
						break;
					case 'purple':
						return 3;
						break;
					case 'orange':
						return 4;
						break;
				}
			},
			type: 'numeric'
		});
		$.tablesorter.addParser({
			id: 'nocommas',
			is: function(s) {
				return false;
			},
			format: function(s) {
				return s.toLowerCase().replace(/,/g,'');
			},
			type: 'numeric'
		});
		$('#collects').tablesorter({
			headers: {
				0 : { sorter: 'color' },
				3 : { sorter: 'nocommas' }
			}
		});
		$('#crafts').tablesorter({
			headers: {
				0 : { sorter: 'color' },
				3 : { sorter: 'nocommas' },
				4 : { sorter: 'nocommas' },
				5 : { sorter: 'nocommas' }
			}
		});
		populate_heroes();
		tab('welcome');
		hero_tab('dragon_lady');
	}
}

function update_stars(hk, number) {
	var progress = $.parseJSON(localStorage.getItem(hk));
	progress.stars = number;
	localStorage.setItem(hk, JSON.stringify(progress));
	$('#' + hk + 'stars').html(generate_stars(hk, number));
	calculate_stats(hk);
}

function generate_stars(hk, number) {
	var i = 1;
	var result = '';
	var id = hk + 'stars';
	var min = heroes[hk].stars;
	while(i < 6) {
		result += '<span onclick="update_stars(\'' + hk + '\', ' + (i > min ? i : min) + ')">';
		if(i > number) {
			result += '&#x2606;';
		} else {
			result += '&#x2605;';
		}
		result += '</span>';
		i++;
	}
	return result;
}

function update_level(hk) {
	var progress = $.parseJSON(localStorage.getItem(hk));
	var number = $('#' + hk + 'level').val();
	if(true === $.isNumeric(number)) {
		number = parseInt(number);
	} else {
		number = 0;
	}
	progress.level = number;
	localStorage.setItem(hk, JSON.stringify(progress));
	calculate_stats(hk);
}

function populate_heroes() {
	$.each(heroes, function(hk,hero) {
		var progress = $.parseJSON(localStorage.getItem(hk));
		var nav = '<a class="hero_nav" href="javascript:void(0);" onclick="hero_tab(\'' + hk + '\')"><img class="hero_nav" src="heroes/' + hk + '.png" title="' + hero.name + '" /></a>';
		$('#heroes_nav').html($('#heroes_nav').html() + nav);
		var result = '';
		result += '<div id="' + hk + '" class="hero_tab">';
		result += '<img class="hero" src="heroes/' + hk + '.png" title="' + hero.name + '" />';
		result += '<img class="role" src="roles/' + hero.role + '.png" title="' + hero.role + '" />';
		result += '<h3>' + hero.name + ' (<span onclick="check_gearsets(\'' + hk + '\', true);">mark as completed</span> &#x2022; <span onclick="check_gearsets(\'' + hk + '\', false);">clear</span>)</h3>';
		result += '<h5>' + hero.position + '-row ' + hero.role + ' added to the game in v' + hero.version + '</h5>';
		var stars = hero.stars;
		var level = 0;
		if(null !== progress) {
			if('stars' in progress) {
				stars = progress.stars;
			}
			if('level' in progress) {
				level = progress.level;
			}
		}
		result += '<p class="stars_level"><span id="' + hk + 'stars">' + generate_stars(hk, stars) + '</span> &#x2022; Level <input type="text" id="' + hk + 'level" value="' + level + '" onchange="update_level(\'' + hk + '\');" /></p>';
		result += '<p class="hero_subnav"><a href="javascript:void(0);" onclick="hero_subtab(\'' + hk + 'gear\')">Gear</a> &#x2022; <a href="javascript:void(0);" onclick="hero_subtab(\'' + hk + 'quests\')">Legendary Quests</a> &#x2022; <a href="javascript:void(0);" onclick="hero_subtab(\'' + hk + 'stats\')">Stats</a></p>';
		result += '<div id="' + hk + 'gear" class="hero_subtab">';
		$.each(hero.gearsets, function(gk,gearset) {
			var color = gk.match(/^[^\d]*/)[0];
			var i = 1;
			var j = 0;
			var subresult = ''
			$.each(gearset, function(slot,item) {
				var gear_item = gear[item]
				subresult += '<img id="' + hk + gk + '_' + slot + '" onclick="$(this).toggleClass(\'have\'); calculate_gear();" class="gearset';
				if(null !== progress && gk in progress && slot in progress[gk] && true === progress[gk][slot]) {
					subresult += ' have';
					j++;
				}
				subresult += '" src="gear/' + item + '.png" title="' + gear_item.name + '" />';
				if(3 === i) {
					subresult += '<br />';
				}
				i++;
			});
			result += '<h4 class="' + color + '">[<span id="' + hk + gk + 'toggle" onclick="toggle_gearset(\'' + hk + gk + '\');">';
			if(6 === j) {
				result += '+';
			} else {
				result += '-';
			}
			result += '</span>] ' + gk.replace(/(\d+)$/, " +$1") + ' (<span onclick="check_gearset(\'' + hk + gk + '\', true, true);">mark as completed</span> &#x2022; <span onclick="check_gearset(\'' + hk + gk + '\', false, true);">clear</span>)</h4>';
			result += '<div id="' + hk + gk + '" class="';
			if(6 === j) {
				result += 'hide';
			}
			result += '">';
			result += subresult;
			result += '</div>';
		});
		result += '</div>';
		result += '<div id="' + hk + 'quests" class="hero_subtab">';
		$.each(hero.quests, function(qk,quest) {
			if('gear' === quest.type) {
				var color = qk.match(/^[^\d]*/)[0];
				var gear_item = gear[quest.specific];
				result += '<h4 class="' + color + '">' + qk.replace(/(\d+)$/, " +$1") + '</h4>';
				result += '<img id="' + hk + 'quest' + qk + '" onclick="$(this).toggleClass(\'have\'); calculate_gear();" class="quest';
				if(null !== progress && 'quest' in progress && qk in progress['quest'] && true === progress['quest'][qk]) {
					result += ' have';
				}
				result += '" src="gear/' + quest.specific + '.png" title="' + gear_item.name + '" /> x' + quest.quantity;
			}
		});
		result += '</div>';
		result += '<div id="' + hk + 'stats" class="hero_subtab">';
		result += '<p>' + hero.description + '</p>';
		result += '<h4>Current Stats (currently excludes Stars, Enhancements, Runes, and Skills)</h4>';
		result += '<p id="' + hk + 'calcstats"></p>';
		result += '<h4>Base Stats</h4>';
		result += '<p>' + get_stats(hero.stats) + '</p>';
		result += '</div>';
		result += '</div>';
		$('#heroes_list').html($('#heroes_list').html() + result);
	});
	calculate_gear();
}

function toggle_gearset(id) {
	$('#' + id).toggleClass('hide');
	if(true === $('#' + id).hasClass('hide')) {
		$('#' + id + 'toggle').html('+');
	} else {
		$('#' + id + 'toggle').html('-');
	}
}

function check_gearsets(id,have) {
	$.each(heroes[id].gearsets, function(gk,gearset) {
		check_gearset(id + gk, have, false);
	});
	calculate_gear();
}

function check_gearset(id,have,recalculate) {
	if(true === have) {
		$('#' + id + ' img').addClass('have');
	} else {
		$('#' + id + ' img').removeClass('have');
	}
	if(true === recalculate) {
		calculate_gear();
	}
}

function calculate_gear() {
	needed = {};
	cost = 0;
	var progress = {};
	$('#gold').html(0);
	$.each(heroes, function(hk,hero) {
		progress[hk] = {};
		var current_progress = $.parseJSON(localStorage.getItem(hk));
		var stars = hero.stars;
		var level = 0;
		if(null !== current_progress) {
			if('stars' in current_progress) {
				stars = current_progress.stars;
			}
			if('level' in current_progress) {
				level = current_progress.level;
			}
		}
		progress[hk].stars = stars;
		progress[hk].level = level;
		$.each(hero.gearsets, function(gk,gearset) {
			progress[hk][gk] = {};
			var i = 0;
			$.each(gearset, function(slot,item) {
				if(false === $('#' + hk + gk + '_' + slot).hasClass('have')) {
					progress[hk][gk][slot] = false;
					if(false === item in needed) {
						needed[item] = 1;
					} else {
						needed[item] += 1;
					}
					if(true === item in recipes) {
						calculate_recipe(recipes[item], 1);
					}
				} else {
					progress[hk][gk][slot] = true;
					i++;
				}
			});
			$('#' + hk + gk).removeClass('hide');
			$('#' + hk + gk + 'toggle').html('-');
			if(6 === i) {
				$('#' + hk + gk).addClass('hide');
				$('#' + hk + gk + 'toggle').html('+');
			}
		});
		progress[hk]['quest'] = {};
		$.each(hero.quests, function(qk,quest) {
			if('gear' === quest.type) {
				if(false === $('#' + hk + 'quest' + qk).hasClass('have')) {
					progress[hk]['quest'][qk] = false;
					if(false === quest.specific in needed) {
						needed[quest.specific] = quest.quantity;
					} else {
						needed[quest.specific] += quest.quantity;
					}
					if(true === quest.specific in recipes) {
						calculate_recipe(recipes[quest.specific], quest.quantity);
					}
				} else {
					progress[hk]['quest'][qk] = true;
				}
			}
		});
	});
	$.each(progress, function(k,v) {
		localStorage.setItem(k, JSON.stringify(v));
		calculate_stats(k)
	});
	var needed_sortable = [];
	$.each(needed, function(k,v) {
		needed_sortable.push({"item" : gear[k], "quantity" : v, "k" : k});
	});
	needed_sortable.sort(function(a,b) {
		var diff = b.quantity - a.quantity;
		if(0 === diff) {
			if(a.item.name < b.item.name) { return(-1); }
			if(a.item.name > b.item.name) { return(1); }
			return(0);
		} else {
			return(diff);
		}
	});
	var collects = '';
	var crafts = '';
	$.each(needed_sortable, function(k,v) {
		if(true === v.k in recipes) {
			r = recipes[v.k];
			crafts += '<tr class="' + v.item.color + '"><td rowspan="2">' + v.item.color + '</td><td rowspan="2"><img class="list" src="gear/' + v.k + '.png" title="' + v.item.name + '" /></td><td rowspan="2"><a name="' + v.k + '"></a>' + v.item.name + '</td><td>' + commas(v.quantity) + '</td><td>' + commas(r.cost) + '</td><td>' + commas(v.quantity * r.cost) + '</td><td>' + v.item.type + '</td><td>' + (0 !== v.item.level ? v.item.level : '&#x2014;') + '</td><td>' + get_stats(v.item.stats) + '</td><td>' + ("" !== v.item.description ? v.item.description : '&#x2014;') + '</td></tr><tr><td class="materials" colspan="7"><em>Required Materials to Craft One:</em>';
			$.each(r.materials, function(mk,material) {
				var gear_item = gear[material.item];
				var inception = material.item in recipes;
				crafts += ' ' + (true === inception ? '<a href="#' + material.item + '">' : '') + '<img class="sublist" src="gear/' + material.item  + '.png" title="' + gear_item.name + '" />' + (true === inception ? '</a>' : '') + ' x' + commas(material.quantity); // * v.quantity);
			});
		   crafts += '</td></tr>';
		} else {
			collects += '<tr class="' + v.item.color + '"><td>' + v.item.color + '</td><td><img class="list" src="gear/' + v.k + '.png" title="' + v.item.name + '" /></td><td>' + v.item.name + '</td><td>' + commas(v.quantity) + '</td><td>' + v.item.type + '</td><td>' + (0 !== v.item.level ? v.item.level : '&#x2014;') + '</td><td>' + get_stats(v.item.stats) + '</td><td>' + ("" !== v.item.description ? v.item.description : '&#x2014;') + '</td></tr>';
		}
	});
	$('#collect_list').html(collects);
	$('#craft_list').html(crafts);
	$('table').trigger('update');
}

function calculate_stats(hk) {
	var base_stats = $.extend({}, heroes[hk].stats);
	var progress = $.parseJSON(localStorage.getItem(hk));
	var level = progress.level;
	var stars = progress.stars;
	console.log(hk);
	base_stats.strength_growth += ((stars - 1) * heroes[hk].stat_growth.strength) * base_stats.strength_growth;
	base_stats.agility_growth += ((stars - 1) * heroes[hk].stat_growth.agility) * base_stats.agility_growth;
	base_stats.intellect_growth += ((stars - 1) * heroes[hk].stat_growth.intellect) * base_stats.intellect_growth;
	base_stats.strength += level * base_stats.strength_growth;
	base_stats.agility += level * base_stats.agility_growth;
	base_stats.intellect += level * base_stats.intellect_growth;
console.log(base_stats);
/*
	var promotions = 0;
	var promotion_bonus = 0;
	$.each(colors, function(ck,color) {
		var gearset = progress[color];
		var i = 0;
		$.each(gearset, function(slot,status) {
			if(true === status) {
				var gear_item = gear[heroes[hk].gearsets[color][slot]];
				$.each(gear_item.stats, function(stat, v) {
					if(0 !== v) {
						base_stats[stat] += v;
					}
				});
				i++;
			}
		});
		if(6 === i) {
			promotions++;
			promotion_bonus += 2 * promotions;
		}
	});
	base_stats.strength += promotion_bonus;
	base_stats.agility += promotion_bonus;
	base_stats.intellect += promotion_bonus;
	base_stats.max_health += 18 * base_stats.strength;
	base_stats.armor += 0.15 * base_stats.strength;
	base_stats.damage += 0.4 * base_stats.agility;
	base_stats.armor += 0.075 * base_stats.agility;
	base_stats.crit_rating += 0.4 * base_stats.agility;
	base_stats.skill_power += 2.4 * base_stats.intellect;
	base_stats.magic_resistance += 0.1 * base_stats.intellect;
	base_stats.damage += base_stats[base_stats.primary_stat];
	$('#' + hk + 'calcstats').html(get_stats(base_stats));
*/
}

function get_stats(stats) {
	var result = '';
	var i = 0;
	$.each(stats, function(k,v) {
		if(0 !== v && 'basic_attack' !== k && 'primary_stat' !== k) {
			if(0 < i) {
				result += '<br />';
			}
			result += k.replace(/_/g, "&#x00A0;") + ':&#x00A0;' + +v.toFixed(2);
			if(-1 != ['crit_damage','bashing','piercing','slashing','necrotic','water','toxic','electric','fire','conservation','improve_healing','longer_disables','movement_speed','attack_speed','cooldown_reduction','larger_shields'].indexOf(k)) {
				result += '%';
			}
			i++
		}
	});
	if(0 === i) {
		result = '&#x2014;';
	}
	return result;
}

function commas(raw) {
	return(raw.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
}

function calculate_recipe(recipe, quantity) {
	cost += recipe.cost * quantity;
	$('#gold').html(commas(cost)); 
	$.each(recipe.materials, function(k,material) {
		if(false === material.item in needed) {
			needed[material.item] = material.quantity * quantity;
		} else {
			needed[material.item] += material.quantity * quantity;
		}
		if(true === material.item in recipes) {
			calculate_recipe(recipes[material.item], material.quantity * quantity);
		}
	});
}

function reset() {
	if(true === confirm('Are you sure?')) {
		$('img').removeClass('have');
	}
	calculate_gear();
}

function tab(id) {
	$('.tab').hide();
	$('#' + id).show();
}

function hero_tab(id) {
	$('.hero_subtab').hide();
	$('.hero_tab').hide();
	$('#' + id).show();
	$('#' + id + 'gear').show();
}

function hero_subtab(id) {
	$('.hero_subtab').hide();
	$('#' + id).show();
}

$(function() { sanity_check(); });
