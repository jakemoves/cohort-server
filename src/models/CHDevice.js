// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

class CHDevice {
	id
	isAdmin
	guid
	socket = null
	tags
	apnsDeviceToken // apple push notification service -- uses unique id generated on the device
	
	constructor(id, guid, isAdmin = false, tags = new Set([]), apnsDeviceToken = null){
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