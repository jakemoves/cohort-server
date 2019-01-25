const webSocket = require('ws')
// const CHDevice = require('./models/CHDevice')

module.exports = (options) => {

  return new Promise( resolve => {
    let webSocketServer = new webSocket.Server({server: options.server, path: options.path, clientTracking: true})
    
    const keepaliveInterval = setInterval(function ping(){
      // console.log('keepaliveInterval(), ' + webSocketServer.clients.size + ' clients attached')

      webSocketServer.clients.forEach( (socket) => {
        if(socket.isAlive === false){
          console.log('terminating nonresponsive socket ' + socket.cohortDeviceGUID)
          socket.terminate()
          
          return
        } else {
          socket.isAlive = false
          socket.ping(noop)
        }
      })
    }, 5000)

    webSocketServer.on('listening', () => {
      console.log('   websocket server started')
      resolve(webSocketServer)
    })
    
    webSocketServer.on('connection', function connection(socket) {
      socket.isAlive = true
      socket.on('pong', keepalive)

      console.log('websocket server: new connection')
      socket.on('message', (message) => {
        let msg

        // validate JSON
        try {
          msg = JSON.parse(message)
        } catch(error) {
          console.log("Error: received invalid JSON in message from client: " + error.message)
          socket.send(JSON.stringify({ error: "message is not valid JSON (" + error.message + ")" }))
          return
        }

        // handle initial handshake with device
        if(socket.cohortDeviceGUID === undefined || 
           socket.cohortDeviceGUID == null){
          
          if(msg.guid == null || msg.guid === undefined ||
             msg.eventId == null || msg.eventId === undefined){
          
            console.log("Error: first message from client must include fields 'guid' and 'eventId'")
            socket.close(4003, "First message from client must include fields 'guid' and 'eventId'")
            return
          }
          
          let event = options.app.get('cohort').events
            .find( event => event.id == msg.eventId)
      
          if(event === undefined){
            console.log('Error: closing socket on handshake, no open event found with id:' + msg.eventId)
            socket.close(4002, 'No open event found with id:' + msg.eventId)
            return 
          }

          let device = event.devices.find( device => device.guid == msg.guid)

          if(device === undefined){
            console.log("Error: could not open WebSocket, device guid:" + msg.guid + " not found")
            socket.close(4000, "Devices must be registered via HTTP before opening a WebSocket connection")
            return 
          }

          // happy path
          console.log("completing initial handshake with device guid:" + device.guid)
          socket.cohortDeviceGUID = device.guid

          device.socket = socket
          
          device.socket.send(JSON.stringify({ response: "success" }))

          event.broadcastDeviceStates() // eventually this should get triggered by a deviceStatesDidChange event bubbled up from CHDevice... I think?
        }
      })

      socket.on('close', (code, reason) => {
        let device = options.app.get('cohort').allDevices()
          .find( device => socket.cohortDeviceGUID == device.guid)

        if(device === undefined) {
          // throw new Error("closed socket did not have a cohortDeviceGUID property")
          options.app.get('cohort').errors.push('Error: Could not find device for closed socket')
          console.log('Error: Could not find device for closed socket')
          return
        }
        console.log('closing socket for device ' + device.guid)
        device.socket = null
        
        // send an update to events that this socket was connected to
        const eventsWithDevice = options.app.get('cohort').events
        .filter( event => {
          if(event.devices.find( 
            deviceOnEvent => device.guid == deviceOnEvent.guid
          ) !== undefined){ 
            // the device which closed its socket is checked in to this event
            return event
          }
        })
        
        eventsWithDevice.forEach( event => {
          event.broadcastDeviceStates() // eventually this should get triggered by a deviceStatesDidChange event bubbled up from CHDevice... I think?
        })
      })

      socket.on('error', (error) => {
        // console.log('socket error for device ' + device.guid + ': ' + error)
        console.log(error)
      })
    })

    function noop() {}
    
    function keepalive() {
      // console.log('keepalive called from pong for socket ' + this.cohortDeviceGUID)
      this.isAlive = true
    }
  })
}