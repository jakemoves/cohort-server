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
    let dbActiveEvents = await eventsTable.getAllActiveWithDevices()
    
    let activeEvents = dbActiveEvents.map( dbEvent => {
      return CHEvent.fromDatabaseRow(dbEvent)
    })
    this.events = activeEvents
    
    return Promise.resolve()
  }

  static initAndSetOnApp(app){
    let cohortSession = new CHSession()

    return cohortSession.init().then( () => {
      app.set("cohort", cohortSession)
    })
  }

  // returns a flat array of all devices checked into active events
  allDevices(){
    let nestedDevices = this.events
    .map( event => event.devices)
    let flatDevices = _flatten(nestedDevices)
    let uniqueDevices = _uniqBy(flatDevices, 'id')
    return uniqueDevices
  }
} 

module.exports = CHSession