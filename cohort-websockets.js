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
    device.socket = socket
    let devices = options.app.get('cohort').devices
    devices.push(device)
    console.log('created new device: ' + devices.length)
  })

  webSocketServer.on('pong', keepalive)

  function keepalive() {
    console.log('received pong')
    this.isAlive = true
  }

  // TODO Verify this actually works!!
  const interval = setInterval(function ping(){
    const devicesWithSockets = options.app.get('cohort').devices.filter((device) => {
      return device.socket != null && typeof device.socket != undefined
    })
    console.log("sending keepalive to " + devicesWithSockets.length + " clients");
    devicesWithSockets.forEach( (device) => {
      if(device.socket.isAlive === false){
        device.socket.terminate().then(device.socket = null)
      } else {
        device.socket.isAlive = false
        device.socket.ping(noop)
      }
    })
  }, 30000)
}