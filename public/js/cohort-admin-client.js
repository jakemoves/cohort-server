import Vue from "vue"
import Guid from "uuid/v4"

var vm = new Vue({
  el: '#cohort-admin',
  data: {
    guid: 12345,  // let guid = Guid() // enable this when you implement #48
    events: [{ id: 0, label: "none", isOpen: false}],
    activeEventIndex: 0,
    activeEventDevices: [ ],
    broadcastMessagePlaceholder: '{ "mediaDomain": "sound", \n  "cueNumber": 1, \n  "cueAction": "play" }',
    errorOnBroadcast: false
    // activeEventMediaDomains: [ "sound", "video" ],
    // cueActions: [ "play", "pause", "restart" ]
  },
  created: function() {
    // register this app as an admin device
    fetch(this.serverURL + '/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ guid: this.guid, isAdmin: true })
    }).then( response => {
      if(response.status == 200){
        this.updateEvents()
      } else {
        console.log('error registering this app as an admin device')
      }
    })
  },
  computed: {
    // process.env.NODE_ENV is patched in by webpack based on the mode (dev/prod) provided in the package.json build scripts
    serverURL: function() {
      if(process.env.NODE_ENV == 'development'){
        return 'http://localhost:3000/api'
      } else {
        return 'https://cohort.rocks/api'
      }
    },
    socketURL: function() {
      if(process.env.NODE_ENV == 'development'){
        return 'ws://localhost:3000/sockets'
      } else {
        return 'wss://cohort.rocks/sockets'
      }

    },
    activeEvent: function() {
      return this.events[this.activeEventIndex]
    },
    activeEventIsOpen: function() {
      return this.activeEvent.isOpen
    },
    eventsByLabel: function() {
      let sortedEvents = this.events.sort(function(a, b){
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase())
      })
      return sortedEvents
    }
  },
  methods: {

    updateEvents() {
      // get a list of events
      fetch(vm.serverURL + '/events', {
        method: 'GET'
      }).then( response => {
        if(response.status == 200){
          response.json().then( events => {
            vm.activeEventIndex = 0
            vm.events = events
          })
        } else {
          response.text().then( errorText => {
            console.log(errorText)
          })
        }
      })
    },

    onSelectEvent(eventId) {

      // check in to the event as admin
      fetch(vm.serverURL + '/events/' + eventId + '/check-in', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ guid: vm.guid })
      }).then( response => {
        if(response.status == 200){
          response.json().then( event => {

            // get the event details
            fetch(vm.serverURL + '/events/' + eventId + {
              method: 'GET'
            }).then( response => {
              if(response.status == 200){
                response.json().then( event => {
                  // update the active index
                  vm.activeEventIndex = vm.events.findIndex( event => event.id == eventId)
                })
              } else {
                response.text().then( errorText => {
                  console.log(errorText)
                })
              }
            })
          
          })
        } else {
          response.text().then( errorText => {
            console.log(errorText)
          })
        }
      })
    },

    mediaDomainInputID: function(mediaDomain) {
      return "media-domain-" + mediaDomain
    },

    cueActionInputID: function(cueAction){
      return "cue-action-" + cueAction
    }
  }
})

window.createCohortEvent = ($event) => {
  let eventLabel = document.getElementById('new-event-label').value
  fetch(vm.serverURL + '/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({ label: eventLabel })
  }).then( response => {
    if(response.status == 200){
      vm.updateEvents()
    } else {
      console.log('error creating event')
    }
  })
}

window.deleteCohortEvent = () => {
  let eventId = vm.activeEvent.id
  fetch(vm.serverURL + '/events/' + eventId, {
    method: 'DELETE'
  }).then( response => {
    if(response.status == 200){
      vm.updateEvents()
    } else {
      console.log('error deleting event')
    }
  })
}

window.openEvent = ($event) => {
  fetch(vm.serverURL + '/events/' + vm.activeEvent.id + '/open', {
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
  fetch(vm.serverURL + '/events/' + vm.activeEvent.id + '/close', {
    method: 'PATCH'
  }).then( response => {
    if(response.status == 200){
      console.log('closed event ' + vm.activeEvent.label)

      vm.activeEvent.isOpen = false;
      console.log(vm.activeEvent)
    }
  })
}

window.broadcast = ($event) => {
  $event.preventDefault()
  const messageText = document.getElementById('broadcast-message').value
  try {
    const message = JSON.parse(messageText)
    fetch(vm.serverURL + '/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(message)
    }).then( response => {
      response.text().then( text => {
        console.log(text)
        vm.errorOnBroadcast = false
      })
    })
  } catch (e) {
    console.log(e.message)
    vm.errorOnBroadcast = true
  } 
}


window.openWebSocketConnection = () => {
  const client = new WebSocket(vm.socketURL)

  client.addEventListener('open', () => {
    console.log('connection open')
    client.send(JSON.stringify({ guid: vm.guid }))
  })

  client.addEventListener('message', (message) => {
    const msg = JSON.parse(message.data)
    console.log(msg)
    if(msg.status != null && msg.status != undefined){
      vm.activeEventDevices = msg.status.filter( device => device.guid != vm.guid) 
    }
  })

  client.addEventListener('close', () => {
    console.log('connection closed')
  })

  client.addEventListener('error', (err) => {
    console.log(err)
  })
}