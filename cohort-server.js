
const express = require('express');
const bodyParser = require('body-parser')
const WebSocket = require('ws');

const app = express();
const wsServer = new WebSocket.Server({ port: 8080, clientTracking: true }, () => {
	console.log("websocket server started on port 8080");
});

var expectedConfirmations, actualConfirmations;
var elapsedTimeForBroadcast;

// configure express
var jsonParser = bodyParser.json();

app.get('/', function(request, response){
	response.writeHead(200);
	response.write('Cohort rocks!');
	response.send();
});

app.post('/broadcast', jsonParser, function(request, response){
	elapsedTimeForBroadcast = Date.now();
	const waitForConfirmations = request.body.waitForConfirmations * 1000; // TODO This can be null / undefined, fix it!!!
	wsServer.broadcast(JSON.stringify(request.body.payload));
	response.writeHead(200);
	response.write('sending broadcast...');
	setTimeout(function(){ checkConfirmations(response); }, waitForConfirmations);
});

wsServer.broadcast = function broadcast(message) {
	expectedConfirmations = wsServer.clients.size;
	actualConfirmations = 0;

	// this might be faster?
	// per https://github.com/websockets/ws/issues/617#issuecomment-393396339
	// let data = Buffer.from(message); // only text messages are supported, no binary
	// let frames = WebSocket.Sender.frame(data, {
	// 	fin: true,
	// 	rsv1: false,
	// 	opcode: 1,
	// 	mask: false,
	// 	readOnly: false
	// });

	// return [...wsServer.clients].map( (socket) => {
	// 	// skip this socket if it isn't open
	// 	if(socket.readyState !== WebSocket.OPEN) {
	// 		return promise.resolve();
	// 	}

	// 	return new Promise( (fulfill, reject) => {
	// 		socket._sender.sendFrame(frames, (error) => {
	// 			if(error){ 
	// 				// catch async socket write errors
	// 				console.log(error);
	// 				return reject(error);
	// 			}
	// 			fulfill();
	// 		});
	// 	});
	// });

	wsServer.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(message);
		}
	});

	const elapsedTime = Date.now() - elapsedTimeForBroadcast;
	elapsedTimeForBroadcast = elapsedTime;
};

app.listen(3000, function(err){
	if(err) {
		throw err;
	}

	console.log('http server started on port 3000');
});


wsServer.on('connection', function connection(socket) {
	console.log("new client: " + wsServer.clients.size);
	socket.on('message', function incoming(message) {
		if(message == "confirm-receipt"){
			actualConfirmations++;
		} else {
			console.log('received: %s', message);
		}
	});

	socket.on('close', function close(){
		console.log("client closed, current clients: " + wsServer.clients.size);
	});

	socket.on('pong', keepalive);
});


function checkConfirmations(response){
	// console.log("expected confirmations: " + expectedConfirmations);
	// console.log("actual confirmations: " + actualConfirmations);
	if(expectedConfirmations != actualConfirmations){
		console.log("WARNING: one or more clients may not have received broadcast");
	}
	response.write("\n    ...broadcast took " + elapsedTimeForBroadcast/1000 + "s");
	response.write("\n    ..." + actualConfirmations + "/" + expectedConfirmations + " clients confirmed receipt");
	response.send();
}


// keepalive
const interval = setInterval(function ping(){
	wsServer.clients.forEach(function each(client){
		if(client.isAlive === false) {
			return client.terminate();
		}

		client.isAlive = false;
		client.ping(noop);
	});
}, 30000);

function noop(){}

function keepalive(){
	this.isAlive = true;
}