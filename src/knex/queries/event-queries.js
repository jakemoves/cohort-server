const knex = require('../knex.js')

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

}

module.exports = { 
  getAll: getAll,
  getOneByID: getOneByID,
  addOne: addOne,
  deleteOne: deleteOne
}