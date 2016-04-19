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
        populate_heroes();
        tab('welcome');
        hero_tab('dragon_lady');
    }
}

function populate_heroes() {
    var h = 0;
    $.each(heroes, function(hk,hero) {
        var nav = '';
        if(0 < h) {
            nav += ' &#x2022; ';
        }
        nav += '<a href="javascript:void(0);" onclick="hero_tab(\'' + hk + '\')">' + hero.name + '</a>';
        $('#heroes_nav').html($('#heroes_nav').html() + nav);
        var result = '';
        result += '<div id="' + hk + '" class="hero_tab">';
        result += '<h3>' + hero.name + ' (<span onclick="check_gearsets(\'' + hk + '\', true);">mark as completed</span>)</h3>';
        result += '<h5>added in v' + hero.version + '</h5>';
        $.each(hero.gearsets, function(gk,gearset) {
            var color = gk.match(/^[^\d]*/)[0];
            result += '<h4 class="' + color + '">' + gk.replace(/(\d+)$/, " +$1") + ' (<span onclick="check_gearset(\'' + hk + gk + '\', true);">mark as completed</span>)</h4>';
            result += '<ul id="' + hk + gk + '">';
            var i = 1;
            $.each(gearset, function(slot,item) {
                var gear_item = gear[item]
                result += '<li class="inline ' + gear_item.color + '"><label><input type="checkbox" id="' + hk + gk + slot + '" onchange="calculate_gear();"';
                var progress = $.parseJSON(localStorage.getItem(hk));
                if('undefined' !== typeof progress && gk in progress && slot in progress[gk] && true === progress[gk][slot]) {
                    result += ' checked="checked"';
                }
                result += ' /> ' + gear_item.name + '</label></li>';
                if(3 === i) {
                    result += '<br />';
                }
                i++;
            });
            result += '</ul>';
        });
        result += '</div>';
        $('#heroes_list').html($('#heroes_list').html() + result);
        h++;
    });
    calculate_gear();
}

function check_gearsets(id,checked) {
    $.each(heroes[id].gearsets, function(gk,gearset) {
        check_gearset(id + gk, checked);
    });
}

function check_gearset(id,checked) {
    $('#' + id + ' li input').prop('checked', checked);
    calculate_gear();
}

function calculate_gear() {
    needed = {};
    cost = 0;
    var progress = {};
    $('#gold').html(0);
    $.each(heroes, function(hk,hero) {
        progress[hk] = {};
        $.each(hero.gearsets, function(gk,gearset) {
            progress[hk][gk] = {};
            $.each(gearset, function(slot,item) {
                if(false === $('#' + hk + gk + slot).is(':checked')) {
                    progress[hk][gk][slot] = false;
                    if(false === item in needed) {
                        needed[item] = 1;
                    } else {
                        needed[item] += 1;
                    }
                    if(true === item in recipes) {
                        calculate_recipe(recipes[item]);
                    }
                } else {
                    progress[hk][gk][slot] = true;
                }
            });
        });
    });
    $.each(progress, function(k,v) {
        localStorage.setItem(k, JSON.stringify(v));
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
            crafts += '<li class="' + v.item.color + '">' + v.item.name + ' &#x2014; ' + v.quantity + '</li>';
        } else {
            collects += '<li class="' + v.item.color + '">' + v.item.name + ' &#x2014; ' + v.quantity + '</li>';
        }
    });
    $('#collect_list').html(collects);
    $('#craft_list').html(crafts);
}

function calculate_recipe(recipe) {
    cost += recipe.cost;
    $('#gold').html(cost.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")); 
    $.each(recipe.materials, function(k,material) {
        if(false === material.item in needed) {
            needed[material.item] = material.quantity;
        } else {
            needed[material.item] += material.quantity;
        }
        if(true === material.item in recipes) {
            var i = 0;
            while(i < material.quantity) {
                calculate_recipe(recipes[material.item]);
                i++;
            }
        }
    });
}

function reset() {
    if(true === confirm('Are you sure?')) {
        $.each(heroes, function(hk,hero) {
            check_gearsets(hk, false);
        });
    }
}

function tab(id) {
    $('.tab').hide();
    $('#' + id).show();
}

function hero_tab(id) {
    $('.hero_tab').hide();
    $('#' + id).show();
}

$(function() { sanity_check(); });
