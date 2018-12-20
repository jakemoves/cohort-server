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

}