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

var db = [{'ssn':123, 'name':'niko'},{'ssn':1234, 'name':'joyce'}];


var options = {
	key: fs.readFileSync('keys/cla-key.pem'),
	cert: fs.readFileSync('keys/cla-cert.pem'),

	// This is necessary only if using the client certificate authentication.
	requestCert: true,

		// This is necessary only if the client uses the self-signed certificate.
	ca: [ fs.readFileSync('keys/client-cert.pem') ]
};

//code for CLA connecting to CTF
var cla_ctf_options = {
	key: fs.readFileSync('keys/cla-key.pem'),
	cert: fs.readFileSync('keys/cla-cert.pem'),

	// This is necessary only if using the client certificate authentication.
	requestCert: true,

		// This is necessary only if the client uses the self-signed certificate.
	ca: [ fs.readFileSync('keys/ctf-cert.pem') ]
};


var received;
var validationNum;
var voter;
var voterSocket;
var server = tls.createServer(options, function(socket) {
  voterSocket = socket;
	console.log('server connected',
			socket.authorized ? 'authorized' : 'unauthorized');
	//socket.write("welcome!\n");
	socket.setEncoding('utf8');
  socket.addListener('data', function(data) {
    //console.log(data);
    received = data.split("|");
    console.log(received);
    if (received[0] == 'auth') {
      voter = new Voter(received[1], received[2], -1);
      validationNum = Math.random()*Math.pow(10, 16) + "";
      console.log(validationNum);
      voter.valNum = validationNum;
      voterMap.set(received[1], voter);
      cla_ctf_socket.write('vMapUnit|'+ voter.ssn()+ '|' + voter.name() + "|" +
          voter.valNum);
      
    }
    //console.log(socket);
  });
	socket.pipe(socket);

	//var response = socket.read();
//	console.log(response);
});

server.listen(8000, function() {
	console.log('server bound');
});





var cla_ctf_socket = tls.connect(8001, cla_ctf_options, function() {
});
  cla_ctf_socket.addListener('data', function(data) {
     
    if (data == 'done') {
      console.log("cla received done from ctf");
      voterSocket.write('vNum|' + voter.valNum);
    }
    //console.log(socket);
  });
