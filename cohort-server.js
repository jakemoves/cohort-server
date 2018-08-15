
const express = require('express');
const bodyParser = require('body-parser')
const WebSocket = require('ws');

const app = express();
const wsServer = new WebSocket.Server({ port: 8080, clientTracking: true }, () => {
	console.log("websocket server started on port 8080");
});

var expectedConfirmations, actualConfirmations;

// configure express
var jsonParser = bodyParser.json();

app.get('/', function(request, response){
	response.writeHead(200);
	response.write('Cohort rocks!');
	response.send();
});

app.post('/broadcast', jsonParser, function(request, response){
	const waitForConfirmations = request.waitForConfirmations * 1000;
	wsServer.broadcast(JSON.stringify(request.body.payload));
	response.writeHead(200);
	response.write('sending broadcast...');
	setTimeout(function(){ checkConfirmations(response); }, waitForConfirmations);
});

wsServer.broadcast = function broadcast(data) {
	expectedConfirmations = wsServer.clients.size;
	actualConfirmations = 0;

	wsServer.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};

app.listen(3000, function(err){
	if(err) {
		throw err;
	}

	console.log('http server started on port 3000');
});


wsServer.on('connection', function connection(ws) {
	console.log("new client: " + wsServer.clients.size);
	ws.on('message', function incoming(message) {
		if(message == "confirm-receipt"){
			actualConfirmations++;
		} else {
			console.log('received: %s', message);
		}
	});

	ws.on('close', function close(){
		console.log("client closed, current clients: " + wsServer.clients.size);
	});

	ws.on('pong', keepalive);
});


function checkConfirmations(response){
	// console.log("expected confirmations: " + expectedConfirmations);
	// console.log("actual confirmations: " + actualConfirmations);
	if(expectedConfirmations != actualConfirmations){
		console.log("WARNING: one or more clients may not have received broadcast");
	}

	response.write("\n    ..." + actualConfirmations + "/" + expectedConfirmations + " clients confirmed receipt");
	response.send();
}


// keepalive
const interval = setInterval(function ping(){
	wsServer.clients.forEach(function each(client){
		if(client.isAlive === false) {
			return ws.terminate();
		}

		client.isAlive = false;
		client.ping(noop);
	});
}, 30000);

function noop(){}

function keepalive(){
	this.isAlive = true;
}