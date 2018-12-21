const apn = require('apn')
const WebSocket = require('ws')

exports.broadcast = (req, res) => {

	let devices = req.app.get('cohort').devices
	if(devices.length < 1) {
		let error = "Warning: No devices are connected, broadcast was not sent"
		sendNoDevicesError(res, error)
		return 
	}

	let connectedSockets = devices
		.filter( (device) => {
			return(device.socket != null && typeof device.socket != undefined)
		})
		.map( (device) => { 
			return device.socket 
		})
		
	if(connectedSockets.length < 1){
		let error = "Warning: No devices are connected via WebSockets, broadcast was not sent"
		sendNoDevicesError(res, error)
		return
	}

	function sendNoDevicesError(res, error){
		res.statusCode = 200
		res.write(error)
		res.send()
	}
	
	// per https://github.com/websockets/ws/issues/617#issuecomment-393396339
	let data = Buffer.from(JSON.stringify(req.body)) // no binary
	let frames = WebSocket.Sender.frame(data, {
		fin: true,
		rsv1: false,
		opcode: 1,
		mask: false,
		readOnly: false
	})

	let sends = connectedSockets.map( (socket) => {

		// skip this client if it's not open
		if(socket.readyState != WebSocket.OPEN) {
			return Promise.resolve()
		}

		return new Promise( (fulfill, reject) => {
			socket._sender.sendFrame(frames, (error) => {
				if(error){
					// catch async socket write errors
					console.log(error)
					return reject(error)
				}
				fulfill()
			})
		})
	})

	Promise.all(sends).then(() => {
		res.statusCode = 200
		res.write('Successfully broadcast to ' + connectedSockets.length + ' clients')
		res.send()
	})
}

exports.broadcast_pushNotification = (req, res) => {
	let devices = req.app.get('cohort').devices

	if(req.body != null 
		&& req.body.text != null && req.body.text != "" 
		&& req.body.bundleId != null && req.body.bundleId != ""){
		
		let note = new apn.Notification()
		
		note.expiry = Math.floor(Date.now() / 1000) + 3600 // 1 hr
		note.badge = 0
		
		if(req.body.sound == null || 
			typeof(req.body.sound) == undefined ||
			req.body.sound == ""){
			note.sound = "ping.aiff"
		} else {
			note.sound = req.body.sound
		}

		if(req.body.mediaURL) {
			note.mutableContent = 1
			note.payload.mediaURL = req.body.mediaURL
		}

		if(req.body.cohortMessage) {
			note.payload.cohortMessage = req.body.cohortMessage
		}

		note.body = req.body.text
		note.payload.messageFrom = 'Cohort Server'
		note.topic = req.body.bundleId
		
		devices = devices.filter((device) => {
			return device.notifications.deviceToken != null
		})

		if(devices.length == 0) {
			res.statusCode = 200
			res.write("Warning: No devices are registered to receive notifications")
			res.send()
			console.log("Error: broadcast attempted but no devices registered")
			return
		} 

		const apnProvider = req.app.get('apnProvider')

		var results = Promise.all(
			devices.map((device) => {
				const token = device.notifications.deviceToken
				if(process.env.NODE_ENV == "test"){
					if(req.body.simulate != null && typeof req.body.simulate != undefined) {
						switch(req.body.simulate){
							case "failure":
								break;
							case "success":
								return Promise.resolve({ sent: [token], failed: [] })
								break;
							case "partial success":
								break;
							default:
							// TODO return a fail, need a simulate setting
								break;
						}
					} else {
						// TODO return a fail, need a simulate setting
					}
				} else {
					return apnProvider.send(note, token)
				}
			})
		).then((results) => {

			let failures = results.filter((result) => { 
				return result.failed.length > 0			
			})

			if(failures.length == devices.length){
				// total failure
				res.statusCode = 502
				res.json({ 
					error: "Error: failed to send notification to any devices",
					results: failures
				})
				res.send()
			} else if(failures.length > 0 && failures.length < devices.length){
				// partial success 
				// TODO manually test
				res.statusCode = 200 // TODO should this really be 200?
				res.json({
					error: "Error: failed to send notification to " + failures.length + "/" + devices.length + " registered devices",
					results: failures
				})
				res.send()
			}  else if(failures.length == 0){
				// no failures...
				// TODO manually test
				let successes = results.filter((result) => { 
					return result.sent.length > 0 
				})
				if (successes.length == devices.length){
					// ... total success!
					res.statusCode = 200
					res.write("Sent notifications to " + successes.length + "/" + devices.length + " registered devices")
					res.send()
				}
			}
		})
	} else {
		res.statusCode = 400
		if(req.body.text == null || req.body.text == ""){
			res.write("Error: request must include a 'text' object")
		} else if(req.body.bundleId == null || req.body.bundleId == ""){
			res.write("Error: request must include a 'bundleId' object, corresponding to the target app's bundle identifier")
		}
		res.send()
		console.log("failed to send notification")
	}
}