process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
var tls = require('tls');
var fs = require('fs');
var Voter = require('./Voter.js');
var readline = require('readline');


var ctf_socket;
var cla_socket;
var voter;
var candidates;
var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
});



rl.question('Enter your name: ', function(name) {
	  rl.question('Enter your SSN: ', function(ssn) {
		  voter = new Voter(ssn, name);
		  connectToVote();
		  getCandidates();
	  });
});

function askWhoToVoteFor() {
	rl.write('\nYou can vote for the following candidates:\n');
	for (var i = 0; i < candidates.length; i++) {
		rl.write(candidates[i]+'\n');
	}
	rl.write('\n');
	var qvote = 'Enter name of candidate you\'re voting for: ';
	rl.question(qvote, function(candidate) {
		voter.vote = candidate;
		validateCandidate(candidate);
		authorize();
	});	  
}

function validateCandidate(candidate) {
	var valid = false;
	if (candidate != undefined) {
		for (var i = 0; i < candidates.length; i++) {
			if (candidate === candidates[i]) {
				valid = true;
			}
		}
	}
	if (!valid) {
		rl.write('Invalid candidate entered.\n');
		rl.close();
		process.exit(1);
	}
}



// ===========Socket related code below====================
function getCandidates() {
	ctf_socket.write('getCandidateList');
}

function authorize() {
	cla_socket.write('auth|' + voter.ssn() + '|' + voter.name());
}

function connectToVote() {
	var cla_options = {
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


	// Connect to CTF
	ctf_socket = tls.connect(8002, ctf_options, function() {});

	// Connect to CLA
	cla_socket = tls.connect(8000, cla_options, function() {});

	// Listener for receiving data from CLA
	cla_socket.addListener('data', function(data) {
		if (data === 'invalidVoter') {
			rl.write('CLA was unable to validate you as a voter.\n');
			rl.close();
		} else if (data === 'votedAlready') {
			rl.write('You have already voted.\n');
			rl.close();
		}

		var dataSplit = data.split('|');
		if (dataSplit[0] === 'vNum') {
			voter.valNum = dataSplit[1];
			voter.idNum = Math.random()*Math.pow(10, 17);

			ctf_socket.write('vote|' + voter.valNum + '|' + voter.idNum + '|' +
					voter.vote);
		}
	});
	cla_socket.addListener('close', function() {
		process.exit(1);
	});
	ctf_socket.addListener('close', function() {
		process.exit(0);
	});

	// Listener for sending/receiving data from CTF
	ctf_socket.addListener('data', function(data) {
		var dataSplit = data.split('|');
		if (dataSplit[0] === 'candidateList') {
			//listener on receiving 'candidateList'
			dataSplit.shift();
			candidates = dataSplit.slice();
			askWhoToVoteFor();
		} else if (dataSplit[0] === 'vote') {
			//listener on sending 'vote'
			rl.write('Your vote has been counted. Here\'s your ' +
					'Identification number: '+ voter.idNum + '\n');
			rl.close();
			process.exit(0);
		}
	});

	cla_socket.setEncoding('utf8');
	ctf_socket.setEncoding('utf8');
}
