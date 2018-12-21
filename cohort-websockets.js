const webSocket = require('ws')
const CHDevice = require('./models/CHDevice')

module.exports = (options) => {

  let webSocketServer = new webSocket.Server({server: options.server})

  webSocketServer.on('listening', () => {
    console.log('websocket server started')
    options.callback()
  })

  webSocketServer.on('connection', function connection(socket) {
    console.log('websocket server: new connection')

    let device = new CHDevice()

    socket.isAlive = true
    socket.on('pong', keepalive)

    socket.on('close', (code, reason) => {
      let message = 'closed socket for device ' + device.guid + ' with code ' + code
      if(reason != null){ message += ' | reason: ' + reason }
      console.log(message)
      device.socket = null
    })

    socket.on('error', (error) => {
      console.log('socket error for device ' + device.guid + ': ' + error)
    })
    
    device.socket = socket
    let devices = options.app.get('cohort').devices
    devices.push(device)
    console.log('created new device: ' + devices.length)
  })

  const interval = setInterval(function ping(){

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

}