const apn = require('apn')

function start(){
	var options 

	const useSandboxAPNS = false // set to TRUE if you are testing local builds from Xcode against this server, or you will get 400 errors (Bad Device Token) b/c those builds always use the APNS sandbox

	let apnsEnv = process.env.NODE_ENV
	if(useSandboxAPNS){ apnsEnv = "sandbox" }

	console.log("preparing notification service using '" + apnsEnv + "' environment")
	
	if(process.env.NODE_ENV == 'production'){
		options = {
			token: {
				key: "../AuthKey_6TA7832PAJ.p8",
				keyId: "6TA7832PAJ",
				teamId: "J93D25NHHG"
			}
			, production: !useSandboxAPNS 
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

	return new apn.Provider(options)
}

module.exports.start = start
