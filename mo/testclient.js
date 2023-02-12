var net = require('net');

var dbconnectionPort = 60000;
var dbHost = '127.0.0.1';

var mgConnectionPort = 61000;

var evHost = '127.0.0.1';
var evConnectionPort = 64000;

const client = new net.Socket();
//-------------------
// database server
//-------------------

/* client.connect(dbconnectionPort, dbHost, function() {
	console.log('Connected');
	client.write('{"request": "insert", "database": "abilitydb" ,"item": {"name": "testability"} }');
	console.log('sent request');
});*/

client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy();
});

client.on('close', function() {
	console.log('Connection closed');
});

//--------------------
// message gateway
// -------------------

//--------------------
// event server
//--------------------

client.connect(evConnectionPort, evHost, function() {
	console.log('connected to ev server)');
	client.write('{"request": "generaterandomeventnow"}');
	console.log('sent request to ev server');
});



