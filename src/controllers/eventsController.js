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
    let newEvent = { label: req.body.label, isOpen: false }
    eventsTable.addOne(newEvent)
    .then( eventIDs => {
      return eventsTable.getOneByID(eventIDs[0])
      .then( event => {
        console.log(event)
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
    console.log(result)
    // update db
    eventsTable.open(req.params.id)

    .then( event => {
      console.log(event)
      // this should get refactored to CHEvent.open
      // and devices should live on their event
      req.app.get('cohort').devices = result
      req.app.get('cohort').event = event
      event.devices = result

      console.log(event)

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
  req.app.get('cohort').devices.forEach( device => {
    if(device.socket != null && typeof device.socket != undefined){
      device.socket.close(4002, "Event is over")
    }
  })

  // update db
  eventsTable.close(req.params.id)
  .then( event => {
    // this should get refactored to CHEvent.close
    req.app.get('cohort').devices = []
    req.app.get('cohort').event = null

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