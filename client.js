#!/usr/bin/node

var tls = require('tls');
var fs = require('fs');

var options = {
	// These are necessary only if using the client certificate authentication
	key: fs.readFileSync('keys/ctf-key.pem'),
	cert: fs.readFileSync('keys/ctf-cert.pem'),

	// This is necessary only if the server uses the self-signed certificate
	ca: [ fs.readFileSync('keys/cla-cert.pem') ]
};

var socket = tls.connect(8000, options, function() {
	console.log('client connected',
			socket.authorized ? 'authorized' : 'unauthorized');
	process.stdin.pipe(socket);
	process.stdin.resume();
});
socket.setEncoding('utf8');
socket.on('data', function(data) {
	console.log(data);
});
socket.on('end', function() {
	server.close();
});
