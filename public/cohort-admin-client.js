let guid = 12345
let req = new XMLHttpRequest()
req.open('POST', 'http://localhost:3000/api/devices/create')
req.setRequestHeader('Content-Type', 'application/json')

req.onload = () => {
  console.log(req.responseText)
  switch(req.status){
    case 200: 
      const client = new WebSocket('ws://localhost:3000')

      client.addEventListener('open', () => {
        console.log('connection open')
        client.send(JSON.stringify({ guid: 12345 }))
      })

      client.addEventListener('message', (message) => {
        const msg = JSON.parse(message.data)
        console.log(msg)
        if(msg.status != null && msg.status != undefined){
          let deviceCount = document.getElementsByClassName('connected-devices').item(0)
          deviceCount.innerHTML = msg.status.length

          let deviceList = ""
          let deviceListItems = msg.status.forEach( device => {
            let styleClass = ""
            if(device.webSocketState != WebSocket.OPEN){
              styleClass = ' class="not-connected"'
            }
            deviceList += "<li" + styleClass + ">#" + device.guid + "</li>"
          })
          document.getElementsByClassName('device-list').item(0).innerHTML = deviceList
        }
      })

      client.addEventListener('close', () => {
        console.log('connection closed')
      })

      client.addEventListener('error', (err) => {
        console.log(err)
      })
      break;
    default:
      break;
  }
}

req.send(JSON.stringify( { guid: guid, isAdmin: true }))
