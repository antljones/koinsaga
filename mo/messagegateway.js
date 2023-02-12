#!/usr/bin/node

const net = require('net');
const fs = require('fs');

var server = null
var clients = [];
const listenPort = 61000;
const host = '127.0.0.1'


const dbListenPort = 60000;
const dbHost = '127.0.0.1';
var dbClient = null;

const asListenPort = 62000;
const asHost = '127.0.0.1';
var asClient = null;

const vsListenPort = 63000;
const vsHost = '127.0.0.1';
//var vsClient = connect_to_validation_server();

const esListenPort = 64000;
const esHost = '127.0.0.1';
var evClient = null;

function connect_to_event_server() {
	const client = new net.Socket();
	
	client.connect(evListenPort, evHost, function() {
		console.log('Connected to event server');
		client.write('{ "test": "connection"}');
		console.log('sent event server test connection message');
	});

	client.on('data', function(data) {
		console.log('Received event server data: ' + data);
	});

	client.on('close', function() {
		console.log('DB connection closed');
		client.destroy();
	});
}

//----------------------------------------------
//
//----------------------------------------------

function connect_to_validation_server() {
}

//----------------------------------------------
//
//----------------------------------------------

function connect_to_db_server() {
	const client = new net.Socket();

	client.connect(dbListenPort, dbHost, function() {
		console.log('Connected to db server');
		client.write('{ "test": "connection"}');
		console.log('sent db test connection message');
	});

	client.on('data', function(data) { 
		console.log('Received db data: ' + data);
	});

	client.on('close', function() {
		console.log('DB connection closed');
		client.destroy();
	});

	return client
}

//--------------------------------------------
//
//--------------------------------------------

function connect_to_attack_server() {
	const client = new net.Socket();

	client.connect(asListenPort, asHost, function() {
		console.log('Connected to attack server');
		client.write('{ "test": "connection"}');
		console.log('sent as test connection message');
	});

	client.on('data', function(data) {
		console.log('Received attack server data: ' + data);

	});

	client.on('close', function() {
		console.log('AS connection closed');
		client.destroy();
	});

	return client;
}

//-------------------------------------------
//
//-------------------------------------------

function processMessage(socket,data) {

	respondToMessage(socket, formulateResponse(JSON.parse(data)) );

}

//-------------------------------------------
//
//-------------------------------------------

function respondToMessage(socket, response) {
	
}


//-------------------------------------------
//
//-------------------------------------------

function formulateResponse(data) {

	gameEvent = JSON.parse(data);

	switch(gameEvent.game_event) {

		case "event":
				evClient.write(data);	
			break;
		case "playmusic":
			break;
		case "musicfinished":
			break;
		case "getinventory":
			break;
		case "additemtoinventory":
			break;
		case "useitem":
			//send the item used to the attack server
			break;
		case "getstory":
			//possibly send the story event to the attack server
			break;
		case "updateposition":
				//send the position to the attack server if the player is in a battle otherwise and send it to the event servers (along with the battle status)
			break:
		case "attack":
			break;
		case "attacked":
			//send the received collision to the attack server
			break;
		case "test":
			//test something e.g. the response on a connection
			break;
		case "randomevent":
			//add a random event from the event server
			break;
		default: //return the empty response object
	}

	return '{}'
}


//--------------------------------------------------
//
//--------------------------------------------------
function start_server() {
	
	net.createServer(function (socket) {

		socket.name = socket.remoteAddress + ':' + socket.remotePort;

		clients.push(socket);

		socket.on('data', function(data) {

			socket.write(formulateRepsonse(data));
		});

		socket.on('close', () => {
			console.log('Closed', socket.remoteAddress, 'port', socket.remotePort);
		});

		socket.on('end', () => {
			console.log('Stopped message gateway');
			shut_server_down();
		});

	}).listen(listenPort);

}


//--------------------------------------------------
//
//--------------------------------------------------

function shut_server_down() {
	if ( clients.length > 0 ) {
		clients.forEach(client => client.destroy());
	}

	if ( server != null ) {
		server.close( function () {
			console.log('message gateway closed');
		});
	}
}


//--------------------------------------------------
//
//--------------------------------------------------

function stop_server() {
	const client = net.createConnection({port: listenPort}, () => {

		console.log('connected to message gateway');
		client.write('end');
		client.end();
	});
}


const args = process.argv.slice(2);
console.log('args: ' + args);

switch(args[0]) {
	case 'start':
	//	dbClient = connect_to_db_server();
		evClient = connect_to_ev_server();
		//asClient = connect_to_attack_server();
		console.log('Starting message gateway');
		start_server();
		break;
	case 'stop':
		console.log('Stopping message gateway');
		stop_server();
		break;
	default:
		console.log('Not a valid operation');
}
