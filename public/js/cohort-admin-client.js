var vm = new Vue({
  el: '#cohort-admin',
  data: {
    events: []
  }
})

let guid = 12345

fetch('http://localhost:3000/api/events', {
  method: 'GET'
}).then( response => {
  if(response.status == 200){
    response.json().then( events => {
      vm.events = events
    })
  } else {
    response.text().then( errorText => {
      console.log(errorText)
    })
  }
})

// fetch('http://localhost:3000/api/devices', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json'},
//   body: JSON.stringify({ guid: guid })
// }).then( res => {
//   if(res.status == 200){
    
//   } else {
//     throw new Error(res.status + ": " + res.text)
//   }
// })

// let req = new XMLHttpRequest()
// req.open('POST', 'http://localhost:3000/api/devices')
// req.setRequestHeader('Content-Type', 'application/json')

// req.onload = () => {
//   switch(req.status){
//     case 200: 
//       let checkInReq = new XMLHttpRequest()
//       checkInReq.open('PATCH', 'http://localhost:3000/api/events/1/check-in')
//       checkInReq.setRequestHeader('Content-Type', 'application/json')
//       checkInReq.onload = () => {
//         // this admin device is checked in for event 1
//         // const client = new WebSocket('ws://localhost:3000')

//         // client.addEventListener('open', () => {
//         //   console.log('connection open')
//         //   client.send(JSON.stringify({ guid: 12345 }))
//         // })

//         // client.addEventListener('message', (message) => {
//         //   const msg = JSON.parse(message.data)
//         //   console.log(msg)
//         //   if(msg.status != null && msg.status != undefined){
//         //     // vm.devices = msg.status
//         //   }
//         // })

//         // client.addEventListener('close', () => {
//         //   console.log('connection closed')
//         // })

//         // client.addEventListener('error', (err) => {
//         //   console.log(err)
//         // })
//       }
//       checkInReq.send(JSON.stringify({ guid: guid }))
//       break;

//     default:
//       break;
//   }
// }

// req.send(JSON.stringify({ guid: guid, isAdmin: true }))
