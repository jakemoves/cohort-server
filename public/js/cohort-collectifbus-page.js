import Vue from "vue"
import Guid from "uuid/v4"
import {Howl, Howler} from 'howler'
import Cookies from 'js-cookie'
import moment from 'moment'

var vmC = new Vue({
  el: '#cohort-collectifbus-page',
  data: {
    guid: '',
    clientSocket: { readyState: 0 },
    cohortState: '',
    activeEvent: { id: 0, label: "no events", state: 'closed' },
    cuesheet: {}
  },
  created: function() {
    if(document.getElementById('cohort-collectifbus-page')){
      console.log('starting cohort collectifbus page vue instance')

      if(Cookies.get('cohort-device-guid') === undefined){
        Cookies.set('cohort-device-guid', Guid(), { expires: 7 })
      }
      
      this.guid = Cookies.get('cohort-device-guid')
      console.log(this.guid)
      
      // get event cuesheet
      fetch(this.serverURL + '/events/' + this.eventId + '/cuesheet', {
        method: 'GET'
      }).then( response => {
        if(response.status == 200) {
          response.text().then( jsonText => {
            let cuesheet = JSON.parse(jsonText)
            this.cuesheet = cuesheet
            this.checkInAndConnectToCohortServer()
          })
        } else {
          console.log("response not ok")
          response.text().then( text => {
            console.log(text)
          })
        }
      }).catch ( error => {
        console.log(error)
      })

    }
  },
  computed: {
    // process.env.NODE_ENV is patched in by webpack based on the mode (dev/prod) provided in the package.json build scripts
    serverURL: function() {
      if(process.env.NODE_ENV == 'development'){
        return 'http://jakemoves.local:3000/api/v1'
      } else {
        return 'https://cohort.rocks/api/v1'
      }
    },
    // assetURL: function() {
    //   if(process.env.NODE_ENV == 'development'){
    //     return 'http://jakemoves.local:3000/event-assets'
    //   } else {
    //     return 'https://cohort.rocks/event-assets'
    //   }
    // },
    socketURL: function() {
      if(process.env.NODE_ENV == 'development'){
        return 'ws://jakemoves.local:3000/sockets'
      } else {
        return 'wss://cohort.rocks/sockets'
      }
    },
    eventId: function() {
      if(process.env.NODE_ENV == 'development'){
        return 5
      } else {
        return 5
      }
    },
    state: function() {
      if(this.cohortState == ''){
        return 'default'
      }

      if(this.cohortState == 'connected'){
        return 'ready'
      }

      console.log('cohortState: ' + this.cohortState)
      return 'ambiguous'
    }
  },
  methods: {
    checkInAndConnectToCohortServer: function(){
      console.log('checkInAndConnectToCohortServer()')
      // register this app as a device
      fetch(vmC.serverURL + '/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ guid: vmC.guid })
      }).then( response => {
        if(response.status == 200 /* this device already exists */ || 
          response.status == 201 /* created this device */ ){
        
          // check in to the event
          fetch(vmC.serverURL + '/events/' + vmC.eventId + '/check-in', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ guid: vmC.guid })
          }).then( response => {
            if(response.status == 200){
              vmC.cohortState = 'checked-in'
              response.json().then( event_device => {

                // refresh the event details
                fetch(vmC.serverURL + '/events/' + vmC.eventId, {
                  method: 'GET'
                }).then( response => {
                  if(response.status == 200){
                    response.json().then( event => {
                      
                      vmC.activeEvent = event
                      
                      // if the event is open, connect to it over websockets
                      if(vmC.activeEvent.state == 'open'){
                        openWebSocketConnection(vmC.eventId)
                      } else {
                        
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
        } else {
          console.log('error registering this app as a device')
          response.text().then( error => {
            console.log(error)
          })
        }
      })
    },
    imageThumbnailURL: function(imageURL) {
      // console.log(imageURL)
      let splitURL = imageURL.split('.')
      let urlNoExt = splitURL[0]
      let thumbnailURL = urlNoExt + '-thumbnail.' + splitURL[1]
      // console.log(thumbnailURL)
      return thumbnailURL
    }
  }
})

window.openWebSocketConnection = (eventId) => {
  console.log(vmC.guid)
  let clientSocket = new WebSocket(vmC.socketURL)

  clientSocket.addEventListener('open', () => {
    console.log('connection open')
    let payload = { guid: vmC.guid, eventId: eventId }
    console.log(payload)
    clientSocket.send(JSON.stringify(payload))
  })

  clientSocket.addEventListener('message', (message) => {
    const msg = JSON.parse(message.data)
    console.log(msg)
    if(msg.response && msg.response !== undefined && msg.response == 'success'){
      vmC.cohortState = 'connected'
    }
    
    if(msg.mediaDomain && msg.mediaDomain !== undefined && 
       msg.cueNumber && msg.cueNumber !== undefined && 
       msg.cueAction && msg.cueAction !== undefined) {
      
      // it's a valid cohort message
      // write some better parsing!
      let cue = vmC.cuesheet.cues.find( cue => {
          return (cue.cueNumber == msg.cueNumber && 
          cue.mediaDomain == msg.mediaDomain)
      })
      
      if(cue === undefined) {
        return
      }
      
      if(cue.mediaDomain == 'image'){
        document.getElementById('hero-image').setAttribute('src', cue.assetURL)
      }
    }
  })

  clientSocket.addEventListener('close', () => {
    console.log('connection closed')
    vmC.cohortState = 'default'
  })

  clientSocket.addEventListener('error', (err) => {
    console.log(err)
    vmC.cohortState = 'default'
  })

  vmC.clientSocket = clientSocket
}

window.onSelectImage = ($event) => {
  $event.stopPropagation()
  $event.preventDefault()

  let selectedImgCueNumber = $event.target.getAttribute('data-cue-number')

  let message = {
    targetTags: ["all"],
    mediaDomain: "image",
    cueNumber: selectedImgCueNumber,
    cueAction: "go"
  }
  
  fetch(vmC.serverURL + '/events/' + vmC.eventId + '/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(message)
  }).then( response => {
    if(response.status == 200){
      console.log('sent image cue')
    } else {
      console.log(response.status)
    }
  }).catch( error => {
    console.log(error)
  })
}