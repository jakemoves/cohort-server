// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const _flatten = require('lodash/flatten')
const _uniqBy = require('lodash/uniqBy')

let occasionsTable
if(process.env.NODE_ENV != 'localoffline') {
  occasionsTable = require('../knex/queries/occasion-queries')
}

const CHOccasion = require('./CHOccasion')

class CHSession {
  openOccasions
  errors // used for testing

  constructor(){
    this.openOccasions = []
    this.errors = []
  }

  async init() {
    let openOccasionsInDB 
    if(process.env.NODE_ENV != 'localoffline') {
      openOccasionsInDB = await occasionsTable.getAllOpen()
    } else {
      openOccasionsInDB = [{
        id: 1, 
        label: "Rehearsal", 
        owner_id: 1
      }]
    }

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
      app.set("cohortSession", cohortSession)
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
  
  // returns a flat array of all devices checked into opened occasions
  allDevices(){
    const nestedDevices = this.openOccasions
      .map( occasion => occasion.devices)
    const flatDevices = _flatten(nestedDevices)
    const uniqueDevices = _uniqBy(flatDevices, 'guid')
    return uniqueDevices
  }
} 

module.exports = CHSession