const knex = require('../knex.js')

Occasions = () => {
  return knex('occasions')
}

// queries
getOneByID = (occasionId) => {
  return Occasions().where('id', parseInt(occasionId))
  .then( occasions => {
    if(occasions.length == 1){
      return occasions[0]
    } else {
      return null
    }
  })
}

getAllForEvent = (eventId) => {
  return Occasions().where('event_id', parseInt(eventId))
}

addOne = (occasion) => {
  return Occasions()
    .insert(occasion)
    .returning('id')
}

module.exports = {
  getOneByID: getOneByID,
  getAllForEvent: getAllForEvent,
  addOne: addOne
}