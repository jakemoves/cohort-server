import Vue from "vue"
import Guid from "uuid/v4"
import {Howl, Howler} from 'howler'

var vmE = new Vue({
  el: '#cohort-event-page',
  data: {
    guid: Guid(), // enable this when you implement #48
    clientSocket: { readyState: 0 },
    cohortState: '',
    audioLoadState: 'unloaded',
    episodeIsPlaying: false,
    audioFileCount: null,
    audioFilesLoaded: 0,
    activeEpisode: { label: 'no episodes', id: 0, soundtrackURLs: [], sound: null },
    activeEvent: { id: 0, label: "no events", state: 'closed' },
    // events: [ { id: 0, label: "no events", state: 'closed' } ],
    // nullEvent: { id: 0, label: "no events", state: 'closed' }, 
    // nullEventLabel: "no events", // duplication is required to avoid many ugly things
    occasions: [ 
      {"city":"Toronto","venue":"National Ballet School",  "address":"400 Jarvis St","geocode":["43.434","-79.4343"],"date":"2019-02-01","doorsOpenTime":"12:30","startTime":"13:00","endTime":"14:30","hosts":[{"name":"no host name","url":"no host url"}],"signupURL":"no signup url","checkInCode":"no code","startDateAndTimeEST":"2019-02-01T13:00:00-05:00","doorsOpenDateAndTimeEST":"2019-02-01T12:30:00-05:00","endDateAndTimeEST":"2019-02-01T14:30:00-05:00","_id":"CfIPSksu9tNKiJV3"}
    ],
    activeOccasionIndex: null,
    episodes: [
      { 
        label: 'Simple Flux', id: 1, sound: null,
        soundtrackURLs: [ 'https://s3.us-east-2.amazonaws.com/fluxdelux/simpleflux.mp3' ]
      },{ 
        label: 'Corners', id: 2, sound: null,
        soundtrackURLs: [{ 
          group: 'blue',
          url: 'https://s3.us-east-2.amazonaws.com/fluxdelux/corners-blue.mp3'
        }, { 
          group: 'red',
          url: 'https://s3.us-east-2.amazonaws.com/fluxdelux/corners-red.mp3' 
        }]
      },{ 
        label: 'Ship', id: 3, sound: null,
        soundtrackURLs: [{ 
          group: 'blue',
          url: 'https://s3.us-east-2.amazonaws.com/fluxdelux/ship-blue.mp3'
        }, { 
          group: 'red',
          url: 'https://s3.us-east-2.amazonaws.com/fluxdelux/ship-red.mp3' 
        }]
      },{ 
        label: 'Chip Melt', id: 4, sound: null,
        soundtrackURLs: [{ 
          group: 'blue',
          url: 'https://s3.us-east-2.amazonaws.com/fluxdelux/chip-melt-blue.mp3'
        }, { 
          group: 'red',
          url: 'https://s3.us-east-2.amazonaws.com/fluxdelux/chip-melt-red.mp3' 
        }]
      },{ 
        label: 'Orbitals', id: 5, sound: null,
        soundtrackURLs: [{ 
          group: 'blue',
          url: 'https://s3.us-east-2.amazonaws.com/fluxdelux/orbitals-blue.mp3'
        }, { 
          group: 'red',
          url: 'https://s3.us-east-2.amazonaws.com/fluxdelux/orbitals-red.mp3' 
        }]
      },{ 
        label: 'Hula Lasso', id: 6, sound: null,
        soundtrackURLs: [{ 
          group: 'blue',
          url: 'https://s3.us-east-2.amazonaws.com/fluxdelux/hula-lasso-blue.mp3'
        }, { 
          group: 'red',
          url: 'https://s3.us-east-2.amazonaws.com/fluxdelux/hula-lasso-blue.mp3' 
        }]
      },{ 
        label: 'Ship Together', id: 7, sound: null,
        soundtrackURLs: [ 'https://s3.us-east-2.amazonaws.com/fluxdelux/ship-together.mp3' ]
      },{ 
        label: 'Chip Melt Together', id: 8, sound: null,
        soundtrackURLs: [ 'https://s3.us-east-2.amazonaws.com/fluxdelux/chip-melt-together.mp3' ]
      }
    ],
    participantGroupColour: ""
  },
  created: function() {
    console.log('starting cohort event page vue instance')

    // assign participant to either 'red' or 'blue' group
    let coinFlipResult = Math.round(Math.random())
    if(coinFlipResult == 1){
      this.participantGroupColour = "blue"
    } else if(coinFlipResult == 0){
      this.participantGroupColour = "red"
    } else { throw new Error}
    
    // get event occasions (from an older server)
    fetch(this.fdOccasionServerURL, {
      method: 'GET'
    }).then( response => {
      if(response.status == 200) {
        response.text().then( jsonText => {
          let occasions = JSON.parse(jsonText)
          vmE.occasions = occasions
          vmE.cohortState = 'occasions-loaded'
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
    fdOccasionServerURL: function() {
      if(process.env.NODE_ENV == 'development'){
        return "http://localhost:8000/events"
      } else {
        return "http://cohortserver-fluxdelux.herokuapp.com/events"
      }
    },
    eventId: function() {
      if(process.env.NODE_ENV == 'development'){
        return 4
      } else {
        return 5
      }
    },
    occasionsForDisplay: function() {
      if(this.activeOccasionIndex != null && this.activeOccasionIndex < this.occasions.length){
        // console.log('showing one occasion')
        return [this.occasions[this.activeOccasionIndex]]
      } else {
        // console.log('showing all occasions')
        return this.occasions
      }
    },
    audioLoadProgress: function(){
      if(this.audioLoadState == 'unloaded') {
        return '0%'
      } else if(this.audioLoadState == 'loaded') {
        return '100%'
      } else if(this.audioLoadState == 'loading') {
        let progress = this.audioFilesLoaded / this.audioFileCount * 100
        let minimumIncrement = 1 / this.audioFileCount * 100
        if(progress < minimumIncrement) {
          return minimumIncrement / 2 + '%'
        } else {
          return progress + '%'
        }
      }
    },
    state: function() {
      if(this.audioLoadState == 'unloaded' && this.cohortState == ''){
        return 'default'
      }

      if(this.cohortState == 'occasions-loaded' || this.cohortState == 'checked-in'){
        return 'occasions-loaded'
      }

      if(this.cohortState == 'connected'){
        if(this.audioLoadState == 'loaded'){
          if(this.episodeIsPlaying){
            return 'playing-episode'
          } else {
            return 'ready'
          }
        } else {
          return 'occasions-loaded'
        }
      }

      console.log('audioLoadState: ' + this.audioLoadState)
      console.log('cohortState: ' + this.cohortState)
      return 'ambiguous'
    },
    stateClass: function() {
      return 'state-' + this.state 
    }
  },
  methods: {
    onCheckIn: function(occasionIndex){
      console.log('onCheckIn(' + occasionIndex + ')')

      vmE.activeOccasionIndex = occasionIndex

      vmE.checkInAndConnectToCohortServer()
      
      if(vmE.audioLoadState == 'unloaded'){
        // start audio setup, first check in only
        vmE.audioLoadState = 'loading'
        
        vmE.episodes.forEach( episode => {
          vmE.audioFileCount = vmE.episodes.length

          let audioFileURL
          if(episode.soundtrackURLs.length == 1){
            audioFileURL = episode.soundtrackURLs[0]
          } else if(episode.soundtrackURLs.length == 2){
            let soundtrack = episode.soundtrackURLs.find( soundtrackURL => { 
              return soundtrackURL.group == vmE.participantGroupColour
            })
            if(soundtrack !== undefined){
              audioFileURL = soundtrack.url
            } else { 
              throw new Error("Error: failed to find a matching soundtrack URL")
            }
          } else { 
            throw new Error 
          }

          const sound = new Howl({
            src: audioFileURL,
            pool: vmE.audioFileCount,
            onload: function() {
              console.log('loaded sound for episode ' + episode.label)
              vmE.audioFilesLoaded++
              if(vmE.audioFilesLoaded == vmE.audioFileCount){
                console.log('loaded all sound for event ' + vmE.activeEvent.label + ' (' + vmE.participantGroupColour + ' group)')
                
                // allow the 100% progress bar to show for a moment
                setTimeout(() => {
                  vmE.audioLoadState = 'loaded'
                }, 1000)
                
              }
            },
            onloaderror: function(){
              console.log('error loading sound for episode ' + episode.label)
            },
            onend: function(){
              console.log('finished playing episode ' + episode.label )
              vmE.episodeIsPlaying = false
            }
          })
    
          episode.sound = sound
        })
      }
    },
    checkInAndConnectToCohortServer: function(){
      console.log('checkInAndConnectToCohortServer()')
      // register this app as a device
      fetch(this.serverURL + '/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ guid: this.guid })
      }).then( response => {
        if(response.status == 200 /* this device already exists */ || 
          response.status == 201 /* created this device */ ){
        
          // check in to the event
          fetch(vmE.serverURL + '/events/' + vmE.eventId + '/check-in', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ guid: vmE.guid })
          }).then( response => {
            if(response.status == 200){
              vmE.cohortState = 'checked-in'
              response.json().then( event_device => {

                // refresh the event details
                fetch(vmE.serverURL + '/events/' + vmE.eventId, {
                  method: 'GET'
                }).then( response => {
                  if(response.status == 200){
                    response.json().then( event => {
                      
                      vmE.activeEvent = event
                      
                      // if the event is open, connect to it over websockets
                      if(vmE.activeEvent.state == 'open'){
                        openFDWebSocketConnection(vmE.eventId)
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
    }
  }
})

window.onCheckOut = ($event) => {
  console.log('onCheckOut()')
  if(vmE.episodeIsPlaying){
    vmE.activeEpisode.sound.stop()
    vmE.episodeIsPlaying = false
  }
  vmE.clientSocket.close()
  setTimeout( () => {
    vmE.cohortState = 'occasions-loaded'
  }, 100) // because socket.close() is async and changes the state
  vmE.activeOccasionIndex = null
}

window.openFDWebSocketConnection = (eventId) => {
  let clientSocket = new WebSocket(vmE.socketURL)

  clientSocket.addEventListener('open', () => {
    console.log('connection open')
    clientSocket.send(JSON.stringify({ guid: vmE.guid, eventId: eventId }))
  })

  clientSocket.addEventListener('message', (message) => {
    const msg = JSON.parse(message.data)
    console.log(msg)
    if(msg.response && msg.response !== undefined && msg.response == 'success'){
      vmE.cohortState = 'connected'
    }
    
    if(msg.mediaDomain && msg.mediaDomain !== undefined && 
       msg.cueNumber && msg.cueNumber !== undefined && 
       msg.cueAction && msg.cueAction !== undefined) {
      
      // it's a valid cohort message
      if(msg.mediaDomain == 'episode'){
        let episode = vmE.episodes.find( episode => episode.id == msg.cueNumber )
        if(episode !== undefined){
          switch(msg.cueAction) {
            case 'go':
              vmE.activeEpisode = episode
              vmE.activeEpisode.sound.play()
              vmE.episodeIsPlaying = true
              break;
            case 'stop':
              episode.sound.stop()
              vmE.episodeIsPlaying = false
            case 'pause':
              episode.sound.pause()
              break;
            case 'restart':
              episode.sound.seek(0)
              break;
            default:
              break;
          }
        }
      }
    }
  })

  clientSocket.addEventListener('close', () => {
    console.log('connection closed')
    vmE.cohortState = 'checked-in'
  })

  clientSocket.addEventListener('error', (err) => {
    console.log(err)
  })

  vmE.clientSocket = clientSocket
}