var net = require('net');
var fs = require('fs');

var dbconnectionPort = 60000;
var dbHost = '127.0.0.1';

const client = new net.Socket();

var JSONFileMap = new Map();

//-------------------
// database server
//-------------------

client.connect(dbconnectionPort, dbHost, function() {
	console.log('Connected');
});

client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy();
});

client.on('close', function() {
	console.log('Connection closed');
});
//---------------------
// JSON Files and db mapping
//---------------------

JSONFileMap.set("chardb", "/root/mo/seed/characters.json");

function check_javascript_fine(JSONData) {
	try {
		JSON.parse(JSONData); 
		console.log('javascript fine');
	} catch (e) {
		console.log(e);
	}
}

//---------------------
// Read all lines from file into a variable
//---------------------
function read_all_lines_from_file(fileName) {
	console.log(fileName);
	return fs.readFileSync(fileName, 'utf8');
}


//---------------------
// Write Files To DB
//---------------------

JSONFileMap.forEach( (value,key) => {
	var data = read_all_lines_from_file(value);

	check_javascript_fine(data);
	client.write('{"request": "insert", "database": "' + key + '", "item": ' + data + '}');
	client.write('{"request": "closeconnection"}');
	console.log('sent request' + key);
});

