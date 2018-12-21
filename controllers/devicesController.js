const CHDevice = require('../models/CHDevice')

exports.devices_create = (req, res) => {
  let devices = req.app.get('cohort').devices

	// request must include a device guid
	if(req.body.guid == null || typeof req.body.guid == undefined){
		res.status = 400
		res.write('Error: request must include a device GUID')
		res.send()
		return
	}

	// no duplicate devices allowed
	
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
  devices.push(device)

  res.sendStatus(200)

  console.log("created device: " + device.guid)
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
			if(device.notifications.deviceToken == null){
				device.notifications.deviceToken = token
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