process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
var tls = require('tls');
var fs = require('fs');
var Voter = require('./Voter.js');
var HashMap = require('hashmap');
var readline = require('readline');


var voterMap = new HashMap(); // hashes ssn to Voter
var userDB = [];
var validationNum;
var voter;
var client_socket;
var ctf_socket;


function loadUserDB() {
	fs.readFile('data/users.db', function(err, data) {
		console.log('Loading user database....');
		if (err) throw err;
		var lines = data.toString().split('\n');
		for (i in lines) {
			if (lines[i] != '') {
				var l = lines[i].split('|');
				userDB.push({'name':l[0], 'ssn':l[1]});
			}
		}
		console.log('User database has been loaded.');
	});
}

function validateVoter(voter) {
	for (i in userDB) {
		if (voter.name() === userDB[i].name && voter.ssn() === userDB[i].ssn) {
			if (voterMap.get(voter.ssn()) === undefined) {
				return 'valid';
			}
			return 'voted';
		}
	}
	return 'invalid';
}



// =============Socket related code below================
var client_options = {
	key: fs.readFileSync('keys/cla-key.pem'),
	cert: fs.readFileSync('keys/cla-cert.pem'),

	// This is necessary only if using the client certificate authentication.
	requestCert: true,

		// This is necessary only if the client uses the self-signed certificate.
	ca: [ fs.readFileSync('keys/client-cert.pem') ]
};

var ctf_options = {
	key: fs.readFileSync('keys/cla-key.pem'),
	cert: fs.readFileSync('keys/cla-cert.pem'),

	// This is necessary only if using the client certificate authentication.
	requestCert: true,

		// This is necessary only if the client uses the self-signed certificate.
	ca: [ fs.readFileSync('keys/ctf-cert.pem') ]
};

var server = tls.createServer(client_options, function(socket) {
	client_socket = socket;
	console.log('a client connected',
			socket.authorized ? 'authorized' : 'unauthorized');
	socket.setEncoding('utf8');
	socket.addListener('data', function(data) {
		var dataSplit = data.split('|');
		if (dataSplit[0] === 'auth') {
			voter = new Voter(dataSplit[1], dataSplit[2]);
			var isValidVoter = validateVoter(voter);
			if (isValidVoter === 'valid') {
				validationNum = Math.random()*Math.pow(10, 17);
				voter.valNum = validationNum;
				voterMap.set(dataSplit[1], voter);

				// Send this record of validation to CTF
				ctf_socket.write('vMapUnit|'+ voter.ssn()+ '|' + voter.name() + '|' +
						voter.valNum);
			} else if (isValidVoter === 'invalid') {
				client_socket.end('invalidVoter');
			} else {
				client_socket.end('votedAlready');
			}
		}
	});
	socket.pipe(socket);
});


server.listen(8000, function() {
	console.log('CLA service listening on port 8000 for Clients');
});

ctf_socket = tls.connect(8001, ctf_options, function() {});
ctf_socket.setEncoding('utf8');
ctf_socket.addListener('data', function(data) {

	if (data === 'done') {
		console.log('Received confirmation from CTF that records have' +
				' been updated. Sending validation to Voter: '+voter.valNum);
		client_socket.write('vNum|' + voter.valNum);
	}
});

loadUserDB();
