// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const _flatten = require('lodash/flatten')
const _uniqBy = require('lodash/uniqBy')

const eventsTable = require('../knex/queries/event-queries')
const CHEvent = require('./CHEvent')

class CHSession {
  events
  errors // used for testing

  constructor(){
    this.events = []
    this.errors = []
  }

  async init() {
    // let dbEvents = await eventsTable.getAll()
    
    // let openEvents = dbOpenEvents.map( dbEvent => {
    //   return CHEvent.fromDatabaseRow(dbEvent)
    // })

    // openEvents.forEach( event => {
    //   this.addListenersForEvent(event)
    //   event.open()
    // })
    
    return Promise.resolve()
  }

  static initAndSetOnApp(app){
    let cohortSession = new CHSession()

    return cohortSession.init().then( () => {
      app.set("cohort", cohortSession)
    })
  }

  // addListenersForEvent(event){
  //   event.on('transition', data => {
  //     if(data.toState == 'closed'){
  //       // remove the event from the session
  //       let eventIndex = this.events.findIndex(
  //         matchingEvent => matchingEvent.id == event.id
  //       )
  //       if(eventIndex !== undefined){
  //         this.events.splice(eventIndex, 1)
  //       } else {
  //         throw new Error("Closed event was not present in session!")
  //       }
  //     }
  //     if(data.toState == 'open'){
  //       this.events.push(event)
  //     }
  //   })
  // }
  
  // returns a flat array of all devices checked into active events
  // allDevices(){
  //   let nestedDevices = this.events
  //   .map( event => event.devices)
  //   let flatDevices = _flatten(nestedDevices)
  //   let uniqueDevices = _uniqBy(flatDevices, 'id')
  //   return uniqueDevices
  // }
} 

module.exports = CHSession