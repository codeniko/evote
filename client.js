#!/usr/bin/node

var tls = require('tls');
var fs = require('fs');

var options = {
	key: fs.readFileSync('keys/ctf-key.pem'),
	cert: fs.readFileSync('keys/ctf-cert.pem')
};

try {
var conn = tls.connect(8000, options, function() {
	if (conn.authorized) {
		console.log("Connection authorized by a Certificate Authority.");
	} else {
		console.log("Connection not authorized: " + conn.authorizationError)
	}
	conn.write("test");
	console.log();
});

} catch(e) {
	console.log(e);
}


conn.on("data", function (data) {
	console.log(data.toString());
	conn.end();
});
