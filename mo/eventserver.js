#!/usr/bin/node

const net = require('net');
const PicoDB = require('picodb');
const crypto = require('node:crypto');

var eventdb = null;
var server = null;
var clients = [];
const listenPort = 64000;
const host = '127.0.0.1';

//------------------------------------------------------------------------
//
//------------------------------------------------------------------------

function open_databases() {
	eventdb = PicoDB();
}

//------------------------------------------------------------------------
//
//------------------------------------------------------------------------

function insert_data(jsonData) {
	var database = jsonData.database.toString();
}

//-------------------------------------------------------------------------
//
//-------------------------------------------------------------------------

function select_data(jsonData) {
	var database = jsonData.database;
}

//------------------------------------------------------------------------
//
//------------------------------------------------------------------------

function delete_data(jsonData) {
        var database = jsonData.database;
}

function register_events(jsonData) {
	//
}

//------------------------------------------------------------------------
//
//------------------------------------------------------------------------
async function generate_event_id() {
	var randomId = crypto.randomBytes(8).toString('hex');

	const count = await db.count({ eventId: randomId  });

	if ( count > 0 ) {
		generate_event_id();
	} else {
		return randomId;
	}
	//check that the eventid does not already exist in memory or the databases
	
}

//------------------------------------------------------------------------
//
//------------------------------------------------------------------------

function handle_request(data) {

	var stringAsJSON = JSON.parse(data);

	switch(stringAsJSON.request) {
		/* start of the event triggers */
		case "positionupdate":
			/* positionx:
			 * positiony:
			 * positionz:
			 */
			break;
		case "questcompleted":
			break;
		case "addquest":
			break;
		case "zoneentered":
			/* validationserver attackserver*/
			break;
		case "createzone":
			/* zone name: { any, }
			 * zone stataffected {any stat}
			 * zone affectedvalue: { -x to +x }
			 * zone location: {x, y, z}
			 * register with attack server 
			 */
			break;
		case "itemfound":
			break;
		case "itemused":
			/* item class: {common, semicommon, rare, relic} */
			/* item holder: {monster, guild, bossid, characterid} */
			/* item dropchance: {0.01-100.00} */
			break;
		case "dialoguespoken":
			break;
		case "enemydefeated":
			break;
		case "bossdefeated":
			break;
		case "eventidreceived":
			//return the JSON for the event
			break;
		//mental or physical state
		case "characterstatechanged":
			break;
		//stats
		case "characterstatchanged":
			break;
		/* end of the triggers */
		case "geteventidfor":
			return get_event_id(stringAsJSON);
			break;
		case "writeeventdata":
			//add randomly generated events to the timeline db
			break
		case "generaterandomeventnow":
			//construct something from the databases to send to a socket
			return generate_event_id();
			break;
		case "generaterandomeventfortimeline":
			break;
			/*db data*/
			/*{	"character":
			   	"boss":
			   	"music":
			   	"cast":
				"mint":
				"quest":
				"story":
				"dialogue":}*/
		case "generateglobalevent":
			//triggered by admin or server time
			break;

	}

	return '{"databaseState": "operation failed"}';
}


//------------------------------------------------------------------------
//
//------------------------------------------------------------------------

function start_server() {

	net.createServer(function (socket) {
	
		socket.name =  socket.remoteAddress + ":" + socket.remotePort;

		clients.push(socket);

		socket.on('data', function(data) {
			socket.write(handle_request(data));
		});

		socket.on('close', () => {
			console.log('Closed', socket.remoteAddress, 'port', socket.remotePort);
			
		});

		socket.on('end', () => {
			console.log('Stopped Server');
			shut_server_down();
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
	
		console.log('connected to server');
		client.write('end');
		client.end();
	});

}

const args = process.argv.slice(2);
console.log('args: ', args);

switch (args[0]) {
	case 'start':
		console.log('Starting event server');
		open_databases();
		start_server();
		console.log(generate_event_id());
		break;
	case 'stop':
		console.log('Stopping event server');
		stop_server();
		break;
	default:
		console.log('Not a valid operation');
}

