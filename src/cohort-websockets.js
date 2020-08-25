// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const webSocket = require('ws')

const CHDevice = require('./models/CHDevice.js')
const { upperFirst, delay } = require('lodash')

module.exports = (options) => {

  return new Promise( (resolve, reject) => {
    console.log('   creating websocket server')
    let webSocketServer = new webSocket.Server({server: options.server, path: options.path, clientTracking: true}, (err) => {
      console.log(err)
      reject(err)
    })
    
    // this adjustability is here for testing only. using short (5000 ms) values in production can cause problems with clients on cellular connections.
    if(options.keepaliveIntervalDuration === undefined) {
      options.keepaliveIntervalDuration = 25000
    }

    const keepaliveInterval = setInterval(function ping(){
      console.log('keepaliveInterval(), ' + webSocketServer.clients.size + ' clients attached')

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
    }, options.keepaliveIntervalDuration)

    webSocketServer.on('listening', () => {
      console.log('   websocket server started')
      resolve(webSocketServer)
    })
    
    webSocketServer.on('connection', function connection(socket) {
      socket.isAlive = true
      socket.on('pong', keepalive)

      console.log('websocket server: new connection')

      // if the socket hasn't completed a handshake within one second, we should close it
      closeSocket = setTimeout(() => {
        if(socket.cohortDeviceGUID == null || socket.cohortDeviceGUID === undefined ){
          socket.close(4004, "Error: cohort handshake not completed within time limit")
        }
      }, 1000)

      socket.on('message', async (message) => {
        let msg

        // validate JSON
        try {
          msg = JSON.parse(message)
        } catch(error) {
          console.log("Error: received invalid JSON in message from client: " + error.message)
          socket.send(JSON.stringify({ error: "message is not valid JSON (" + error.message + ")" }))
          return
        }

        // hacky endpoint for status updates for admin site
        if(msg.action == 'request_device_states'){
          let occasion = options.app.get('cohortSession').openOccasions
            .find( occasion => occasion.id == msg.occasionId)
          if(occasion === undefined){
            return
          }
          const deviceStates = occasion.deviceStates()

          const payload = {
            dataIdentifier: "device_states",
            data: deviceStates
          }

          const jsonPayload = JSON.stringify(payload)
          socket.send(jsonPayload)
          return
        }

        // hacky endpoint for status updates for clients
        if(msg.action == "client_ping"){
          if(msg.clientGuid === undefined){
            return
          }
          const payload = {
            dataIdentifier: "client_pong",
            clientGuid: msg.clientGuid
          }
          const jsonPayload = JSON.stringify(payload)
          socket.send(jsonPayload)
          return
        }

        // handle initial handshake with device
        if(socket.cohortDeviceGUID === undefined || 
           socket.cohortDeviceGUID == null){
          
          if(msg.guid == null || msg.guid === undefined ||
             msg.occasionId == null || msg.occasionId === undefined ){
          
            console.log("Error: first message from client must include fields 'guid' and 'occasionId'")
            socket.close(4003, "Error: first message from client must include fields 'guid' and 'occasionId'")
            return
          }
          
          let occasion = options.app.get('cohortSession').openOccasions
            .find( occasion => occasion.id == msg.occasionId)
          
          if(occasion === undefined){
            console.log('Error: closing socket on handshake, no open occasion found with id:' + msg.occasionId)
            socket.close(4002, 'Error: No open occasion found with id:' + msg.occasionId)
            return
          }

          let device = occasion.devices.find( device => device.guid == msg.guid)
          
          

          if(device !== undefined){
            console.log("device " + device.guid + " is opening a new socket connection")
            device.socket.close(4000, "Switching device to new socket")
            // console.log("Error: could not open WebSocket, device guid:" + msg.guid + " is already connected over WebSockets")
            // socket.close(4000, "Error: The device with guid:" + msg.guid + " is already connected over WebSockets")
            await delay(250) // for socket close & teardown, might not be enough
            device.socket = null
          } else {
            device = new CHDevice(msg.guid, false)
          }

          // happy path
          console.log("completing initial handshake with device guid:" + msg.guid)

          socket.cohortDeviceGUID = device.guid

          device.addSocket(socket)

          occasion.addDevice(device)

          // if(device.socket != null){
          //   device.socket.isAlive = false
          //   device.socket.close(4001, "Device opened a new socket")
          // }
          
          device.socket.send(JSON.stringify({ response: "success" }))

          // event.broadcastDeviceStates() // eventually this should get triggered by a deviceStatesDidChange event bubbled up from CHDevice... I think?
        }
      })

      socket.on('close', (code, reason) => {
        const failedHandshakeErrorCodes = new Set([4004, 4003, 4002])
        if(failedHandshakeErrorCodes.has(code)){ return } // no further action necessary

        // let device = options.app.get('cohortSession').allDevices()
        //   .find( device => socket.cohortDeviceGUID == device.guid)
        
        // if(device === undefined) {
        //   // throw new Error("closed socket did not have a cohortDeviceGUID property")
        //   options.app.get('cohortSession').errors.push('Error: Could not find device for closed socket')
        //   console.log('Error: Could not find device for closed socket')
        //   return
        // }
        
        // console.log('closing socket for device ' + device.guid)
        // device.socket = null
        
        // // send an update to events that this socket was connected to
        // const eventsWithDevice = options.app.get('cohortSession').events
        // .filter( event => {
        //   if(event.devices.find( 
        //     deviceOnEvent => device.guid == deviceOnEvent.guid
        //   ) !== undefined){ 
        //     // the device which closed its socket is checked in to this event
        //     return event
        //   }
        // })
        
        // eventsWithDevice.forEach( event => {
        //   event.broadcastDeviceStates() // eventually this should get triggered by a deviceStatesDidChange event bubbled up from CHDevice... I think?
        // })
      })

      socket.on('error', (error) => {
        // console.log('socket error for device ' + device.guid + ': ' + error)
        console.log(error)
      })
    })

    function noop() {}
    
    function keepalive() {
      console.log('keepalive called from pong for socket ' + this.cohortDeviceGUID)
      this.isAlive = true
    }

    const delay = function(time){ // time in ms
      return new Promise( resolve => setTimeout(resolve, time))
    }

    // this is here because when running tests, webSocketServer.on('listening') doesn't fire
    if(options.server.listening) {
      resolve(webSocketServer)
    }
  })
}
