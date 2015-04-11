#!/usr/bin/node
// #!/usr/local/bin/node

var fs = require('fs');
var http = require('http');
var socketio= require('socket.io');
var HashMap = require('hashmap');
var Voter = require('./Voter.js');

var server = http.createServer(function(req, res) {
	res.writeHead(200, { 'Content-type': 'text/html'});
	res.end(fs.readFileSync(__dirname + '/index.html'));
}).listen(8080, function() {
	console.log('Listening at: http://localhost:8080');
});

socketio.listen(server).on('connection', function (socket) {
	socket.on('message', function (msg) {
		console.log('Message Received: ', msg);
		socket.broadcast.emit('message', msg);
	});
});

/*
	var voter = new Voter(123, 'niko', 0);
	console.log(voter.ssn());
	console.log(voter.name());
	console.log(voter.vote());
	voter.voteFlag = true;
	console.log(voter.voteFlag);
	*/
