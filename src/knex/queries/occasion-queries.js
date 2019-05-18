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

getAll = () => {
  return Occasions()
}

addOne = (occasion) => {
  return Occasions()
    .insert(occasion)
    .returning('id')
}

deleteOne = (occasionId) => {
  return Occasions()
    .where('id', parseInt(occasionId))
    .del()
    .returning('id')
}

getByDateForEvent = (eventId, dateString /* '1984-04-01', ie ISO8601 'YYYY-MM-DD' part only*/ ) => {
  return Occasions()
    .where('event_id', eventId)
    .andWhere(knex.raw("date_trunc('day', \"startDateTime\") = '" + dateString + "';"))
}

module.exports = {
  getOneByID: getOneByID,
  getAllForEvent: getAllForEvent,
  getAll: getAll,
  addOne: addOne,
  deleteOne: deleteOne,
  getByDateForEvent: getByDateForEvent
}