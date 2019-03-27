class CHDevice {
	id
	isAdmin
	guid
	socket = null
	tags
	apnsDeviceToken // apple push notification service -- uses unique id generated on the device
	
	constructor(id, guid, isAdmin = false, tags = [], apnsDeviceToken = null){
		this.id = id // database ID
		this.guid = guid // device unique ID
		this.isAdmin = isAdmin
		this.tags = tags
		this.apnsDeviceToken = apnsDeviceToken
	}

	isConnected(){
		return (
			this.socket != null && 
			this.socket !== undefined && 
			this.socket.isAlive /* used by keepalive function */ && this.socket.readyState == 1)
	}

	static fromDatabaseRow(dbDevice){
		const tags = new Set(JSON.parse(dbDevice.tags))
		return new CHDevice(dbDevice.id, dbDevice.guid, dbDevice.isAdmin, tags, dbDevice.apnsDeviceToken)
	}

	deviceState(){
		let socketIsOpen
		if(this.socket == null || this.socket.readyState !== 1){
			socketIsOpen = false
		} else if(this.socket.readyState == 1){
			socketIsOpen = true
		}

		return { 
			guid: "" + this.guid, // coerce to string in case of numeric guid
			socketOpen: socketIsOpen,
			isAdmin: this.isAdmin
		}
	}

}

module.exports = CHDevice