#!/usr/bin/node --enable-ssl3
// #!/usr/local/bin/node

//--enable-ssl3
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
tls = require('tls');
var fs = require('fs');
var Voter = require('./Voter.js');
var HashMap = require('hashmap');

// hashes ssn to Voter
var voterMap = new HashMap();
var voteList = [["bush"], ["gore"], ["obama"], ["niko"]];


var options = {
	key: fs.readFileSync('keys/ctf-key.pem'),
	cert: fs.readFileSync('keys/ctf-cert.pem'),

	// This is necessary only if using the client certificate authentication.
	requestCert: true,

		// This is necessary only if the client uses the self-signed certificate.
	ca: [ fs.readFileSync('keys/cla-cert.pem') ]
};

var ctf_options = {
	key: fs.readFileSync('keys/ctf-key.pem'),
	cert: fs.readFileSync('keys/ctf-cert.pem'),

	// This is necessary only if using the client certificate authentication.
	requestCert: true,

		// This is necessary only if the client uses the self-signed certificate.
	ca: [ fs.readFileSync('keys/client-cert.pem') ]
};


var server = tls.createServer(options, function(socket) {
	console.log('server connected',
			socket.authorized ? 'authorized' : 'unauthorized');
	//socket.write("welcome!\n");
	socket.setEncoding('utf8');
  socket.addListener('data', function(data) {
    //console.log(data);
    received = data.split("|");
    if (received[0] == 'vMapUnit') {
      var voter = new Voter(received[1], received[2], -1);
      voter.valNum = received[3];
      voterMap.set(received[3], voter);

      socket.write('done');
    }
    //console.log(socket);
  });
	socket.pipe(socket);

	//var response = socket.read();
//	console.log(response);
});

var voterServer = tls.createServer(ctf_options, function(socket) {
	console.log('server connected',
			socket.authorized ? 'authorized' : 'unauthorized');
	//socket.write("welcome!\n");
	socket.setEncoding('utf8');
  socket.addListener('data', function(data) {
    //console.log(data);
    received = data.split("|");
    console.log(received);
    if (received[0] == 'vote') {
      if (voterMap.get(received[1]) != undefined) {
        var voter = voterMap.get(received[1]);
        voter.voteFlag = true;
        voter.idNum = received[2];
        voter.vote = received[3];
        for (var i = 0 ; i < voteList.length; i++) {
          if (voteList[i][0] == voter.vote) {
            voteList[i].push(voter.idNum);
          }
        }
      }
      console.log(voteList);
    }
    //console.log(socket);
  });
	socket.pipe(socket);

	//var response = socket.read();
//	console.log(response);
});


server.listen(8001, function() {
	console.log('server bound 8001');
});

voterServer.listen(8002, function() {
	console.log('server bound 8002');
});
