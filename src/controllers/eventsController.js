const knex = require('../knex/knex.js')
const eventsTable = require('../knex/queries/event-queries')
const devicesTable = require('../knex/queries/device-queries')

exports.events = (req, res) => {
  eventsTable.getAll()
  .then( events => {
    res.status(200).json(events)
  })
  .catch( error => {
    res.status = 500
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
    res.status = 500
    res.write(error)
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
      res.status = 500
      res.write(error)
      res.send()
    })
  } else {
    res.status = 500
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
    res.status = 500
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
        throw new Error(error)
      })
    })
    .catch( error => {
      res.status = 500
      res.write("Error: event with id: " + req.params.id + " does not exist")
      res.send()
    })
	} else {
    res.status = 500
    res.write('Error: request must include a device guid')
    res.send()
	}
}

exports.events_open = (req, res) => {
  eventsTable.getDevicesForEvent(req.params.id)
  .then( result => {
    req.app.get('cohort').devices = result
    res.status = 200
    res.write('Opened event id:' + req.params.id + ' with ' + req.app.get('cohort').devices.length + ' devices checked in')
    res.send()
  })
}