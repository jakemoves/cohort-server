const knex = require('../knex/knex.js')
const eventsTable = require('../knex/queries/event-queries')
const devicesTable = require('../knex/queries/device-queries')

exports.events = (req, res) => {
  eventsTable.getAll()
  .then( events => {
    res.status(200).json(events)
  })
  .catch( error => {
    res.status(500)
    res.write(error)
    res.send()
  })
}

exports.events_id = (req, res) => {
  eventsTable.getOneByID(req.params.id)
  .then( event => {
    res.status(200).json(event)
  })
  .catch( error => {
    res.status(404)
    res.write("Error: event with id:" + req.params.id + " not found")
    res.send()
  })
}

exports.events_create = (req, res) => {
  if(req.body.label != null && typeof req.body.null != undefined && req.body.label != ""){

    eventsTable.addOne(req.body)
    .then( eventIDs => {
      return eventsTable.getOneByID(eventIDs[0])
      .then( event => {
        res.status(200).json(event)
      })
    })
    .catch( error => {
      res.status(500)
      res.write(error)
      res.send()
    })
  } else {
    res.status(500)
    res.write("Error: request must include an event label (e.g., title of a show)")
    res.send()
  }
}

exports.events_delete = (req, res) => {
  eventsTable.getOneByID(req.params.id)
  .then( event => {
    return eventsTable.deleteOne(req.params.id)
    .then( () => {
      res.status(200).json(event)
    })
    .catch( error => {
      throw new Error(error)
    })
  })
  .catch( error => {
    res.status(500)
    res.write(error)
    res.send()
  })
}

exports.events_checkIn = (req, res) => {
	if(req.body.guid != null && req.body.guid != undefined && req.body.guid != ""){
    devicesTable.getOneByDeviceGUID(req.body.guid)
    .then( device => {
      const eventDeviceRelation = { 
        event_id: parseInt(req.params.id),
        device_id: device.id
      }
      return knex('events_devices')
      .insert(eventDeviceRelation).returning('id')
      .then( (eventDeviceRelationId) => {
        res.status(200).json(eventDeviceRelation)
      })
      .catch( error => {
        let errorExplanation
        if(error.code == '23505'){
          res.status(400)
          errorExplanation = 'Error: device is already checked in'
        } else if(error.code == '23503'){
          res.status(404)
          errorExplanation = "Error: no event found with id:" + req.params.id
        }
        res.write(errorExplanation)
        res.send()
      })
    })
    .catch( error => {
      res.status(500)
      res.write("Error: device with guid: " + req.body.guid + " does not exist")
      res.send()
    })
	} else {
    res.status(500)
    res.write('Error: request must include a device guid')
    res.send()
	}
}

exports.events_open = (req, res) => {
  eventsTable.getDevicesForEvent(req.params.id)
  .then( result => {
    req.app.get('cohort').devices = result
    res.status(200)
    res.write('Opened event id:' + req.params.id + ' with ' + req.app.get('cohort').devices.length + ' devices checked in')
    res.send()
  })
}

exports.events_close = (req, res) => {
  req.app.get('cohort').devices.forEach( device => {
    if(device.socket != null && typeof device.socket != undefined){
      device.socket.close(4002, "Event is over")
    }
  })
  req.app.get('cohort').devices = []
  res.sendStatus(200)
}

exports.events_devices = (req, res) => {
  eventsTable.getDevicesForEvent(req.params.id)
  .then( result => {
    res.status(200).json(result)
  })
}