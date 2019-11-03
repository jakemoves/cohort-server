// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const knex = require('../knex.js')

Occasions = () => {
  return knex('occasions')
}

// queries

addOne = (occasion) => {
  occasion.event_id = occasion.eventId
  delete occasion.eventId

  return Occasions()
    .insert(occasion)
    .returning('id')
    .then(occasionIDs => {
      if(occasionIDs.length == 1){
        return Occasions().where('id', parseInt(occasionIDs[0])).then( occasions => {
          return occasions[0]
        })
      } else {
        return null
      }
    })
}

deleteOne = (occasionId) => {
  return Occasions()
    .where('id', parseInt(occasionId))
    .del()
    .returning('id')
}

getAllOpen = () => {
  return Occasions().where('state', 'open')
}

// getOneByID = (occasionId) => {
//   return Occasions().where('id', parseInt(occasionId))
//   .then( occasions => {
//     if(occasions.length == 1){
//       return occasions[0]
//     } else {
//       return null
//     }
//   })
// }

// getAllForEvent = (eventId) => {
//   return Occasions().where('event_id', parseInt(eventId))
// }







// getOccasionsOnOrAfterDate = (eventId, dateString /* '1984-04-01', ie ISO8601 'YYYY-MM-DD' part only*/ ) => {
//   return Occasions()
//     .where('event_id', eventId)
//     .andWhere(knex.raw("date_trunc('day', \"startDateTime\") >= '" + dateString + "';"))
// }

module.exports = {
  addOne: addOne,
  deleteOne: deleteOne,
  getAllOpen: getAllOpen
  // getOneByID: getOneByID,
  // getAllForEvent: getAllForEvent,
  // getAll: getAll,
  // getOccasionsOnOrAfterDate: getOccasionsOnOrAfterDate
}