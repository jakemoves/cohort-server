const apn = require('apn')

var options = {
	token: {
		key: process.env.PATH_TO_APNS_KEY + "AuthKey_6TA7832PAJ.p8",
		keyId: "6TA7832PAJ",
		teamId: "J93D25NHHG"
	}
}

module.exports = new apn.Provider(options)