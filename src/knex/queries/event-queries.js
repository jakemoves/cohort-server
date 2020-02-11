// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const knex = require('../knex.js')

Events = () => {
  return knex('events')
}

// queries

getAll = async () => {
  let events = await Events().select()
  
  for(event of events){
    event.occasions = await occasionsForEvent(event.id)
  }
  
  return events
}

getAllOwnedByUser = async (userId) => {
  let events = await Events().where('owner_id', parseInt(userId))

  for(event of events){
    event.occasions = await occasionsForEvent(event.id)
  }
  
  return events
}

occasionsForEvent = (eventId) => {
  return Events()
    .join('occasions', 'events.id', '=', 'occasions.event_id')
    .where('event_id', parseInt(eventId))
}

getOneByID = async eventId => {
  let events = await Events().where('id', parseInt(eventId))
  let event

  if(events.length == 1){
    event = events[0]
  } else {
    return null
  }

  event.occasions = await occasionsForEvent(event.id)

  return event 
}

addOne = (event) => {
  event.episodes = JSON.stringify(event.episodes)

  return Events()
    .insert(event)
    .returning('id')
    .then(eventIDs => {
      if(eventIDs.length == 1){
        return Events().where('id', parseInt(eventIDs[0])).then( events => {
          return events[0]
        })
      } else {
        return null
      }
    })
}

deleteOne = (eventId) => {
  return Events()
    .where('id', parseInt(eventId))
    .del()
    .returning('id')
}

updateEpisodesForEvent = (eventId, episodes) => {
  episodes = JSON.stringify(episodes)

  return Events()
    .where('id', parseInt(eventId))
    .update('episodes', episodes)
}

module.exports = { 
  getAll: getAll,
  getAllOwnedByUser: getAllOwnedByUser,
  getOneByID: getOneByID,
  addOne: addOne,
  deleteOne: deleteOne,
  updateEpisodesForEvent: updateEpisodesForEvent
}