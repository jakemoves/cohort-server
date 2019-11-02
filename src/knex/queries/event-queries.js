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

// open = (eventId) => {
//   return Events()
//     .where('events.id', parseInt(eventId))
//     .update({'state': 'open'})
//     .returning('id')
//     .then( id => {
//       return Events().where('events.id', parseInt(id)).then( events => events[0])
//     })
// }

// close = (eventId) => {
//   return Events()
//     .where('events.id', parseInt(eventId))
//     .update({'state': 'closed'})
//     .returning('id')
//     .then( id => {
//       return Events().where('events.id', parseInt(id)).then( events => events[0])
//     })
// }

module.exports = { 
  getAll: getAll,
  getOneByID: getOneByID,
  addOne: addOne,
  deleteOne: deleteOne
  // open: open,
  // close: close
}