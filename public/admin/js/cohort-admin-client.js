import Vue from "vue"
import Guid from "uuid/v4"
import 'bootstrap'
import moment from 'moment'
import CHMessage from './CHMessage'

var vm = new Vue({
  el: '#cohort-admin',
  data: {
    guid: Guid(), // enable this when you implement #48
    clientSocket: { readyState: 0 },
    events: [ { id: 0, label: "no events", state: 'closed'} ],
    nullEvent: { id: 0, label: "no events", state: 'closed' }, 
    nullEventLabel: "no events", // duplication is required to avoid many ugly things
    activeEventIndex: 0,
    activeEventDevices: [ ],
    activeEventOccasions: [ ],
    broadcastMessagePlaceholder: '{ "mediaDomain": 0, \n  "cueNumber": 1, \n  "cueAction": 0 }',
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
    }, // this will eventually get pulled server-side
    selectedFluxDeluxEpisode: null,
    broadcastToEventOrOccasion: 'event',
    selectedOccasion: null,
    includeCohortMsgWithN10n: false,
    n10nBroadcastResults: '',
    alertSounds: [
      "default.caf",
      "distortion-feedback-v1.caf",
      "distortion-2-v1.caf",
      "lukas-22.caf",
      "luke-1984.caf",
      "naishi-07_07.caf",
      "alana-9-14.caf"
    ],
    selectedAlertSound: "default.caf",
    selectedGrouping: "all",
    activeLotXCue: {
      cueNumber: 1,
      notifications: [{
        targetGroup: "all",
        text: "Hello and thank you for being here",
        alertSound: "default.caf"
      }]
    },
    errorOnGo: false,
    goResults: null,
    lotXCues: [{
      cueNumber: 1,
      notifications: [{
        targetGroup: "all",
        text: "Hello and thank you for being here",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 2,
      notifications: [{
        targetGroup: "all",
        text: "Having a device like you do provides you a few X-tras. You may notice others without devices. Sharing information / experiences provided through this medium is up to you.",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 4,
      notifications: [{
        targetGroup: "all",
        text: "In LOT X - as you move from place to place, we ask you to consider the people you move with",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 5,
      notifications: [{
        targetGroup: "22",
        text: "Your ID# is 22. It means 22 will be your guide.\n\nOther people share your number.",
        alertSound: "default.caf"
      },{
        targetGroup: "9-14",
        text: "Your ID# is 9-14. This means 9-14 will be your guide.\n\nOther people share your number.",
        alertSound: "default.caf"
      },{
        targetGroup: "1984",
        text: "Your ID# is 1984. This means 1984 will be your guide.\n\nOther people share your number.",
        alertSound: "default.caf"
      },{
        targetGroup: "07_07",
        text: "Your ID# is 07_07. This means 07_07 will be your guide.\n\nOther people share your number.",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 6,
      notifications: [{
        targetGroup: "22",
        text: "22: it is time! If you haven’t already, please proceed to the square.",
        alertSound: "default.caf"
      },{
        targetGroup: "9-14",
        text: "9-14: it is time! If you haven’t already, please proceed to the square.",
        alertSound: "default.caf"
      },{
        targetGroup: "1984",
        text: "1984: it is time! If you haven’t already, please proceed to the square.",
        alertSound: "default.caf"
      },{
        targetGroup: "07_07",
        text: "07_07: it is time! If you haven’t already, please proceed to the square.",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 7,
      notifications: [{
        targetGroup: "all",
        text: "While you wait, please familiarize yourself with some terms:\n\nX-23=arrived\nX-25=meet in person",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 8,
      notifications: [{
        targetGroup: "all",
        text: "You are ready. We are ready too.",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 10,
      notifications: [{
        targetGroup: "all",
        text: "X-12 = ready",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 11,
      notifications: [{
        targetGroup: "all",
        text: "If you need assistance, ushers are nearby and ready to help, look for them",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 12,
      notifications: [{
        targetGroup: "9-14",
        text: "X-12. Please proceed to underground.",
        alertSound: "alana-9-14.caf"
      },{
        targetGroup: "22",
        text: "X-12. Please proceed to underground.",
        alertSound: "lukas-22.caf"
      }]
    },{
      cueNumber: 13,
      notifications: [{
        targetGroup: "07_07",
        text: "Please proceed",
        alertSound: "default.caf",
        cohortMessage: {
          targetTags: ["07_07"],
          mediaDomain: 0,
          cueNumber: 4,
          cueAction: 0
        }
      },{
        targetGroup: "1984",
        text: "Please proceed",
        alertSound: "default.caf",
        cohortMessage: {
          targetTags: ["1984"],
          mediaDomain: 0,
          cueNumber: 4,
          cueAction: 0
        }
      },{
        targetGroup: "9-14",
        text: "It won’t be long before you go too",
        alertSound: "default.caf",
        cohortMessage: {
          targetTags: ["9-14"],
          mediaDomain: 0,
          cueNumber: 5,
          cueAction: 0
        }
      },{
        targetGroup: "22",
        text: "It won’t be long before you go too",
        alertSound: "default.caf",
        cohortMessage: {
          targetTags: ["22"],
          mediaDomain: 0,
          cueNumber: 5,
          cueAction: 0
        }
      }]
    },{
      cueNumber: 14,
      notifications: [{
        targetGroup: "1984",
        text: "X-12. Please proceed to Ice Plant.",
        alertSound: "luke-1984.caf"
      },{
        targetGroup: "07_07",
        text: "X-12. Please proceed to Ice Plant.",
        alertSound: "naishi-07_07.caf"
      }]
    },{
      cueNumber: 15,
      notifications: [{
        targetGroup: "all",
        text: "Set your phone to silent mode now",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 16,
      notifications: [{
        targetGroup: "all",
        text: "An augmented reality installation exists outside the theatre on the east wall of the Power Plant. It is part of LOT X. Feel free to visit it now or later.",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 17,
      notifications: [{
        targetGroup: "all",
        text: "Thank YOU for joining us",
        alertSound: "default.caf"
      }]
    },{
      cueNumber: 18,
      notifications: [{
        targetGroup: "all",
        text: "Made possible by support from: Canada Council New Chapter, Harbourfront Centre, Danceworks, and Lindy & Sam Chaiton",
        alertSound: "default.caf"
      }]
    }
  ]},
  created: function() {
    if(document.getElementById('cohort-admin')){
      console.log('starting cohort admin page vue instance')

      // // HACK
      // // load lot x first cue
      // this.activeLotXCue = this.lotXCues.find( cue => cue.cueNumber === 1 )

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
    },
    activeCueIndex: function() {
      const activeCueIndex = this.lotXCues.findIndex( cue => {
        return cue.cueNumber == this.activeLotXCue.cueNumber
      })
      return activeCueIndex
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
      }).then( response1 => {
        if(response1.status == 200){

          // refresh the event details
          fetch(vm.serverURL + '/events/' + eventId, {
            method: 'GET'
          }).then( response2 => {
            if(response2.status == 200){
              response2.json().then( event => {
                
                vm.activeEventIndex = vm.events.findIndex( event => {
                  return event.id == eventId
                })
                
                // get occasions for this event
                fetch(vm.serverURL + '/events/' + eventId + '/occasions', {
                  method: 'GET'
                }).then( response3 => {
                  response3.json().then( occasions => {
                    vm.activeEventOccasions.length = 0 
                    vm.activeEventOccasions.push(...occasions)
                  })
                })
                
                // if the event is open, connect to it over websockets
                if(event.state == 'open'){
                  openWebSocketConnection(event.id)
                } else {
                  // get checked-in devices via HTTP
                  fetch(vm.serverURL + '/events/' + eventId + '/devices', {
                    method: 'GET'
                  }).then( response4 => {
                    response4.json().then( devices => {
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
    },

    prettyShortDateTime: function(utcTimestamp){
      return moment(utcTimestamp).format('MMM D @ h:mma')
    },

    resetSlider: function(){
      const slider = document.getElementById('cue-control-go')
      slider.classList.remove('cue-sent-response-success')
      slider.classList.remove('cue-sent-response-pending')
      slider.classList.remove('cue-sent-response-error')
      slider.value = 0
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
  validateCohortMessage(messageText)
  broadcast(cohortMessage)
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

// duplicated for GO slider, refactor asap
window.onBroadcastPushNotification = ($event) => {
  $event.preventDefault()
  let alertBody = document.getElementById('notification-text').value
 
  let requestURL
  if(vm.broadcastToEventOrOccasion == 'event'){
    requestURL = vm.serverURL + '/events/' + vm.activeEvent.id + '/broadcast-push-notification'
  } else if(vm.broadcastToEventOrOccasion == 'occasion'){
    requestURL = vm.serverURL + '/events/' + vm.activeEvent.id + '/occasions/' + vm.selectedOccasion + '/broadcast-push-notification'
  }

  if(vm.selectedGrouping != "all"){
    const queryString = "?tag=" + vm.selectedGrouping
    requestURL += queryString
  }

  console.log(requestURL)

  let n10n = { 
    text: alertBody,
    bundleId: 'rocks.cohort.lotx',
    sound: vm.selectedAlertSound
  }

  console.log(n10n)

  if(vm.includeCohortMsgWithN10n){
    let msg = validateCohortMessage(document.getElementById('n10n-broadcast-message').value)
    n10n.cohortMessage = msg
    console.log(n10n)
  }

  try {
    fetch(requestURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(n10n)
    }).then( response => {
      if(response.status == 200){
        response.text().then( text => {
          // console.log(text)
          vm.errorOnBroadcast = false
        })
      } else {
        response.json().then( body => {
          vm.n10nBroadcastResults = body.error
        })
      }
    }).catch( error => {
      console.log("Error on push notification broadcast!")
    })
  } catch (e) {
    console.log(e.message)
    vm.errorOnBroadcast = true
  } 
}

function validateCohortMessage(messageText){
  let chMsgJSON
  try {
    console.log(messageText)
    chMsgJSON = JSON.parse(messageText)
    console.log(chMsgJSON)
  } catch (e) {
    console.log(e.message)
    vm.errorOnBroadcast = true
    return new Error('cohort message failed validation')
  }
  const cohortMessage = CHMessage(chMsgJSON["mediaDomain"], chMsgJSON["cueNumber"], chMsgJSON["cueAction"])
  console.log(cohortMessage)
  return cohortMessage
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

window.onCueSliderInput = (event) => {
  const value = event.target.value
  console.log(value)
  if(value == 100){
    event.target.classList.add('cue-sent-response-pending')
    // disable the button
    event.target.disabled = true

    // send the notification(s)
    vm.activeLotXCue.notifications.forEach( cuelistN10n => {
      let requestURL = vm.serverURL + '/events/' + vm.activeEvent.id + '/occasions/' + vm.selectedOccasion + '/broadcast-push-notification'

      if(cuelistN10n.targetGroup != "all"){
        const queryString = "?tag=" + cuelistN10n.targetGroup
        requestURL += queryString
      }
      console.log(requestURL)
      
      let n10n = { 
        text: cuelistN10n.text,
        bundleId: 'rocks.cohort.lotx',
        sound: cuelistN10n.alertSound
      }

      if(cuelistN10n.cohortMessage !== undefined && cuelistN10n.cohortMessage != null){
        console.log(cuelistN10n.cohortMessage)
        const cohortMessage = {
          targetTags: cuelistN10n.cohortMessage.targetTags,
          mediaDomain: cuelistN10n.cohortMessage.mediaDomain,
          cueNumber: cuelistN10n.cohortMessage.cueNumber,
          cueAction: cuelistN10n.cohortMessage.cueAction
        }
        n10n.cohortMessage = cohortMessage
      }
      console.log(n10n)

      try {
        fetch(requestURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(n10n)
        }).then( response => {
          if(response.status == 200){
            response.text().then( text => {
              console.log(text)
              vm.errorOnGo = false
              event.target.disabled = false
              event.target.value = 0
              event.target.classList.add('cue-sent-response-success')
              event.target.classList.remove('cue-sent-response-pending')
            })
          } else {
            response.json().then( body => {
              console.log('error on request: ' + body.error)
              vm.errorOnGo = true
              vm.goResults = body.error
              event.target.disabled = false
              event.target.value = 0
              event.target.classList.add('cue-sent-response-error')
              event.target.classList.remove('cue-sent-response-pending')
            })
          }
        }).catch( error => {
          console.log("Error on push notification broadcast!")
        })
      } catch (e) {
        console.log(e.message)
        vm.errorOnGo = true
      } 
    })
  }
}

window.onPreviousLotXCue = (event) => {
  // update active cue
  vm.activeLotXCue = vm.lotXCues[vm.activeCueIndex - 1];

  // reset slider
  vm.resetSlider()

  // hide results
  vm.errorOnGo = false
  vm.goResults = null
}

window.onNextLotXCue = (event) => {
  // update active cue
  vm.activeLotXCue = vm.lotXCues[vm.activeCueIndex + 1];

  // reset slider
  vm.resetSlider()

  // hide results
  vm.errorOnGo = false
  vm.goResults = null
}