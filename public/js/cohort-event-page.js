import Vue from "vue"
import Guid from "uuid/v4"
import {Howl, Howler} from 'howler'
import Cookies from 'js-cookie'
import moment from 'moment'

var vmE = new Vue({
  el: '#cohort-event-page',
  data: {
    guid: '',
    clientSocket: { readyState: 0 },
    clientTimezoneOffset: null,
    cohortState: '',
    currentPlayingEpisode: null,
    participantGroupColour: "",
    audioLoading: false,
    activeEvent: { id: 0, label: "no events", state: 'closed' },
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
    ]
  },
  created: function() {
    if(document.getElementById('cohort-event-page')){
      console.log('starting cohort event page vue instance')

      this.clientTimezoneOffset = new Date().getTimezoneOffset()
      this.now = moment()

      if(Cookies.get('cohort-device-guid') === undefined){
        Cookies.set('cohort-device-guid', Guid(), { expires: 7 })
      }
      
      this.guid = Cookies.get('cohort-device-guid')

      // assign participant to either 'red' or 'blue' group
      let coinFlipResult = Math.round(Math.random())
      if(coinFlipResult == 1){
        this.participantGroupColour = "blue"
      } else if(coinFlipResult == 0){
        this.participantGroupColour = "red"
      } else { throw new Error}
      
      // the old server doesn't support https so we can't request the occasions... sigh.
      let occasions = [
        {"city":"Toronto","venue":"National Ballet School","address":"400 Jarvis St","geocode":["43.434","-79.4343"],"date":"2019-02-01","doorsOpenTime":"12:30","startTime":"13:00","endTime":"14:30","hosts":[{"name":"no host name","url":"no host url"}],"signupURL":"no signup url","checkInCode":"no code","startDateAndTimeEST":"2019-02-01T13:00:00-05:00","doorsOpenDateAndTimeEST":"2019-02-01T12:30:00-05:00","endDateAndTimeEST":"2019-02-01T14:30:00-05:00","_id":"CfIPSksu9tNKiJV3"},
        {"city":"Toronto","venue":"National Ballet School","address":"400 Jarvis St","geocode":["43.434","-79.4343"],"date":"2019-02-01","doorsOpenTime":"10:00","startTime":"10:15","endTime":"12:30","hosts":[{"name":"no host name","url":"no host url"}],"signupURL":"no signup url","checkInCode":"no code","startDateAndTimeEST":"2019-02-01T10:15:00-05:00","doorsOpenDateAndTimeEST":"2019-02-01T10:00:00-05:00","endDateAndTimeEST":"2019-02-01T12:30:00-05:00","_id":"CfIPSksu9tNKiJV3"}
      ]

      occasions.forEach( occasion => {
        occasion.doorsOpenMoment = moment(occasion.doorsOpenDateAndTimeEST)
        occasion.startMoment = moment(occasion.startDateAndTimeEST)
        occasion.endMoment = moment(occasion.endDateAndTimeEST)
      })

      this.occasions = occasions
      this.cohortState = 'occasions-loaded'
      // // get event occasions (from an older server)
      // fetch(this.fdOccasionServerURL, {
      //   method: 'GET'
      // }).then( response => {
      //   if(response.status == 200) {
      //     response.text().then( jsonText => {
      //       let occasions = JSON.parse(jsonText)
      //       occasions.forEach( occasion => {
      //         occasion.doorsOpenMoment = moment(occasion.doorsOpenDateAndTimeEST)
      //         occasion.startMoment = moment(occasion.startDateAndTimeEST)
      //         occasion.endMoment = moment(occasion.endDateAndTimeEST)
      //       })
      //       vmE.occasions = occasions
      //       vmE.cohortState = 'occasions-loaded'
      //     })
      //   } else {
      //     console.log("response not ok")
      //     response.text().then( text => {
      //       console.log(text)
      //     })
      //   }
      // }).catch ( error => {
      //   console.log(error)
      // })
    }
  },
  watch: {
    stateClass: function(stateClass){
      document.body.classList.remove('state-occasions-loaded','state-audio-loading', 'state-ready', 'state-playing-episode')
      document.body.classList.add(stateClass)
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
    socketURL: function() {
      if(process.env.NODE_ENV == 'development'){
        return 'ws://jakemoves.local:3000/sockets'
      } else {
        return 'wss://cohort.rocks/sockets'
      }
    },
    fdOccasionServerURL: function() {
      if(process.env.NODE_ENV == 'development'){
        return "http://jakemoves.local:8000/events"
      } else {
        return "http://cohortserver-fluxdelux.herokuapp.com/events"
      }
    },
    eventId: function() {
      if(process.env.NODE_ENV == 'development'){
        return 4
      } else {
        return 4
      }
    },
    occasionsForDisplay: function() {
      if(this.activeOccasionIndex != null && this.activeOccasionIndex < this.occasions.length){
        // console.log('showing one occasion')
        return [this.occasions[this.activeOccasionIndex]]
      } else {
        // console.log('showing all occasions')
        return this.occasions.filter( occasion => {
          return this.now.isBefore(occasion.endMoment)
        }).sort(function(a, b){
          if(b.startMoment.isAfter(a.startMoment)){
            return -1
          } else if(b.startMoment.isBefore(a.startMoment)){
            return 1
          } else {
            return 0
          }
        })
      }
    },
    state: function() {
      if(this.cohortState == ''){
        return 'default'
      }

      if(this.cohortState == 'occasions-loaded' || this.cohortState == 'checked-in'){
        return 'occasions-loaded'
      }

      if(this.cohortState == 'connected'){
        if(this.currentPlayingEpisode){
          return 'playing-episode'
        } else {
          if(this.audioLoading){
            return 'audio-loading'
          } else {
            return 'ready'
          }
        }
      }

      console.log('cohortState: ' + this.cohortState)
      return 'ambiguous'
    },
    stateClass: function() {
      return 'state-' + this.state 
    },
    clientIsProbablyNotInEST: function() {
      if(this.clientTimezoneOffset >= 270 && this.clientTimezoneOffset <= 330){
        return false
      } else {
        return true
      }
    }
  },
  methods: {
    onCheckIn: function(occasionIndex){
      console.log('onCheckIn(' + occasionIndex + ')')

      vmE.activeOccasionIndex = occasionIndex

      vmE.checkInAndConnectToCohortServer()
      
      vmE.episodes.forEach( episode => {

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

        episode.sound = new Howl({
          src: audioFileURL,
          preload: false,
          onload: function() {
            vmE.audioLoading = false
            console.log('loaded sound for episode ' + episode.label + ' (' + vmE.participantGroupColour + ' group)')
          },
          onloaderror: function(){
            console.log('error loading sound for episode ' + episode.label)
          },
          onend: function(){
            console.log('finished playing episode ' + episode.label )
            vmE.currentPlayingEpisode.sound.stop()
            vmE.currentPlayingEpisode.sound.unload()
            vmE.currentPlayingEpisode = null
          }
        })
      })
      // }
    },
    checkInAndConnectToCohortServer: function(){
      console.log('checkInAndConnectToCohortServer()')
      // register this app as a device
      fetch(vmE.serverURL + '/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ guid: vmE.guid })
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
  if(vmE.currentPlayingEpisode){
    vmE.currentPlayingEpisode.sound.stop()
    vmE.currentPlayingEpisode = null
  }
  Howl.unload()
  vmE.clientSocket.close()
  setTimeout( () => {
    vmE.now = moment()
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
            case 'load':
              // new loading behaviour
              episode.sound.load()
              vmE.audioLoading = true
              break;
            case 'go': // should only have an effect when an episode is not playing
              if(!vmE.currentPlayingEpisode){
                
                vmE.currentPlayingEpisode = episode
                if(episode.sound.state !== 'loaded'){
                  vmE.audioLoading = true
                }
                setTimeout( () => {
                  episode.sound.play()
                }, 4000) // delay to help make sure all clients are ready to go
                // catch up logic (in case of delayed start) would go here
              }
              break;
            case 'stop':
              episode.sound.stop()
              episode.sound.unload()
              vmE.audioLoading = false
              vmE.currentPlayingEpisode = null
            // case 'pause':
            //   episode.sound.pause()
            //   break;
            // case 'restart':
            //   episode.sound.seek(0)
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
    vmE.now = moment()
    vmE.cohortState = 'checked-in'
  })

  clientSocket.addEventListener('error', (err) => {
    console.log(err)
  })

  vmE.clientSocket = clientSocket
}