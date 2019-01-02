const queries = require('../knex/queries/queries')

exports.events = (req, res) => {
  queries.getAllEvents()
  .then( events => {
    res.status(200).json(events)
  })
  .catch( error => {
    res.status(500).write(error).send()
  })
}

exports.events_id = (req, res) => {
  queries.getSingleEventByID(req.params.id)
  .then( event => {
    res.status(200).json(event)
  })
  .catch( error => {
    res.status(500).write(error).send()
  })
}

exports.events_create = (req, res) => {
  if(req.body.label != null && typeof req.body.null != undefined && req.body.label != ""){

    queries.addEvent(req.body)
    .then( eventID => {
      return queries.getSingleEventByID(eventID[0])
      .then( event => {
        res
          .status(200)
          .json(event)
      })
    })
    .catch( error => {
      res.status(500).write(error).send()
    })
  } else {
    res.status = 500
    res.write("Error: request must include an event label (e.g., title of a show)")
    res.send()
  }
}

exports.events_delete = (req, res) => {
  queries.getSingleEventByID(req.params.id)
  .then( event => {
    return queries.deleteEvent(req.params.id)
    .then( () => {
      res.status(200).json(event)
    })
    .catch( error => {
      resolve(error)
    })
  })
  .catch( error => {
    res.status(500).write(error).send()
  })
}