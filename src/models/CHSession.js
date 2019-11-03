// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const _flatten = require('lodash/flatten')
const _uniqBy = require('lodash/uniqBy')

const occasionsTable = require('../knex/queries/occasion-queries')
const CHOccasion = require('./CHOccasion')

class CHSession {
  openOccasions
  errors // used for testing

  constructor(){
    this.openOccasions = []
    this.errors = []
  }

  async init() {
    let openOccasionsInDB = await occasionsTable.getAllOpen()

    let openOccasions = openOccasionsInDB.map( dbOccasion => {
      return CHOccasion.fromDatabaseRow(dbOccasion)
    })

    openOccasions.forEach( occasion => {
      this.addListenersForOccasion(occasion)
      occasion.open()
      // the event listener handles adding opened occasions to this.openOccasions
    })
    
    return Promise.resolve()
  }

  static initAndSetOnApp(app){
    let cohortSession = new CHSession()

    return cohortSession.init().then( () => {
      app.set("cohort", cohortSession)
    })
  }

  addListenersForOccasion(occasion){
    occasion.on('transition', data => {
      if(data.toState == 'closed'){
        // remove the occasion from the session
        let occasionIndex = this.openOccasions.findIndex(
          matchingOccasion => matchingOccasion.id == occasion.id
        )
        if(occasionIndex !== undefined){
          this.openOccasions.splice(occasionIndex, 1)
        } else {
          throw new Error("Closed event was not present in session!")
        }
      }
      if(data.toState == 'opened'){
        this.openOccasions.push(occasion)
      }
    })
  }
  
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