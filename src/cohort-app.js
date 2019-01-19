// import dependencies
const express = require('express');
const bodyParser = require('body-parser')
require('dotenv').config({ path: __dirname + '/../.env' })

const CHEvent = require('./models/CHEvent')
const knex = require('./knex/knex.js')
const eventsTable = require('./knex/queries/event-queries')

// configure express
const app = express()
const jsonParser = bodyParser.json()
const routes = require('./routes.js')
app.use(bodyParser.json())

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
  next()
})

app.use('/api/v1', routes)
app.use(express.static('public'))

/*
 *   Cohort
 */

app.set("cohort", {
  events: []
})

// load events that are not closed into memory
loadActiveEvents = async () => {
  let activeEventsInDB
  try {
    activeEventsInDB = await eventsTable.getAllActiveWithDevices()
  } catch (error) {
    console.log(error)
  }

  if(activeEventsInDB.length > 0){
    let activeEvents = activeEventsInDB.map( dbEvent => {
      let event = new CHEvent(dbEvent.id, dbEvent.label, dbEvent.devices )
      event.on('deviceCheckedIn', device => {
        console.log('device ' + device.guid + ' checked into event ' + event._label)
      }) // eventually we probably want to store listeners so we can remove them when the event is deleted from memory...
      event.open()
      return event
    })
    app.set("cohort", {
      events: activeEvents
    })
  }
}

loadActiveEvents()

/*
 *   Database 
 */

/* 
 * 	 Apple Push Notifications 
 */

//const apnProvider = require('./cohort-apple-notifications')
//app.set('apnProvider', apnProvider)

module.exports = app
