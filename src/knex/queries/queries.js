const knex = require('../knex.js')

Devices = () => {
  return knex('devices')
}

Events = () => {
  return knex('events')
}

// queries

getAllDevices = () => {
  return Devices().select()
}

getAllEvents = () => {
  return Events().select()
}

module.exports = { 
  getAllDevices: getAllDevices,
  getAllEvents: getAllEvents
}