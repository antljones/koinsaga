#!/usr/bin/node

const mgPort = 61000;
const mgServer = '127.0.0.1';
var client = null;
var runningProcess=null;


	//go through 10 random events and see if a "hit" is made and if so, send a message to the message gateway" 
	
	//get the total number of random events from the db
	//generate a random number to pick a random event
	var randomEventNumber = getRandomArbitrary(0,redb.count());	
	console.log(randomEventNumber);
	
	//pick another random number between 1 and 100
	//if the number is less than the percentage, return the random event
	var randomChanceNumber = getRandomArbitrary(0,100);
	console.log(randomChanceNumber);

	

function getRandomArbitrary(min,max) {
	return Math.random() * (max - min) + min;
}

function send_random_event_request() {
	client = net.createConnection({ port: mgPort}, () => {
		client.on('close', function() {
			console.log('Connection closed');
		});
	});

	client.write('{"request": "randomevent"}');
	client.destroy();
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function run_process() {
	while(runningProcess ===1) {
		await sleep(10000);
		if (getRandomArbitrary(0,9) === 9) {
			send_random_event_request();
		}
	}
}

//----------------------------------------------------
//
//----------------------------------------------------
function stop_process() {
	runningProcess=null;
	if ( client != null ) {
		client.destroy();
	}
}

//----------------------------------------------------
//
//----------------------------------------------------
function start_process() {
	runningProcess=1;
	run_process();
}

switch (args[0]) {
	case 'start':
		try {
			console.log('Starting random event process');
			start_process();
			return 0;
		} catch (e) {
			console.log(e);
			return 1;
		}
	case 'stop':
		try {
			console.log('Stopping random event process');
			stop_process();
			return 0;
		} catch {
			console.log(e);
			return 1;
		}
	default:
		console.log('Not a valid operation');
}
