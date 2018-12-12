// import dependencies
const express = require('express');
const bodyParser = require('body-parser')

require('dotenv').config({path: __dirname + '/.env'})

// configure express
const app = express()
const jsonParser = bodyParser.json()
const routes = require('./routes.js')
app.use(bodyParser.json())
app.use('/api', routes)

// configure cohort
const CHDevice = require('./models/CHDevice')

/*
 * HTTP connections
 */

app.listen(3000, function(err){
	if(err) {
		throw err
	}

	console.log('http server started on port 3000')
	console.log('environment: ' + process.env.NODE_ENV)

	app.set("cohort", {
		devices: []
	})
})

module.exports = app

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
	console.log("new client: " + wsServer.clients.size)
	socket.on('message', function incoming(message) {
		if(message == "confirm-receipt"){
			actualConfirmations++
		} else {
			console.log('received: %s', message)
		}
	})

	socket.on('close', function close(){
		console.log("client closed, current clients: " + wsServer.clients.size);
	})

	socket.on('pong', keepalive)
})

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
		key: process.env.PATH_TO_APNS_KEY + "AuthKey_6TA7832PAJ.p8",
		keyId: "6TA7832PAJ",
		teamId: "J93D25NHHG"
	}
}

var apnProvider = new apn.Provider(options);

// app.post('/device/register-for-notifications', jsonParser, function(request, response){
// 	guid = request.body.guid
// 	token = request.body.token
// 	if(token && guid){
// 		// request is well-formed
// 		var device = devices.filter((device) => {
// 			return device.guid == guid
// 		})
// 		if(device.length < 1 || device == null){
// 			response.statusCode = 400
// 			response.write("Error: no device found with matching GUID: " + guid)
// 			response.send()
// 			console.log("Error: no device found with matching GUID: " + guid)
// 		} else if(device.length > 1){
// 			response.statusCode = 400
// 			response.write("Error: non-unique GUID")
// 			response.send()
// 			console.log("Error: non-unique GUID")
// 		} else {
// 			// we found a single device with a matching GUID
// 			device = device[0]
// 			if(device.notifications.deviceToken == null){
// 				device.notifications.deviceToken = token
// 				response.sendStatus(200)
// 				console.log("registered device for notifications: " + device.guid)
// 			} else {
// 				response.statusCode = 200
// 				response.write("Warning: Device is already registered for notifications")
// 				response.send()
// 			}
// 		}
// 	} else {
// 		response.statusCode = 400
// 		response.write("Error: Request must include 'token' and 'guid' objects")
// 		response.send()
// 		console.log("Error: failed to register device for notifications, request missing token and/or guid")
// 	}
// })

// app.post('/broadcast-push-notification', jsonParser, function(request, response){
// 	let devices = request.app.get('cohort').devices

// 	if(request.body != null &&
// 		request.body.text != null && request.body.text != "" 
// 		&& request.body.bundleId != null && request.body.bundleId != ""){
		
// 		let note = new apn.Notification()
		
// 		note.expiry = Math.floor(Date.now() / 1000) + 3600 // 1 hr
// 		note.badge = 0
		
// 		if(request.body.sound == null || 
// 			typeof(request.body.sound) == undefined ||
// 			request.body.sound == ""){
// 			note.sound = "ping.aiff"
// 		} else {
// 			note.sound = request.body.sound
// 		}

// 		if(request.body.mediaURL) {
// 			note.mutableContent = 1
// 			note.payload.mediaURL = request.body.mediaURL
// 		}

// 		if(request.body.cohortMessage) {
// 			note.payload.cohortMessage = request.body.cohortMessage
// 		}

// 		note.body = request.body.text
// 		note.payload.messageFrom = 'Cohort Server'
// 		note.topic = request.body.bundleId
		
// 		devices = devices.filter((device) => {
// 			return device.notifications.deviceToken != null
// 		})

// 		if(devices.length == 0) {
// 			response.statusCode = 200
// 			response.write("Warning: No devices are registered to receive notifications")
// 			response.send()
// 			console.log("Error: broadcast attempted but no devices registered")
// 			return
// 		} 

// 		var results = Promise.all(
// 			devices.map((device) => {
// 				token = device.notifications.deviceToken
// 				return apnProvider.send(note, token)
// 				//return { 
// 				//	sent: [ "yes" ], 
// 				//	failed: []
// 				//}
// 			})
// 		).then((results) => {
// 			console.log(results)
// 			let failures = results.filter((result) => { 
// 				return result.failed.length > 0			
// 			})

// 			if(failures.length == devices.length){
// 				// total failure
// 				response.statusCode = 502
// 				response.write("")
// 				response.write(JSON.stringify( { 
// 					error: "Error: failed to send notification to any devices",
// 					results: failures
// 				}))
// 				response.send()
// 			} else if(failures.length > 0 && failures.length < devices.length){
// 				// partial success 
// 				// TODO manually test
// 				response.statusCode = 200 // TODO should this really be 200?
// 				response.write(JSON.stringify({
// 					error: "Error: failed to send notification to " + failures.length + "/" + devices.length + " registered devices",
// 					results: failures
// 				}))
// 				response.send()
// 			}  else if(failures.length == 0){
// 				// no failures...
// 				// TODO manually test
// 				let successes = results.filter((result) => { 
// 					return result.sent.length > 0 
// 				})
// 				if (successes.length == devices.length){
// 					// ... total success!
// 					response.statusCode = 200
// 					response.write("Sent notifications to " + successes.length + "/" + devices.length + " registered devices")
// 				}
// 			}
// 		})
// 	} else {
// 		response.statusCode = 400
// 		if(request.body.text == null || request.body.text == ""){
// 			response.write("Error: request must include a 'text' object")
// 		} else if(request.body.bundleId == null || request.body.bundleId == ""){
// 			response.write("Error: request must include a 'bundleId' object, corresponding to the target app's bundle identifier")
// 		}
// 		response.send()
// 		console.log("failed to send notification")
// 	}
// })