class CHDevice {
	isAdmin = false
	guid
	socket = null
	apnsDeviceToken = null // apple push notification service -- uses unique id generated on the device
	constructor(guid){
		this.guid = guid
	}
	// TODO add posture, media status, media control
}

module.exports = CHDevice