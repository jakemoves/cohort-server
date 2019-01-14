import Vue from "vue"
import Guid from "uuid/v4"

var vm = new Vue({
  el: '#cohort-admin',
  data: {
    guid: 12345,
    events: [ { id: 0, label: "none", isOpen: false, devices: [] }],
    activeEventIndex: 0
  },
  computed: {
    activeEvent: function() {
      return this.events[this.activeEventIndex]
    },
    activeEventIsOpen: function() {
      return this.activeEvent.isOpen
    },
    isCheckedInAsAdmin: function() {
      let isAdminOnEvent = false
      if(this.activeEvent.devices) {
        if(this.activeEvent.devices.find( device => device.guid == this.guid)) {
          isAdminOnEvent = true
        }
      }
      return isAdminOnEvent
    }
  },
  methods: {
    onSelectEvent(eventId) {
      fetch(serverURL + '/events/' + eventId + {
        method: 'GET'
      }).then( response => {
        if(response.status == 200){
          response.json().then( event => {
            vm.activeEventIndex = vm.events.findIndex( event => event.id == eventId)
            vm.events[vm.activeEventIndex] = event
          })
        } else {
          response.text().then( errorText => {
            console.log(errorText)
          })
        }
      })
    }
  }
})

let guid = 12345
// let guid = Guid() // enable this when you implement #48

// process.env.NODE_ENV is patched in by webpack based on the mode (dev/prod) provided in the package.json build scripts

let serverURL, socketURL
if(process.env.NODE_ENV == 'development'){
  serverURL = 'http://localhost:3000/api'
  socketURL = 'ws://localhost:3000/sockets'
} else {
  serverURL = 'https://cohort.rocks/api'
  socketURL = 'wss://cohort.rocks/sockets'
}

fetch(serverURL + '/events', {
  method: 'GET'
}).then( response => {
  if(response.status == 200){
    response.json().then( events => {
      vm.events = events
      console.log(events)
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
    body: JSON.stringify({ guid: vm.guid, isAdmin: true })
  }).then( response => {
    if(response.status == 200){
      // check in to the event
      fetch(serverURL + '/events/' + vm.activeEvent.id + '/check-in', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ guid: vm.guid })
      }).then( response => {
        if(response.status == 200){
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
  fetch(serverURL + '/events/' + vm.activeEvent.id + '/open', {
    method: 'PATCH'
  }).then( response => {
    if(response.status == 200){
      console.log('opened event ' + vm.activeEvent.label)
      openWebSocketConnection()
      vm.activeEvent.isOpen = true;
    }
  })
}

window.closeEvent = ($event) => {
  fetch(serverURL + '/events/' + vm.activeEvent.id + '/close', {
    method: 'PATCH'
  }).then( response => {
    if(response.status == 200){
      console.log('closed event ' + vm.activeEvent.label)

      vm.activeEvent.isOpen = false;
      console.log(vm.activeEvent)
    }
  })
}


window.openWebSocketConnection = () => {
  const client = new WebSocket(socketURL)

  client.addEventListener('open', () => {
    console.log('connection open')
    client.send(JSON.stringify({ guid: vm.guid }))
  })

  client.addEventListener('message', (message) => {
    const msg = JSON.parse(message.data)
    console.log(msg)
    if(msg.status != null && msg.status != undefined){
      vm.activeEvent.devices = msg.status
    }
  })

  client.addEventListener('close', () => {
    console.log('connection closed')
  })

  client.addEventListener('error', (err) => {
    console.log(err)
  })
}