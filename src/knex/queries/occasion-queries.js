const knex = require('../knex.js')

Occasions = () => {
  return knex('occasions')
}

// queries

getAllForEvent = (eventId) => {
  return Occasions().where('event_id', eventId)
}

addOne = (occasion) => {
  return Occasions()
    .insert(occasion)
    .returning(id)
}

module.exports = {
  getAllForEvent: getAllForEvent,
  addOne: addOne
}