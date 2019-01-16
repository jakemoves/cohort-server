class CHDevice {
	isAdmin
	guid
	socket = null
	apnsDeviceToken // apple push notification service -- uses unique id generated on the device
	constructor(guid, isAdmin = false, apnsDeviceToken = null){
		this.guid = guid
		this.isAdmin = isAdmin
		this.apnsDeviceToken = apnsDeviceToken
	}
}

module.exports = CHDevice