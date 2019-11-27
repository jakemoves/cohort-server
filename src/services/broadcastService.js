// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const WebSocket = require('ws')

exports.broadcast = (occasion, cue) => {

  let connectedSockets = occasion.devices
    .filter( device => device.isConnected())
    .map( device => device.socket)

  if(connectedSockets.length < 1){
    return Promise.reject("Error: no devices connected to receive broadcast")
  } 

  // per https://github.com/websockets/ws/issues/617#issuecomment-393396339
	let data = Buffer.from(JSON.stringify(cue)) // no binary
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
      const error = "Error: skipped broadcasting to socket " + socket.cohortDeviceGUID + " due to invalid readyState"

      console.log(error)
      
			return Promise.reject({
        guid: socket.cohortDeviceGUID,
        success: false,
        error: error
      }) // was .resolve() in v1...
		}

		return new Promise( (resolve, reject) => {
			socket._sender.sendFrame(frames, (error) => {
				if(error){
					// catch async socket write errors
					console.log(error)
					return reject({
            guid: socket.cohortDeviceGUID,
            success: false,
            error: error
          })
				}
				resolve({
          guid: socket.cohortDeviceGUID, 
          success: true
        })
			})
		})
	})

	return allSettled(sends)
}

function allSettled(promises) {
  let wrappedPromises = promises.map(p => Promise.resolve(p))
  return Promise.all(wrappedPromises);
}