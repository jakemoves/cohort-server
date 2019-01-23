const eventsTable = require('../knex/queries/event-queries')
const CHEvent = require('./CHEvent')

class CHSession {
  events

  constructor(){
    this.events = []
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
} 

module.exports = CHSession