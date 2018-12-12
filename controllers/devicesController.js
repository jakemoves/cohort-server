const CHDevice = require('../models/CHDevice')

exports.devices_create = (req, res) => {
  let devices = req.app.get('cohort').devices

  // TODO: avoid creating duplicate device instances
  let device = new CHDevice()
  devices.push(device)

  res.status = 200
  res.write(JSON.stringify({guid: device.guid}))
  res.send()

  console.log("created device: " + device.guid)
}

exports.device_registerForNotifications = (req, res) => {
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
			console.log("Error: no device found with matching GUID: " + guid)
		} else if(device.length > 1){
			res.statusCode = 400
			res.write("Error: non-unique GUID")
			res.send()
			console.log("Error: non-unique GUID")
		} else {
			// we found a single device with a matching GUID
			device = device[0]
			if(device.notifications.deviceToken == null){
				device.notifications.deviceToken = token
				res.sendStatus(200)
				console.log("registered device for notifications: " + device.guid)
			} else {
				res.statusCode = 200
				res.write("Warning: Device is already registered for notifications")
				res.send()
			}
		}
	} else {
		res.statusCode = 400
		res.write("Error: Request must include 'token' and 'guid' objects")
		res.send()
		console.log("Error: failed to register device for notifications, request missing token and/or guid")
	}
}