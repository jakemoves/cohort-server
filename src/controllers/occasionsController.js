// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const moment = require('moment')

const occasionsTable = require('../knex/queries/occasion-queries')
const eventsTable = require('../knex/queries/event-queries')

handleError = (httpStatusCode, error, res) => {
  console.log(error)

  if(error.message !== undefined){
    error = error.message
  }

  res.status(httpStatusCode)
  res.write(error)
  res.send()
}

exports.occasions_create = async (req, res) => {
  // validate request
  // it must have an eventId
  let eventId = req.body.eventId

  if(eventId == null || eventId === undefined){
    handleError(400, 'Error: request must include an existing event id (as "eventId" property)', res)
    return
  }

  let event = await eventsTable.getOneByID(eventId)

  if(event == null){
    handleError(404, 'Error: event with id:' + eventId + ' not found. To create an occasion, you must include an eventId property corresponding to an existing event.', res)
    return
  }
  
  let occasion = req.body
  occasion.state = "closed"
  
  occasionsTable.addOne(occasion).then( occasion => {
    res.status(201)
    res.location('/api/v2/occasions/' + occasion.id)
    res.json(occasion)
    return
  })
  .catch( error => {
    handleError(500, error, res)
  })
}

// exports.occasionsForEvent = ( req, res ) => {
//   let eventId = req.params.id

//   occasionsTable.getAllForEvent(eventId)
//   .then( occasions => {
//     res.status(200).json(occasions)
//   })
//   .catch( error => {
//     console.log(error)
//     res.status(500).write(error.message).send()
//   })
// }

// exports.occasions = (req, res) => {
//   occasionsTable.getAll()
//   .then( occasions => {
//     res.status(200).json(occasions)
//   })
//   .catch( error => {
//     console.log(error)
//     res.status(500).write(error.message).send()
//   })
// }

// exports.occasions_delete = (req, res) => {
//   return occasionsTable.deleteOne(req.params.id)
//   .then( (deletedIds) => {
//     if(deletedIds.length == 1) {
//       res.sendStatus(204)
//     } else {
//       res.sendStatus(404)
//     }
//   })
//   .catch( error => {
//     console.log(error)
//     res.status(500)
//     res.write(error.message)
//     res.send()
//   })  
// }

// exports.event_occasions_upcoming = (req, res) => {
//   if(!req.query.onOrAfterDate){
//     res.status(400)
//     res.write('Error: request must include an "onOrAfterDate" query parameter in YYYY-MM-DD format')
//     res.send()
//     return
//   }

//   const todaysDate = req.query.onOrAfterDate
//   console.log(todaysDate)

//   return occasionsTable.getOccasionsOnOrAfterDate(req.params.id, todaysDate)
//   .then( occasions => {
//     res.status(200)
//     console.log(occasions)
//     res.json(occasions)
//   })
//   .catch( error => {
//     console.log(error)
//     res.status(500)
//     res.write(error.message)
//     res.send()
//   })
// }
