var tls = require('tls'),
	 fs = require('fs');

var options = {
	key: fs.readFileSync('keys/ctf-key.pem'),
	cert: fs.readFileSync('keys/ctf-cert.pem')
};

var conn = tls.connect(8000, options, function() {
	if (conn.authorized) {
		console.log("Connection authorized by a Certificate Authority.");
	} else {
		console.log("Connection not authorized: " + conn.authorizationError)
	}
	console.log();
});



conn.on("data", function (data) {
	console.log(data.toString());
	conn.end();
});
