const apn = require('apn')

var options 

if(process.env.NODE_ENV == 'production'){
	options = {
		token: {
			key: "../AuthKey_6TA7832PAJ.p8",
			keyId: "6TA7832PAJ",
			teamId: "J93D25NHHG"
		}
	}
} else if(process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'test'){
	options = {
		token: {
			key: "./AuthKey_6TA7832PAJ.p8",
			keyId: "6TA7832PAJ",
			teamId: "J93D25NHHG"
		}
	}
}

module.exports = new apn.Provider(options)
