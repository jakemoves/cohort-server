// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const knex = require('../knex.js')

Events = () => {
  return knex('events')
}

// queries

getAll = () => {
  return Events().select()
}

getAllOpen = () => {
  return Events().whereNot('state', 'closed')
}

getOneByID = (eventId) => {
  return Events().where('id', parseInt(eventId))
  .then( events => {
    if(events.length == 1){
      return events[0]
    } else {
      return null
    }
  })
}

addOne = (event) => {
  return Events()
    .insert(event)
    .returning('id')
}

deleteOne = (eventId) => {
  return Events()
    .where('id', parseInt(eventId))
    .del()
    .returning('id')
}

checkIn = (eventId, deviceId) => {
  // defined inline in eventsController.js
}

open = (eventId) => {
  return Events()
    .where('events.id', parseInt(eventId))
    .update({'state': 'open'})
    .returning('id')
    .then( id => {
      return Events().where('events.id', parseInt(id)).then( events => events[0])
    })
}

close = (eventId) => {
  return Events()
    .where('events.id', parseInt(eventId))
    .update({'state': 'closed'})
    .returning('id')
    .then( id => {
      return Events().where('events.id', parseInt(id)).then( events => events[0])
    })
}

module.exports = { 
  getAll: getAll,
  getAllOpen: getAllOpen,
  getOneByID: getOneByID,
  addOne: addOne,
  deleteOne: deleteOne,
  open: open,
  close: close
}