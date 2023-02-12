#!/usr/bin/node

const net = require('net');
const TinyDB = require('tinydb');
const fs = require('fs');


var server = null;
var clients = [];
var databaseMap = new Map();
const listenPort = 60000;
const host = '127.0.0.1';
const dbDir = '/root/mo/data/';

//-------------------------------------------------------------------
//
//-------------------------------------------------------------------

function open_databases() {
	var abilitydb = new TinyDB(dbDir + 'abilities.json');
	var userdb = new TinyDB(dbDir + 'userdetails.json');
	var chardb = new TinyDB(dbDir + 'characters.json');
	var itemdb = new TinyDB(dbDir + 'items.json');
	var storydb = new TinyDB(dbDir + 'story.json');
	var craftdb = new TinyDB(dbDir + 'crafting.json');
	var savedb = new TinyDB(dbDir + 'savedgames.json');
	var eventdb = new TinyDB(dbDir + 'events.json');
	var timelinedb = new TinyDB(dbDir + 'timeline.json');
	var actdb = new TinyDB(dbDir + 'act.json');

	abilitydb.onReady = function() {
		databaseMap.set("abilitydb", abilitydb);
	}

	userdb.onReady = function() {
		databaseMap.set("userdb", userdb);
	}

	chardb.onReady = function() {
		databaseMap.set("chardb", chardb);
	}

	itemdb.onReady = function() {
		databaseMap.set("itemdb", itemdb);
	}

	storydb.onReady = function() {
		databaseMap.set("storydb", storydb);
	}

	craftdb.onReady = function() {
		databaseMap.set("craftdb", craftdb);
	}

	savedb.onReady = function() {
		databaseMap.set("savedb", savedb);
	}

	eventdb.onReady = function () {
		databaseMap.set("eventdb", eventdb);
	}

	timelinedb.onReady = function () {
		databaseMap.set("timelinedb", timelinedb);
	}

	actdb.onReady = function () {
		databaseMap.set("actdb", actdb);
	}

}

//------------------------------------------------------------------------
//
//------------------------------------------------------------------------

function insert_data(jsonData) {
	var database = jsonData.database.toString();

	if ( databaseMap.has(database) ) {
		fs.writeFile("/root/mo/output", jsonData.toString(), function(err) {});
		
		var test = databaseMap.get(database);

		
		test.appendItem(jsonData, function(err, key, value) {
			if (err) {
				console.log(err);
				return '{ "databaseState": "error appending:' + key + ':' + value + '" }';
			}
		
		});

		test.flush();

		return '{ "databaseMapping": "available - check file for written item"}';

	}
	
	console.log('Database not available ' + database)
	
	return '{ "databaseState": "unavailable" }';
}

//-------------------------------------------------------------------------
//
//-------------------------------------------------------------------------

function select_data(jsonData) {
	var database = jsonData.database;
        
	if (databaseMap.contains(database)) {
                jsonOutput = databaseMap.get(database).find(jsonData.query, function(err, key, value) {
                        if (err) {
                                console.log(err);
                                return;
                        }

                        console.log('[getInfo] ' + key + ' : ' + value);

                });

		return jsonOutput;
        } else {
                console.log('Database not available ' + database);
		return '{ "databaseState" : "unavailable" }';
        }

	return '{ "databaseState": "unavailable" }';
}

//------------------------------------------------------------------------
//
//------------------------------------------------------------------------

function delete_data(jsonData) {
        var database = jsonData.database;
        
	if (databaseMap.contains(database)) {
                databaseMap.get(database).remove(where(jsonData.key) == jsonData.value);

                return '{ "databaseState": "available" }';
        } else {
                console.log('Database not available ' + database);
                return '{ "databaseState": "unavailable" }';
        }
	
	return '{ "databaseState": "unavailable" }';


}

//------------------------------------------------------------------------
//
//------------------------------------------------------------------------

function handle_request(data,socket) {

	// need to be able to handle an error on parsing json 
	// as the server crashes without it
	try {
		var stringAsJSON = JSON.parse(data);

		switch(stringAsJSON.request) {

			case "insert":
				return insert_data(stringAsJSON);	
				break;
			case "select":
				return select_data(stringAsJSON);
				break;
			case "delete":
				return delete_data(stringAsJSON);
				break;
			case "shutdown":
				shut_server_down();
			case "closeconnection":
				socket.destroy();
		}
	}
	catch(e) {
		console.log(e);	
	}

	return '{"databaseState": "operation failed"}';
}


//------------------------------------------------------------------------
//
//------------------------------------------------------------------------

function start_server() {

	net.createServer(function (socket) {
	
		socket.on('connect', function() {
			socket.name =  socket.remoteAddress + ":" + socket.remotePort;
			console.log(socket.name);

			clients.push(socket);
		});

		socket.on('data', function(data) {
			console.log('Request from', socket.remoteAddress, 'port', socket.remotePort);

			var response = handle_request(data,socket);

			socket.write(response);
		});

		socket.on('close', () => {
			console.log('Closed', socket.remoteAddress, 'port', socket.remotePort);
			
		});

	}).listen(listenPort);

}


//------------------------------------------------------------------------
//
//------------------------------------------------------------------------

function shut_server_down() {
	if ( clients.length > 0) {
		clients.forEach(client => client.destroy());
	}

	databaseMap.forEach((value,key, databaseMap) => { 
		value.flush()
		console.log('flushed ' + key + 'db data');
	});

	if ( server != null ) {
		server.close( function () {
			console.log('server closed');
		});
	}

}

//-------------------------------------------------------------------------
//
//-------------------------------------------------------------------------

function stop_server() {
	const client = net.createConnection({ port: listenPort}, () => {
	
		console.log('shutdown request received');
		client.write('{"request": "shutdown"}');
	});

}

const args = process.argv.slice(2);
console.log('args: ', args);

switch (args[0]) {
	case 'start':
		try {
			console.log('Starting database server');
			open_databases();
			start_server();
			return 0;
		} catch (e) {
			console.log(e);
			return 1;
		}
		
	case 'stop':
		try {
			console.log('Stopping database server');
			stop_server();
			return 0;
		} catch (e) {
			console.log(e);
			return 1;
		}
	default:
		console.log('Not a valid operation');
}

