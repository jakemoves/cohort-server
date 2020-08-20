import {v4 as uuid} from 'uuid'
import EventEmitter from 'events'

class CohortClientSession extends EventEmitter {

  constructor(socketURL, occasionId, tags = [ "all" ]){
    super()
    this.socketURL = socketURL
    this.occasionId = occasionId
    this.guid = uuid()
    this.tags = tags
    this.connected = false
    this.socket
  }

  init(){
    return new Promise( async (resolve, reject) => {

      if(!this.tags.includes("all")){
        console.log("Adding default tag 'all' to Cohort session")
        this.tags.push("all")
      }

      try {
        this.socket = await this.connect()
      }
      catch( error ) {
        return reject(error) 
      }

      return resolve()
    })
  }

  connect(){
    return new Promise( (resolve, reject) => {
      let socket 
      try {
        socket = new WebSocket(this.socketURL)
      } catch (error) {
        return reject(error)
      }

      socket.addEventListener('open', () => {
        socket.send(JSON.stringify({ 
          guid: "" + this.guid, 
          occasionId: this.occasionId
        }))
      })

      socket.addEventListener('close', (msg) => {
        console.log('connection closed with error ' + msg.code + ': ' + msg.reason)
        this.emit('disconnected', { code: msg.code, reason: msg.reason })
      })
      
      socket.addEventListener('error', (err) => {
        err.stopImmediatePropagation()
        console.log(err)
      })

      socket.addEventListener('message', (message) => {
        const msg = JSON.parse(message.data)
        console.log(msg)
        
        // finish handshake
        if(this.connected == false && msg.response == "success"){
          this.connected = true
          this.emit('connected')
          return resolve(socket)
        } else if(this.connected == false){
          return reject(msg)
        }
        
        if(msg.dataIdentifier !== undefined){
          this.emit('dataReceived', msg)
          return
        }

        let cohortCue
        try {
          cohortCue = this.validateCohortCue(msg)
        } catch (error) {
          console.log(error)
          return
        }

        this.emit('cueReceived', cohortCue)
      })
    })
  }

  validateCohortCue(msg) {
    if(msg.mediaDomain == null || msg.mediaDomain === undefined){
      throw new Error("message does not include 'mediaDomain' field")
    }

    if(msg.cueNumber == null || msg.cueNumber === undefined){
      throw new Error("message does not include 'cueNumber' field")
    }
    
    if(msg.mediaDomain !== 0 && msg.mediaDomain !== 3){
      throw new Error("Cohort for web browsers only supports audio cues (mediaDomain: 0) and text cues (mediaDomain: 3)")
    }

    if(msg.cueAction != 0){
      throw new Error("Cohort for web browsers only supports playing (no pause, restart, stop) -- cueAction: 0")
    }

    let tagMatched = false
    msg.targetTags.forEach( tag => {
      if( this.tags.includes(tag)){
        tagMatched = true
        return
      }
    })
    if(!tagMatched){
      throw new Error("Based on tags, this cue is not intended for this client, so we're not triggering it.")
    }

    return msg
  }

  send(object){
    this.socket.send(JSON.stringify(object))
  }
}

export default CohortClientSession