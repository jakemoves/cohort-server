const uuid = require('uuid/v4')

CHDevice = function (guid) {
	return {
		guid: guid,
		socket: null,
		notifications: {
			deviceToken: null,
			send: (notification, callback) => {
				if(deviceToken != null){
					// send notification
				} else {
					// throw error
				}

			}
		},
		posture: {
			isAwake: false,
		},
		media: {
			isPlaying:() => {
				if(this.audio.isPlaying){
					return { media: ["audio"], cue: self.audio.currentCueNumber, status: self.audio.isPlaying} 
				} else {
					return false
				}
			},
			audio: {
				isPlaying: false,
				currentCueNumber: null,
				play: (cueNumber) => {

				}, 
				stop: () => {

				},
				restart: () => {

				}
			}
		}
	}				
}

module.exports = CHDevice