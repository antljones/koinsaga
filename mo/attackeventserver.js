#!/usr/bin/node

const net = require('net');
const databaseServerPort = 60000;
const databaseServerIP = '127.0.0.1'

function processAbilityDamage(jsonData) {

	const client = new net.Socket();
	client.connect({ port: databaseServerPort } , host: databaseServerIP , () => {
		client.write('{request: "select", database: "chardb", character: "' + jsonData.character + '" }');
	
	});


	client.on('data', (data) => {
  		console.log(data.toString('utf-8'));
	});
}

function handleRequest(data) {

        requestType=jsonData.request;

        switch(requestType) {

		// an ability was just used	
                case "ability"
                        processAbilityDamage(jsonData);
                break;
		// an item was just used
                case "item"
                        select(jsonData);
                break;
		// 
		case "
        }

}



const server = net.createServer((socket) => {
console.log('Connection from', socket.remoteAddress, 'port', socket.remotePort);

 socket.on('data', (buffer) => {
    console.log('Request from', socket.remoteAddress, 'port', socket.remotePort);
        const requestJSON = buffer.toJSON();
	handleRequest(requestJSON);

	socket.write(`${buffer.toString('utf-8').toUpperCase()}\n`);
  });
  socket.on('end', () => {
    console.log('Closed', socket.remoteAddress, 'port', socket.remotePort);
  });
});

server.maxConnections = 20;
server.listen(598900);







