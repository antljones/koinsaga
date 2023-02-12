const fs = require('fs');
const net = require('net');
const http = require('http');
const express = require('express');

// http server
const httpHost = '0.0.0.0';
const httpPort = 8080;
const htmldir = '/root/mo/static/html/';
const staticdir = '/root/mo/static/';

// tcp client to message gateway
const mgConnectionPort = 61000;
const mgHost = '127.0.0.1';
var  client = null;

//socket io and http server
const app = express();
var server = null;
const { Server } = require("socket.io");
var io = null;
var socketMap = new Map();

//----------------------------------------------
// http requests
//----------------------------------------------

function start_http_server() {

	server = http.createServer(app);

	app.get('/', (req, res) => {
		res.sendFile(htmldir + 'index.html');
	});

	// need to edit these to only use the file part of req.url
	app.get('/textures/*', (req, res) => {
		res.sendFile(staticdir + req.url);
	});

	app.get('/models/*', (req, res) => {
		res.sendFile(staticdir + req.url);
	});

	app.get('/js/*', (req,res) => {
		res.sendFile(staticdir + req.url);
	})

	app.get('/koin-menu-background.jpg', (req,res) => {
		res.sendFile( staticdir + '/images/koin-menu-background.jpg');
	});

	app.get('/koin-header.jpg', (req,res) => {
		res.sendFile( staticdir + '/images/koin-header.jpg');
	});
	
	app.get('/main.css', (req,res) => {
		res.sendFile( staticdir + '/css/main.css');
	});

	server.listen(httpPort, httpHost, () => {
		console.log('Server is running on http://' + httpHost + ':' + httpPort);
	});

}

//----------------------------------------------
// socket.io setup
// need to handle message response to multiple sockets
//----------------------------------------------

function sendMessageToWebClient(JSONData) {
	socket = socketMap.get(JSONdata.socketId);
	delete JSONData.socket;
	
	socket.emit(JSONdata);
}


function start_websockets_server(messageGatewayClient) { 
	io = new Server(server);

	//-----------------------------------------------
	// Need to handle rejecting multiple connections from the one ipAddress/client
	//-----------------------------------------------
	io.on('connection', (socket) => {
		console.log('a user connected, socket id: ' + socket.id);

		socketMap.set(socket.id, socket);

		socket.on('disconnect', () => {
			console.log('user disconnected');
		});

		socket.on('gamedata', (msg) => {

			mgMessage = JSON.Stringify(msg);
			mgMessage["socketid"] = socket.id;

			if ( messageGatewayClient != null ) {
				messageGatewayClient.write(mgMessage);
			} else {
				console.log('Connection to message gateway not available');
			}
		});

	});
}


//----------------------------------------------
// TCP client handle response from message gateway
//----------------------------------------------
function handle_response(socket, data) {
	var stringAsJSON = JSON.parse(data);
	
	switch(stringAsJSON.response) {

		case "gameEvent":
				delete stringAsJSON.response;
				sendMessageToWebClient(stringAsJSON);
			break;
		case "globalEvent":
				delete stringAsJSON.response;
				//if exists socket json key, delete it
				//also need to delete the socket.id that sent the request if a player triggered a global event
				io.sockets.emit(stringAsJSON);
			break;
		default:
			return '{"gameevent": "unavailable" }';
	}
}


//----------------------------------------------
// TCP client to message gateway 
//----------------------------------------------
function start_message_gateway_client() {
	client = new net.Socket();

	client.connect( mgConnectionPort, mgHost, function() {
		console.log('Connected to message gateway from web server');
	});

	client.on('data', function(data) {
		console.log('Received: ' + data);
		handle_request(data);
	});

	client.on('close', function() {
		console.log('Connection closed');
		client.destroy();
	});

	return client;
}

function shut_message_gateway_client_down() {
	// disconnect the tcp client connection to the message gateway
	if ( client != null ) {
		client.destroy();
	}
}


function stop_message_gateway_client() {
	shut_client_message_gateway_client_down();
}

function stop_websockets_server() {
	//stop incoming connections
	io.close();

	// disconnect each of the existing sockets and discard the low level connection
	socketMap = null;
	io.disconnectSockets(true);

}

function stop_http_server() {

}

const args = process.argv.slice(2);
console.log('args: ', args);

switch ( args[0] ) {
	case 'start':
		console.log('Starting web server');
		start_http_server();
		start_websockets_server( start_message_gateway_client() );
		break;
	case 'stop':
		console.log('Stopping database server');
		stop_message_gateway_client();
		stop_websockets_server();
		break;
	default:
		console.log('Not a valid operation');
}
