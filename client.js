#!/usr/bin/node

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
var tls = require('tls');
var fs = require('fs');
var Voter = require('./Voter.js');

var options = {
	// These are necessary only if using the client certificate authentication
	key: fs.readFileSync('keys/client-key.pem'),
	cert: fs.readFileSync('keys/client-cert.pem'),

	// This is necessary only if the server uses the self-signed certificate
	ca: [ fs.readFileSync('keys/cla-cert.pem') ]
};

var ctf_options = {
	// These are necessary only if using the client certificate authentication
	key: fs.readFileSync('keys/client-key.pem'),
	cert: fs.readFileSync('keys/client-cert.pem'),

	// This is necessary only if the server uses the self-signed certificate
	ca: [ fs.readFileSync('keys/ctf-cert.pem') ]
};


// connect to cla
var voter;
var socket = tls.connect(8000, options, function() {
  console.log(socket);
	console.log('client connected',
			socket.authorized ? 'authorized' : 'unauthorized');
  voter = new Voter("1234567890", "joyce", "bush"); 
  socket.write('auth|' + voter.ssn() + '|' + voter.name());
	//process.stdin.pipe(socket);
	//process.stdin.resume();
});

// connect to ctf
var ctf_socket = tls.connect(8002, ctf_options, function() {
});

var received;
socket.addListener('data', function(data) {
  received = data.split("|");
  console.log(">>>>");
  console.log(data);
  if (received[0] == 'vNum') {
    console.log(received);
    voter.valNum = received[1];
    voter.idNum = Math.random()*Math.pow(10, 16);
    console.log("atempting to send to ctf")
    ctf_socket.write('vote|' + voter.valNum + '|' + voter.idNum + '|' +
        voter.vote);
  }
});

socket.setEncoding('utf8');
/*socket.on('data', function(data) {
	console.log(data);
});

socket.on('end', function() {
	server.close();
});*/
