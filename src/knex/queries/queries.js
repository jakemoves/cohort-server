const knex = require('../knex.js')

Events = () => {
  return knex('events')
}

// queries

getAllEvents = () => {
  return Events().select()
}

getSingleEventByID = (eventId) => {
  return Events().where('id', parseInt(eventId)).first()
}

addEvent = (event) => {
  return Events()
    .insert(event)
    .returning('id')
}

module.exports = { 
  getAllEvents: getAllEvents,
  getSingleEventByID: getSingleEventByID,
  addEvent: addEvent
}