// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const CHDevice = require('../models/CHDevice')
const devicesTable = require('../knex/queries/device-queries')

exports.devices = (req, res) => {
	devicesTable.getAll()
	.then( devices => {
		if(req.query.tag !== undefined){
			devices = devices.filter( device => {
				console.log(device)
				if(device.tags == null) { return false }
				if(!Array.isArray(device.tags)){ 
					return new Error("Error: tags for device id:" + device.id + " are not an array")
				}
				return device.tags.includes(req.query.tag)
			})
		} // duped to eventsController, DRY it up
		res.status(200).json(devices)
	})
}

exports.devices_id = (req, res) => {
	devicesTable.getOneByID(req.params.id)
	.then( device => {
		res.status(200).json(device)
	})
	.catch( error => {
		res.status(404)
		res.write('Error: no device found with id:' + req.params.id)
		res.send()
	})
}

exports.devices_create = (req, res) => {
	// request must include a device guid
	if(req.body.guid == null ||  req.body.guid === undefined || req.body.guid ==  ""){
		res.status(400)
		res.write('Error: request must include a device GUID')
		res.send()
		return
	}
	// no duplicate devices allowed
	devicesTable.getAll().then( devices => {
		let matchingDevices = devices.filter((device) => { 
			return device.guid == req.body.guid 
		})
	
		if(matchingDevices.length > 0){
			if(matchingDevices.length == 1) {
				res.status(200)
				res.json(matchingDevices[0])
				return
			} else {
				res.status(500)
				res.write('Error 19234')
				res.send()
				return
			}
		}
	
		// happy path
		const device_guid = req.body.guid
	
		if(req.body.isAdmin != null && req.body.isAdmin !== undefined){
			device_isAdmin = req.body.isAdmin
		} else { device_isAdmin = false }

		let device_tags = null
		if(req.body.tags){
			device_tags = JSON.stringify(Array.from(req.body.tags))
		} 

		// add device to DB
		const device = {guid: device_guid, isAdmin: device_isAdmin, tags: device_tags}
		
		devicesTable.addOne(device)
		.then( deviceIDs => {
			console.log("created device: " + device_guid)
			return devicesTable.getOneByID(deviceIDs[0])
			.then( device => {
        res.status(201)
        res.location('/api/v1/devices/' + device.id)
				res.json(device)
			})
		})
	})
}

exports.devices_setTags= (req, res) => {
	let tags = req.body.tags

	if(tags){
		// request is well-formed
		let devices = devicesTable.getOneByID(req.params.id).then( device => {
			// we found a single device with a matching id
			return devicesTable.setTags(device.id, tags).then( deviceId => {
				return devicesTable.getOneByID(deviceId).then(updatedDevice => {
					res.status(200)
					res.json(updatedDevice)
					res.send()
					console.log("set tags for device:" + device.guid)
				})
			})
		})
		.catch( error => {
			console.log(error)
			res.statusCode = 404
			res.write("Error: no device found with id: " + req.params.id)
			res.send()
			console.log("Error: failed to add tags; no device found with matching id: " + req.params.id)
		})
	} else {
		res.statusCode = 400
		res.write("Error: Request must include a 'tags' array")
		res.send()
		console.log("Error: failed to set tags; request missing tags array")
	}
}

exports.devices_registerForNotifications = (req, res) => {
  let token = req.body.token
	if(token){
		// request is well-formed
		let devices = devicesTable.getOneByID(req.params.id)
		.then( device => {
			// we found a single device with a matching id
			return devicesTable.addApnsDeviceToken(device.id, token).then( deviceId => {
				return devicesTable.getOneByID(deviceId).then(updatedDevice => {
					res.status(200)
					res.json(updatedDevice)
					res.send()
					console.log("registered device for notifications: " + device.guid)
				})
			})
		})
		.catch( error => {
			res.statusCode = 404
			res.write("Error: no device found with id: " + req.params.id)
			res.send()
			console.log("Error: failed to register device for notifications; no device found with matching id: " + req.params.id)
		})
	} else {
		res.statusCode = 400
		res.write("Error: Request must include a 'token' object")
		res.send()
		console.log("Error: failed to register device for notifications; request missing token")
	}
}