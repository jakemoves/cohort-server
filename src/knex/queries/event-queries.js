const knex = require('../knex.js')
const CHDevice = require('../../models/CHDevice')

Events = () => {
  return knex('events')
}

// queries

getAll = () => {
  return Events().select()
}

getOneByID = (eventId) => {
  return Events().where('id', parseInt(eventId)).first()
}

addOne = (event) => {
  return Events()
    .insert(event)
    .returning('id')
}

deleteOne = (eventId) => {
  return Events().where('id', parseInt(eventId)).del()
}

checkIn = (eventId, deviceId) => {
  // defined inline in eventsController.js
}

getDevicesForEvent = (eventId) => {
  return Events()
    .where('events.id', parseInt(eventId))
    .join('events_devices', 'events.id', 'events_devices.event_id')
    .join('devices', 'device_id', 'devices.id')
    .select(
      'event_id',
      'label', 
      'guid as device_guid', 
      'apnsDeviceToken as device_apnsDeviceToken', 
      'isAdmin as device_isAdmin', 
    )
    .reduce((devices, result) => {
      let device = new CHDevice(result.device_guid)
      device.apnsDeviceToken = result.device_apnsDeviceToken
      device.isAdmin = result.device_isAdmin
      devices.push(device)
      return devices
    }, [])
}

module.exports = { 
  getAll: getAll,
  getOneByID: getOneByID,
  addOne: addOne,
  deleteOne: deleteOne,
  getDevicesForEvent: getDevicesForEvent
}