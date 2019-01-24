const knex = require('../knex.js')
const CHDevice = require('../../models/CHDevice')

Events = () => {
  return knex('events')
}

// queries

getAll = () => {
  return Events().select()
}

getAllActiveWithDevices = () => {
  return Events()
    .whereNot('state', 'closed')
    .map( event => {
      return getDevicesForEvent(event.id).then( devices => {
        event.devices = devices
        return event
      })
    })
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

getOneByIDWithDevices = (eventId) => {
  return getOneByID(eventId)
  .then( events => {
    if(events.length == 1){
      event = events[0]
      return getDevicesForEvent(event.id).then( devices => {
        event.devices = devices
        return event
      })
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

getDevicesForEvent = (eventId) => {
  return Events()
    .where('events.id', parseInt(eventId))
    .join('events_devices', 'events.id', 'events_devices.event_id')
    .join('devices', 'devices.id', 'events_devices.device_id' )
    .select(
      'device_id as id',
      'guid', 
      'apnsDeviceToken', 
      'isAdmin', 
    )
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

checkOutAllDevices = (eventId) => {
  return knex('events_devices')
  .where('event_id', parseInt(eventId))
  .del()
}

module.exports = { 
  getAll: getAll,
  getAllActiveWithDevices: getAllActiveWithDevices,
  getOneByID: getOneByID,
  getOneByIDWithDevices: getOneByIDWithDevices,
  addOne: addOne,
  deleteOne: deleteOne,
  getDevicesForEvent: getDevicesForEvent,
  open: open,
  close: close
}