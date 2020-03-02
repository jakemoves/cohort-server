// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const moment = require('moment')
// const passport = require('passport')

if(process.env.NODE_ENV != 'localoffline'){
  const occasionsTable = require('../knex/queries/occasion-queries')
  const eventsTable = require('../knex/queries/event-queries')
}

const CHOccasion = require('../models/CHOccasion')
const broadcastService = require('../services/broadcastService')
const qrcodeService = require('../services/qrcodeService')

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

  if(req.user.id != event.owner_id && !req.user.is_admin){
    handleError(401, "Authorization required", res)
    return
  }
  
  let occasion = req.body
  occasion.owner_id = event.owner_id

  // this smells, a little -- should we be creating the occasion in memory using the class and then storing it?
  occasion.state = "closed"
  
  occasionsTable.addOne(occasion).then( occasion => {
    res.status(201)
    res.location('/api/v2/occasions/' + occasion.id)
    res.json(occasion)
  })
  .catch( error => {
    handleError(500, error, res)
  })
}

exports.occasions_delete = async (req, res) => {
  let occasion = await occasionsTable.getOneByID(req.params.id)

  if(occasion == null || occasion === undefined){
    handleError(404, "Error: occasion with id:" + req.params.id + " not found", res)
    return
  }

  if(req.user.id != occasion.owner_id && !req.user.is_admin){
    handleError(401, "Authorization required", res)
    return
  }

  // verify the occasion is closed
  if(occasion != null && occasion.state == 'opened'){
    handleError(400, 'Error: an opened occasion cannot be deleted. Close the occasion and try again.', res)
    return
  }

  return occasionsTable.deleteOne(req.params.id)
  .then( deletedIds => {
    if(deletedIds.length == 1) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })
  .catch( error => {
    handleError(500, error, res)
  })  
}

exports.occasions_update = async (req, res) => {
  let occasion = await occasionsTable.getOneByID(req.params.id)

  if(occasion == null || occasion === undefined){
    handleError(404, "Error: occasion with id:" + req.params.id + " not found", res)
    return
  }

  // user must be the owner OR the user must be an admin
  if(!(req.user.id == occasion.owner_id || req.user.is_admin)){
    console.log(req.user)
    handleError(401, "Authorization required", res)
    return
  }
  
  if(req.body.state == null || req.body.state === undefined){
    handleError(400, "Error: no updateable property was found in the request (i.e. 'state')", res)
    return
  }

  if(!(req.body.state == 'opened' || req.body.state == 'closed')){
    handleError(400, "Error: event state can only be set to 'opened' or 'closed'", res)
    return
  }

  let updatedDbOccasion = await occasionsTable
    .update(req.params.id, 'state', req.body.state)
    .catch( error => {
      handleError(500, error, res)
    })

  switch(updatedDbOccasion.state) {
    case 'opened': {
      let occasion = CHOccasion.fromDatabaseRow(updatedDbOccasion)
      req.app.get('cohortSession').addListenersForOccasion(occasion)
      occasion.open()
      break }
    case 'closed': {
      let occasion = req.app.get('cohortSession').openOccasions
        .find( occasion => occasion.id == updatedDbOccasion.id)
      occasion.close()
      break }
    default: break
  }
  res.status(200).json(updatedDbOccasion) 
  // doesn't return devices with the occasion, but that might not be relevant for open / close updates; a just-opened event shouldn't have any devices connected, and a just-closed one doesn't either
}
  
exports.occasions_broadcast = async (req, res, next) => {
  const occasionId = req.params.id

  const occasion = req.app.get('cohortSession').openOccasions
    .find( occasion => occasion.id == occasionId)

  if(occasion === undefined){
    handleError(404, 'Error: no open occasion found with id:' + occasionId, res)
    return
  }

  // TODO eventually we may need a PermissionsService to do these checks?
  // if(occasion.owner_id != req.user.id && !req.user.is_admin){
  //   handleError(401, 'Authorization required', res)
  //   return
  // }

  const cue = req.body
  
  try {
    const results = await broadcastService.broadcast(occasion, cue)
    res.status(200).json(results)
  } catch(error) {
    handleError(409, error, res)
    return
  }
}

exports.occasions_qrcode = async (req, res) => {
  const occasionId = req.params.id
  let occasion = await occasionsTable.getOneByID(occasionId)

  if(occasion == null || occasion === undefined){
    handleError(404, "Error: occasion with id:" + occasionId + " not found", res)
    return
  }

  if(req.user.id != occasion.owner_id && !req.user.is_admin){
    handleError(401, "Authorization required", res)
    return
  }

  const baseURL = req.hostname
  let protocol

  // check for localhost, computername.local, and IP address
  if((baseURL.match(/local/) != null) ||
      baseURL.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)){
    protocol = "http"
  } else {
    protocol = "https"
  }

  const qrcodeURL = protocol + '://' + baseURL + '/join/occasions/' + occasionId

  try {
    const qrcode = await qrcodeService.getQRCode(qrcodeURL)
    res.status(200).send(qrcode)
  } catch(error){
    handleError(500, error, res)
    return
  }
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
