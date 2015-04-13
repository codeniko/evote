process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
var tls = require('tls');
var fs = require('fs');
var Voter = require('./Voter.js');
var HashMap = require('hashmap');
var faker = require('./faker.js');

var voterMap = new HashMap(); // hashes validation numbers to Voters
var voteList = []; // contains vote tallies

fs.readFile('data/candidates.db', function(err, data) {
	if (err) throw err;
	var array = data.toString().split('\n');
	for (i in array) {
		if (array[i] != '') {
			voteList.push([array[i]]);
		}
	}
	console.log(voteList);
});




// =============Socket related code below==============
var cla_options = {
	key: fs.readFileSync('keys/ctf-key.pem'),
	cert: fs.readFileSync('keys/ctf-cert.pem'),

	// This is necessary only if using the client certificate authentication.
	requestCert: true,

		// This is necessary only if the client uses the self-signed certificate.
	ca: [ fs.readFileSync('keys/cla-cert.pem') ]
};

var client_options = {
	key: fs.readFileSync('keys/ctf-key.pem'),
	cert: fs.readFileSync('keys/ctf-cert.pem'),

	// This is necessary only if using the client certificate authentication.
	requestCert: true,

		// This is necessary only if the client uses the self-signed certificate.
	ca: [ fs.readFileSync('keys/client-cert.pem') ]
};


var server = tls.createServer(cla_options, function(socket) {
	console.log('CLA service connected to us (CTF) ',
			socket.authorized ? 'authorized' : 'unauthorized');
	socket.setEncoding('utf8');
	socket.addListener('data', function(data) {
		var dataSplit = data.split('|');
		//add voter record with validation num to hashmap from CLA
		if (dataSplit[0] === 'vMapUnit') {
			var voter = new Voter(dataSplit[1], dataSplit[2]);
			voter.valNum = dataSplit[3];
			voterMap.set(dataSplit[3], voter);

			socket.write('done');
			console.log('CLA updated our validation map, validation number: ' +
					voter.valNum+' -> '+voter.name());
		}
	});
	socket.pipe(socket);
});

var voterServer = tls.createServer(client_options, function(socket) {
	console.log('Client connected to us (CTF) ',
			socket.authorized ? 'authorized' : 'unauthorized');
	socket.setEncoding('utf8');
	socket.addListener('data', function(data) {
		if (data === 'getCandidateList') {
			var candList = undefined;
			for (candIndex in voteList) {
				candList = (candList === undefined)
					? candList = voteList[candIndex][0]
					: candList = candList + '|' + voteList[candIndex][0];
			}
			console.log('Received candidate list request from Client.');
			socket.write('candidateList|' + candList);
			return;
		}

		var dataSplit = data.split('|');
		if (dataSplit[0] === 'vote') {
			var voter = voterMap.get(dataSplit[1]);
			if (voter != undefined && voter.voteFlag === false) {
				voter.voteFlag = true;
				voter.idNum = dataSplit[2];
				voter.vote = dataSplit[3];
				for (var i = 0 ; i < voteList.length; i++) {
					if (voteList[i][0] === voter.vote) {
						voteList[i].push(voter.idNum);
					}
				}
				console.log(voteList);
				console.log('Client ID '+voter.idNum+' voted for '+voter.vote);
			} else {
				console.log('Received a vote from a false validation number or' +
						' from someone who already voted. Not counting it.');
			}
		}
	});
	socket.pipe(socket);
});


server.listen(8001, function() {
	console.log('CTF service listening on port 8001 for CLA');
});

voterServer.listen(8002, function() {
	console.log('CTF service listening on port 8002 for Clients');
});
