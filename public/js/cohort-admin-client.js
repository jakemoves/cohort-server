import Vue from "vue"
require('dotenv').config();

var vm = new Vue({
  el: '#cohort-admin',
  data: {
    events: [],
    selectedEvent: {label: "none"},
    devices: [],
    isCheckedInAsAdmin: false,
    selectedEventIsOpen: false
  },
  methods: {
    onSelectEvent() {
      this.isCheckedInAsAdmin = false
      this.selectedEventIsOpen = false
    }
  }
})

let guid = 12345
let serverURL 
if(process.env = 'development' || 'test'){
  serverURL = 'http://localhost:3000/api'
} else {
  // production
  serverURL = 'https://cohort.rocks/api'
}

fetch(serverURL + '/events', {
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

window.checkInToEventAsAdmin = ($event) => {
  // register this app as an admin device
  fetch(serverURL + '/devices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({ guid: guid, isAdmin: true })
  }).then( response => {
    if(response.status == 200){
      // check in to the event
      fetch(serverURL + '/events/' + vm.selectedEvent.id + '/check-in', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ guid: guid })
      }).then( response => {
        if(response.status == 200){
          vm.isCheckedInAsAdmin = true
          console.log('checked in as admin')
        } else {
          response.text().then( errorText => {
            console.log(errorText)
          })
        }
      })
    } else {
      response.text().then( errorText => {
        console.log(errorText)
      })
    }
  })
}

window.openEvent = ($event) => {
  fetch(serverURL + '/events/' + vm.selectedEvent.id + '/open', {
    method: 'PATCH'
  }).then( response => {
    if(response.status == 200){
      console.log('opened event ' + vm.selectedEvent.label)
      vm.selectedEventIsOpen = true
      openWebSocketConnection()
    } else {
      response.text().then( errorText => {
        console.log(errorText)
      })
    }
  })
}

window.openWebSocketConnection = () => {
  const client = new WebSocket('ws://localhost:3000/sockets')

  client.addEventListener('open', () => {
    console.log('connection open')
    client.send(JSON.stringify({ guid: 12345 }))
  })

  client.addEventListener('message', (message) => {
    const msg = JSON.parse(message.data)
    console.log(msg)
    if(msg.status != null && msg.status != undefined){
      vm.devices = msg.status
    }
  })

  client.addEventListener('close', () => {
    console.log('connection closed')
  })

  client.addEventListener('error', (err) => {
    console.log(err)
  })
}