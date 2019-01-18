const knex = require('../knex/knex.js')
const eventsTable = require('../knex/queries/event-queries')
const devicesTable = require('../knex/queries/device-queries')
const CHDevice = require('../models/CHDevice')
const CHEvent = require('../models/CHEvent')

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
    let newEvent = { label: req.body.label, state: 'closed' }
    eventsTable.addOne(newEvent)
    .then( eventIDs => {
      return eventsTable.getOneByID(eventIDs[0])
      .then( event => {
        res.status(200).json(event)
      })
    })
    .catch( error => {
      console.log(error)
      res.status(500)
      res.write(error.message)
      res.send()
    })
  } else {
    res.status(500)
    res.write("Error: request must include an event label (e.g., title of a show)")
    res.send()
  }
}

exports.events_delete = (req, res) => {
  if(req.app.get("cohort").events.find( event => event._id == req.params.id)){
    res.status(403)
    res.write("Error: this event must be closed before it can be deleted")
    res.send()
  } else {
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
}

exports.events_checkIn = (req, res) => {
	if(req.body.guid != null && req.body.guid != undefined && req.body.guid != ""){
    devicesTable.getOneByDeviceGUID(req.body.guid)
    .then( device => {

      // if the event is open, we also need to add the device to it in memory
      let event = req.app.get("cohort").events.find( event => event._id == req.params.id)
      if( event !== undefined){
        let deviceObject = new CHDevice( 
          device.id,
          device.guid, 
          device.isAdmin, 
          device.apnsDeviceToken
        )
        event.checkInDevice(deviceObject)
      }

      const eventDeviceRelation = { 
        event_id: parseInt(req.params.id),
        device_id: device.id
      }
      return knex('events_devices')
      .insert(eventDeviceRelation).returning('id')
      .then( (eventDeviceRelationId) => {
        return eventsTable.getOneByID(req.params.id).then( updatedEvent => {
          res.status(200).json(updatedEvent)
        })
      })
      .catch( error => {
        if(error.code == '23505'){
          res.status(200)
          res.json(eventDeviceRelation)
        } else if(error.code == '23503'){
          res.status(404)
          res.write("Error: no event found with id:" + req.params.id)
          res.send()
        }
      })
    })
    .catch( error => {
      console.log(error)
      res.status(500)
      res.send()
    })
	} else {
    res.status(400)
    res.write('Error: request must include a device guid')
    res.send()
	}
}

exports.events_open = (req, res) => {
  eventsTable.getDevicesForEvent(req.params.id)
  .then( devices => {
    // update db
    eventsTable.open(req.params.id)

    .then( dbEvent => {
      let event = new CHEvent(dbEvent.id, dbEvent.label, devices)
      event.open()
      // need to add listeners here for device add/remove... and then figure out how to DRY that up (repeated in app.js)
      req.app.get("cohort").events.push(event)

      res.status(200)
      res.json(event)
      res.send()
    })
    .catch( error => {
      console.log(error)
    })
  })
}

exports.events_close = (req, res) => {
  let event = req.app.get('cohort').events.find( event => event._id == req.params.id)
  if( event !== undefined ){ 
    event.close()
    req.app.get("cohort").events.splice(
      req.app.get("cohort").events.findIndex(
        event => event._id == req.params.id
      ), 1)
  }
  // update db
  eventsTable.close(req.params.id)
  .then( event => {
    res.status(200)
    res.json(event)
    res.send()
  })
}

exports.events_devices = (req, res) => {
  eventsTable.getDevicesForEvent(req.params.id)
  .then( result => {
    res.status(200).json(result)
  })
}