
const express = require('express');
const bodyParser = require('body-parser')
const WebSocket = require('ws');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const wsServer = new WebSocket.Server({ port: 8080, clientTracking: true });

var expectedConfirmations, actualConfirmations;

app.post('/broadcast', function(request, response){
	wsServer.broadcast('ping!');
	response.writeHead(200);
	response.write('received broadcast request');
	response.send();
});

wsServer.broadcast = function broadcast(data) {
	expectedConfirmations = wsServer.clients.size;
	actualConfirmations = 0;

	wsServer.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}

		setTimeout(checkConfirmations, 1000);
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

	ws.send('connection open');

	ws.on('pong', keepalive);
});


function checkConfirmations(){
	console.log("expected confirmations: " + expectedConfirmations);
	console.log("actual confirmations: " + actualConfirmations);
	if(expectedConfirmations != actualConfirmations){
		console.log("WARNING: one or more clients may not have received broadcast");
	}
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