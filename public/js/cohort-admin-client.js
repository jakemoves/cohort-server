import Vue from "vue"
import Guid from "uuid/v4"
import 'bootstrap'
import moment from 'moment'

var vm = new Vue({
  el: '#cohort-admin',
  data: {
    guid: 12345,  // let guid = Guid() // enable this when you implement #48
    clientSocket: { readyState: 0 },
    events: [ { id: 0, label: "no events", state: 'closed'} ],
    nullEvent: { id: 0, label: "no events", state: 'closed' }, 
    nullEventLabel: "no events", // duplication is required to avoid many ugly things
    activeEventIndex: 0,
    activeEventDevices: [ ],
    activeEventOccasions: [ ],
    broadcastMessagePlaceholder: '{ "mediaDomain": "sound", \n  "cueNumber": 1, \n  "cueAction": "play" }',
    errorOnBroadcast: false,
    userDidSelectEvent: false,
    occasionFormIsCollapsed: true,
    // activeEventMediaDomains: [ "sound", "video" ],
    // cueActions: [ "play", "pause", "restart" ]
    eventActionsAndEpisodes: {
      'FluxDelux': {
        'episodeActions': [ 
          {'load': 'primary'},  // values used for bootstrap classes
          {'go': 'success'}, 
          {'stop': 'danger'} 
        ],
        'episodeNames': [
          { "label": 'Simple Flux', 'id': 1 },
          { "label": 'Corners',  'id': 2 },
          { "label": 'Ship', 'id': 3 },
          { "label": 'Chip Melt', 'id': 4 },
          { "label": 'Orbitals', 'id': 5 },
          { "label": 'Hula Lasso', 'id': 6 },
          { "label": 'Ship Together', 'id': 7 },
          { "label": 'Chip Melt Together', 'id': 8 }
        ]
      }
    },
    selectedFluxDeluxEpisode: null
  },
  created: function() {
    if(document.getElementById('cohort-admin')){
      console.log('starting cohort admin page vue instance')
      // register this app as an admin device
      fetch(this.serverURL + '/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ guid: this.guid, isAdmin: true })
      }).then( response => {
        if(response.status == 200 /* this device already exists */ || 
          response.status == 201 /* created this device */ ){
          this.updateEvents().then( () => { // vue shows the event as active (selected) but we don't want it to until the user clicks on it
            let activeEventEl = document.getElementsByClassName('event-list__event-item active')[0]
            if(activeEventEl !== undefined){
              activeEventEl.classList.remove('active')
            }
          })
        } else {
          console.log('error registering this app as an admin device')
          response.text().then( error => {
            console.log(error)
          })
        }
      })
    }
  },
  computed: {
    // process.env.NODE_ENV is patched in by webpack based on the mode (dev/prod) provided in the package.json build scripts
    serverURL: function() {
      if(process.env.NODE_ENV == 'development'){
        return 'http://localhost:3000/api/v1'
      } else {
        return 'https://cohort.rocks/api/v1'
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
      return this.activeEvent.state != 'closed'
    },
    eventsByLabel: function() {
      let sortedEvents = this.events.sort(function(a, b){
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase())
      })
      return sortedEvents
    },
    activeEventDevicesByConnectionState: function() {
      let sortedDevices = this.activeEventDevices
      .sort(function(a, b){
        return a.socketOpen - b.socketOpen
      }).reverse()
      return sortedDevices
    }
  },
  methods: {

    updateEvents() {
      // get a list of events
      return fetch(vm.serverURL + '/events', {
        method: 'GET'
      }).then( response => {
        if(response.status == 200){
          response.json().then( events => {
            vm.activeEventIndex = 0
            if(events.length > 0){
              vm.events = events 
            } else { 
              vm.events = vm.nullEvent 
            }
          })
        } else {
          response.text().then( errorText => {
            console.log(errorText)
          })
        }
      })
    },

    onSelectEvent(eventId) {
      vm.userDidSelectEvent = true
      
      // check in to the event as admin
      fetch(vm.serverURL + '/events/' + eventId + '/check-in', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ guid: vm.guid })
      }).then( response => {
        if(response.status == 200){
          response.json().then( event_device => {

            // refresh the event details
            fetch(vm.serverURL + '/events/' + eventId, {
              method: 'GET'
            }).then( response => {
              if(response.status == 200){
                response.json().then( event => {
                  
                  vm.activeEventIndex = vm.events.findIndex( event => {
                    return event.id == eventId
                  })
                  
                  // get occasions for this event
                  fetch(vm.serverURL + '/events/' + eventId + '/occasions', {
                    method: 'GET'
                  }).then( response =>{
                    response.json().then( occasions => {
                      vm.activeEventOccasions = occasions
                    })
                  })
                  
                  // if the event is open, connect to it over websockets
                  if(event.state == 'open'){
                    openWebSocketConnection(event.id)
                  } else {
                    // get checked-in devices via HTTP
                    fetch(vm.serverURL + '/events/' + eventId + '/devices', {
                      method: 'GET'
                    }).then( response => {
                      response.json().then( devices => {
                        vm.activeEventDevices = devices.filter( device => device.guid != vm.guid) 
                      })
                    })
                  }
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
    },

    prettyDateTime: function(utcTimestamp){
      return moment(utcTimestamp).format('ddd MMM DD, YYYY @ h:mma')
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
  // /open should be idempotent, so it doesn't matter if we call it on an event that's already open
  fetch(vm.serverURL + '/events/' + vm.activeEvent.id + '/open', {
    method: 'PATCH'
  }).then( response => {
    if(response.status == 200){
      console.log('opened event ' + vm.activeEvent.label)
      openWebSocketConnection(vm.activeEvent.id)
      vm.activeEvent.state = 'open';
    }
  })
}

window.closeEvent = ($event) => {
  fetch(vm.serverURL + '/events/' + vm.activeEvent.id + '/close', {
    method: 'PATCH'
  }).then( response => {
    if(response.status == 200){
      console.log('closed event ' + vm.activeEvent.label)

      vm.activeEvent.state = 'closed';
      console.log(vm.activeEvent)
    }
  })
}

window.onShowOccasionForm = ($event) => {
  vm.occasionFormIsCollapsed = false
}

window.onHideOccasionForm = ($event) => {
  vm.occasionFormIsCollapsed = true
}

window.createCohortOccasion = ($event) => {
  $event.preventDefault()
  $event.stopPropagation()

  let locationLabel = document.getElementById('venue-location').value
  let streetAddress = document.getElementById('venue-address').value
  let city = document.getElementById('venue-city').value

  let startDateTime = moment(document.getElementById('start-date').value 
    + 'T' + document.getElementById('start-time').value).format()
  let doorsOpenDateTime = moment(document.getElementById('start-date').value 
    + 'T' + document.getElementById('doors-open-time').value).format()
  let endDateTime = moment(document.getElementById('end-date').value 
    + 'T' + document.getElementById('end-time').value).format()

  let occasion = {
    locationLabel: locationLabel,
    locationAddress: streetAddress,
    locationCity: city,
    startDateTime: startDateTime,
    doorsOpenDateTime: doorsOpenDateTime,
    endDateTime: endDateTime
  }

  fetch(vm.serverURL + '/events/' + vm.activeEvent.id + '/occasions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(occasion)
  }).then( response => {
    if(response.status == 200 || response.status == 201) {
      response.json().then( occasion => {
        vm.activeEventOccasions.push(occasion)

        document.getElementById('occasion-form').reset()
        document.getElementById('occasion-form').classList.remove('show')
        vm.occasionFormIsCollapsed = true
      })
    } else {
      response.text().then( errorText => {
        console.log(errorText)
      })
    }
  }).catch( error => {
    console.log(error.messageText)
  })
}

window.deleteCohortOccasion = ($event) => {
  $event.preventDefault()
  $event.stopPropagation()

  let id = $event.target.getAttribute('data-occasion-id')

  fetch(vm.serverURL + '/occasions/' + id, {
    method: 'DELETE'
  }).then( response => {
    if(response.status == 204) {
      let i = vm.activeEventOccasions.findIndex( occasion => {
        return occasion.id == id
      })
      vm.activeEventOccasions.splice(i, 1)
    } else {
      response.text().then( errorText => {
        console.log(errorText)
      })
    }
  }).catch( error => {
    console.log(error.messageText)
  })
}

window.onBroadcast = ($event) => {
  $event.preventDefault()
  const messageText = document.getElementById('broadcast-message').value
  
  try {
    const message = JSON.parse(messageText)
  } catch (e) {
    console.log(e.message)
    vm.errorOnBroadcast = true
    return
  }

  broadcast(message)
}

window.broadcast = (cohortMessage) => {
  try {
    fetch(vm.serverURL + '/events/' + vm.activeEvent.id + '/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(cohortMessage)
    }).then( response => {
      response.text().then( text => {
        // console.log(text)
        vm.errorOnBroadcast = false
      })
    }).catch( error => {
      console.log("Error on broadcast!")
    })
  } catch (e) {
    console.log(e.message)
    vm.errorOnBroadcast = true
  } 
}

window.openWebSocketConnection = (eventId) => {
  let clientSocket = new WebSocket(vm.socketURL)

  clientSocket.addEventListener('open', () => {
    console.log('connection open')
    clientSocket.send(JSON.stringify({ guid: vm.guid, eventId: eventId }))
  })

  clientSocket.addEventListener('message', (message) => {
    const msg = JSON.parse(message.data)
    console.log(msg)
    if((msg.status != null && msg.status != undefined) &&
        msg.eventId == vm.activeEvent.id ){
      vm.activeEventDevices = msg.status.filter( device => device.guid != vm.guid) 
    }
  })

  clientSocket.addEventListener('close', () => {
    console.log('connection closed')
  })

  clientSocket.addEventListener('error', (err) => {
    console.log(err)
  })

  vm.clientSocket = clientSocket
}

window.loadFluxDeluxEpisode = (event) => {
  if(vm.selectedFluxDeluxEpisode != null){
    let cohortMessage = {
      mediaDomain: "episode",
      cueNumber: vm.selectedFluxDeluxEpisode,
      cueAction: "load"
    }

    broadcast(cohortMessage)
  }
}

window.goFluxDeluxEpisode = (event) => {
  if(vm.selectedFluxDeluxEpisode != null){
    let cohortMessage = {
      mediaDomain: "episode",
      cueNumber: vm.selectedFluxDeluxEpisode,
      cueAction: "go"
    }
    broadcast(cohortMessage)
  }
}

window.stopFluxDeluxEpisode = (event) => {
  if(vm.selectedFluxDeluxEpisode != null){
    let cohortMessage = {
      mediaDomain: "episode",
      cueNumber: vm.selectedFluxDeluxEpisode,
      cueAction: "stop"
    }
    broadcast(cohortMessage)
  }
}