var express = require('express');
var app = express();

app.use(express.static(__dirname + '/json'));

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var portaroo = process.env.PORT || 3000;

var server = app.listen(portaroo, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('App listening at http://%s:%s', host, port);
});
