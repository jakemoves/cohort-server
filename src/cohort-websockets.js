const webSocket = require('ws')
const CHDevice = require('./models/CHDevice')

module.exports = (options) => {

  return new Promise( resolve => {
    let webSocketServer = new webSocket.Server({server: options.server, path: options.path})
    
    webSocketServer.on('listening', () => {
      console.log('websocket server started')
      resolve(webSocketServer)
    })
    
    webSocketServer.on('connection', function connection(socket) {
      console.log('websocket server: new connection')
  
      socket.on('message', (message) => {
        const msg = JSON.parse(message)
        
        // initial message from device with its GUID
        if(msg.guid != null && typeof msg.guid != undefined){
          let matchingDevices = options.app.get('cohort').devices
            .filter((device) => { 
              return device.guid == msg.guid 
            })
  
          if(matchingDevices.length == 1){
            let device = matchingDevices[0]
  
            socket.isAlive = true
            socket.on('pong', keepalive)
     
            device.socket = socket
  
            socket.send(JSON.stringify({ result: "success" }))
            console.log('opened socket for device: ' + msg.guid)
          } else if (matchingDevices.length == 0 ){
            console.log("Error: could not open WebSocket, device not found")
            socket.close(4000, "Devices must be registered via HTTP before opening a WebSocket connection")
          }else if (matchingDevices.length > 1 ){
            console.log("Error: there are devices with identical GUIDs!")
            socket.close(4001)
          }
        }
      })
  
      socket.on('close', (code, reason) => {
        const device = options.app.get('cohort').devices.filter( (device) => {
          return device.socket === socket
        })
        let message = 'closed socket for device ' + device.guid + ' with code ' + code
        if(reason != null){ message += ' | reason: ' + reason }
        console.log(message)
        device.socket = null
      })
  
      socket.on('error', (error) => {
        console.log('socket error for device ' + device.guid + ': ' + error)
      })
    })
    
    // this should probably be triggered to happen by updates to cohort.devices, not on a timer
    const deviceStatus = setInterval( () => {
      let adminDevices = options.app.get('cohort').devices.filter( device => {
        return (device.isAdmin == true && device.socket != null && device.socket != undefined)
      }).map( device => device.socket )

      const status = options.app.get('cohort').devices
        .map( device => {
          let deviceState = { 
            guid: device.guid
          }
          
          if(device.socket != null && device.socket != undefined){
            deviceState.webSocketState = device.socket.readyState
          } else {
            deviceState.webSocketState = null
          }
          
          return deviceState
        })

      adminDevices.forEach( socket => {
        socket.send(JSON.stringify({ status: status }))
      })

    }, 3000)

    const keepaliveInterval = setInterval(function ping(){
  
      const connectedSockets = options.app.get('cohort').devices
        .filter((device) => {
          return device.socket != null && typeof device.socket != undefined
        })
  
      // console.log("sending keepalive to " + connectedSockets.length + " clients");
  
      connectedSockets.forEach( (device) => {
        let socket = device.socket
        if(socket.isAlive === false){
          socket.terminate()
          device.socket = null
        } else {
          socket.isAlive = false
          socket.ping(noop)
        }
      })
    }, 10000)
  
    function noop() {}
    
    function keepalive() {
      // console.log('received pong')
      this.isAlive = true
    }
  })
}