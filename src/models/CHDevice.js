class CHDevice {
	_id
	isAdmin
	guid
	socket = null
	apnsDeviceToken // apple push notification service -- uses unique id generated on the device
	constructor(id, guid, isAdmin = false, apnsDeviceToken = null){
		this._id = id // database ID
		this.guid = guid // device unique ID
		this.isAdmin = isAdmin
		this.apnsDeviceToken = apnsDeviceToken
	}
}

module.exports = CHDevice