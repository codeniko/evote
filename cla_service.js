#!/usr/bin/node
// #!/usr/local/bin/node

//--enable-ssl3

var tls = require('tls');
var fs = require('fs');

var options = {
	key: fs.readFileSync('cla-key.pem'),
	cert: fs.readFileSync('cla-cert.pem'),

	// This is necessary only if using the client certificate authentication.
	requestCert: true,

		// This is necessary only if the client uses the self-signed certificate.
	//ca: [ fs.readFileSync('client-cert.pem') ]
};

var server = tls.createServer(options, function(socket) {
	console.log('server connected',
			socket.authorized ? 'authorized' : 'unauthorized');
	socket.write("welcome!\n");
	socket.setEncoding('utf8');
	socket.pipe(socket);
});
server.listen(8000, function() {
	console.log('server bound');
});


/*
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
	*/
/*
	var voter = new Voter(123, 'niko', 0);
	console.log(voter.ssn());
	console.log(voter.name());
	console.log(voter.vote());
	voter.voteFlag = true;
	console.log(voter.voteFlag);
	*/
