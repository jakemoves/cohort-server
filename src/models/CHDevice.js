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
	isConnected(){
		return (
			this.socket != null && 
			this.socket !== undefined && 
			this.socket.isAlive /* used by keepalive function */ && this.socket.readyState == 1)
	}
}

module.exports = CHDevice