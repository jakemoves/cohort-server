const occasionsTable = require('../knex/queries/occasion-queries')
const eventsTable = require('../knex/queries/event-queries')

exports.occasionsForEvent = ( req, res ) => {
  let eventId = req.params.id

  occasionsTable.getAllForEvent(eventId)
  .then( occasions => {
    res.status(200).json(occasions)
  })
  .catch( error => {
    console.log(error)
    res.status(500).write(error.message).send()
  })
}

exports.occasions = (req, res) => {
  occasionsTable.getAll()
  .then( occasions => {
    res.status(200).json(occasions)
  })
  .catch( error => {
    console.log(error)
    res.status(500).write(error.message).send()
  })
}

exports.occasions_create = (req, res) => {
  // validate request
  // must have valid event
  let eventId = req.params.id
  let event = eventsTable.getOneByID(eventId)

  if(event == null){
    res.status(404)
    res.write('Error: event with id:' + eventId + ' not found')
    res.send()
  }

  let occasion = req.body

  // add validation!
  
  occasion.event_id = eventId
  occasionsTable.addOne(occasion).then( occasionId => {
    console.log('created occasion id:' + occasionId)
    occasionsTable.getOneByID(occasionId).then( createdOccasion => {
      console.log('got occasion id:' + createdOccasion.id)
      res.status(201)
      res.location('api/v1/events/' + eventId + '/occasions/' + createdOccasion.id)
      res.json(createdOccasion)
    })
  })
  .catch( error => {
    console.log(error)
  })
}

exports.occasions_delete = (req, res) => {
  return occasionsTable.deleteOne(req.params.id)
  .then( (deletedIds) => {
    if(deletedIds.length == 1) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })
  .catch( error => {
    console.log(error)
    res.status(500)
    res.write(error.message)
    res.send()
  })  
}