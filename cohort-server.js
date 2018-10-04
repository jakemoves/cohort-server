
const express = require('express');
const bodyParser = require('body-parser')

// configure express

const app = express();
var jsonParser = bodyParser.json();

/*
 * HTTP connections
 */

app.listen(3000, function(err){
	if(err) {
		throw err;
	}

	console.log('http server started on port 3000');
});

app.get('/', function(request, response){
	response.writeHead(200);
	response.write('Cohort rocks!');
	response.send();
});

/*
 * WebSocket connections
 */

const WebSocket = require('ws');

const wsServer = new WebSocket.Server({ port: 8080, clientTracking: true }, () => {
	console.log("websocket server started on port 8080");
});

var expectedConfirmations, actualConfirmations;
var elapsedTimeForBroadcast;

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
// TODO Verify this actually works!!
const interval = setInterval(function ping(){
	console.log("sending keepalive to " + wsServer.clients.size + " clients");
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
	console.log("received pong");
	this.isAlive = true;
}

/* 
 * Apple Push Notifications 
 */

const apn = require('apn')

var registeredDeviceTokens = []

var options = {
	token: {
		key: "AuthKey_6TA7832PAJ.p8",
		keyId: "6TA7832PAJ",
		teamId: "J93D25NHHG"
	}
}

var apnProvider = new apn.Provider(options);

app.post('/register-for-notifications', jsonParser, function(request, response){
	token = request.body.token
	if(token){
		registeredDeviceTokens.push(token)
		response.sendStatus(200)
		console.log("registered device for notifications: " + token)
	} else {
		response.writeHead(400)
		response.write("Error: Request must include a 'token' object")
		response.send()
		console.log("failed to register device for notifications, no token object in request")
	}
})

app.post('/broadcast-push-notification', jsonParser, function(request, response){
	if(request.body != null &&
		request.body.text != null && request.body.text != "" 
		&& request.body.bundleId != null && request.body.bundleId != ""){

		let note = new apn.Notification()
		note.expiry = Math.floor(Date.now() / 1000) + 3600 // 1 hr
		note.badge = 0
		note.sound = "ping.aiff"
		note.alert = request.body.text
		note.payload = { 'messageFrom': 'Cohort Server' }
		note.topic = request.body.bundleId
		
		if(registeredDeviceTokens.length == 0) {
			response.statusCode = 200
			response.write("Request OK but no devices are registered to receive notifications")
			response.send()
			console.log("broadcast attempted but no devices registered")
			return
		} 

		registeredDeviceTokens.forEach((device) => {
			apnProvider.send(note, device).then( (result) => {
				if(result.sent[0].device === device && result.failed.length == 0) { 
					response.statusCode = 200
					response.write("Sent notification to " + registeredDeviceTokens.length + " devices")
					response.send()
					return
				} else {
					response.statusCode = 502
					response.write("failed to send notification to device " + device)
					response.write(JSON.stringify(result.failed))
					response.send()
				}
			})
		})
	} else {
		response.statusCode = 400
		if(request.body.text == null || request.body.text == ""){
			response.write("Error: request must include a 'text' object")
		} else if(request.body.bundleId == null || request.body.bundleId == ""){
			response.write("Error: request must include a 'bundleId' object, corresponding to the target app's bundle identifier")
		}
		response.send()
		console.log("failed to send notification")
	}
})
