const CHDevice = require('../models/CHDevice')
const devicesTable = require('../knex/queries/device-queries')

exports.devices = (req, res) => {
	devicesTable.getAll()
	.then( devices => {
		res.status(200).json(devices)
	})
}

exports.devices_id = (req, res) => {
	devicesTable.getOneByID(req.params.id)
	.then( device => {
		console.log(device)
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
	if(req.body.guid == null || typeof req.body.guid == undefined){
		res.status = 400
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
			res.status = 400
			res.write('Error: device ' + req.body.guid + ' already exists')
			res.send()
			return
		}
	
		// happy path
		
		let device = new CHDevice(req.body.guid)
	
		if(req.body.isAdmin != null && typeof req.body.isAdmin != undefined){
			device.isAdmin = req.body.isAdmin
		}
		
		// add device to DB
		devicesTable.addOne({ 
			guid: device.guid, isAdmin: device.isAdmin
		})
		.then( deviceIDs => {
			console.log("created device: " + device.guid)
			return devicesTable.getOneByID(deviceIDs[0])
			.then( device => {
				res.status(200).json(device)
			})
		})
	})
}

exports.devices_registerForNotifications = (req, res) => {
  
  let devices = req.app.get('cohort').devices

  let guid = req.body.guid
  let token = req.body.token
  
	if(token && guid){
		// request is well-formed
		var device = devices.filter((device) => {
			return device.guid == guid
		})
		if(device.length < 1 || device == null){
			res.statusCode = 400
			res.write("Error: no device found with matching GUID: " + guid)
			res.send()
			console.log("Error: failed to register device for notifications; no device found with matching GUID: " + guid)
		} else if(device.length > 1){
      // TODO avoid having duplicate GUIDs created in the first place (see above)
		} else {
			// we found a single device with a matching GUID
			device = device[0]
			if(device.apnsDeviceToken == null){
				device.apnsDeviceToken = token
				res.sendStatus(200)
				console.log("registered device for notifications: " + device.guid)
			} else {
				res.statusCode = 400
				res.write("Warning: Device with GUID " + guid + " is already registered for notifications")
        res.send()
        console.log("Warning: failed to register device for notifications; device with GUID " + guid + " is already registered for notifications")
			}
		}
	} else {
		res.statusCode = 400
		res.write("Error: Request must include 'token' and 'guid' objects")
		res.send()
		console.log("Error: failed to register device for notifications; request missing token and/or guid")
	}
}