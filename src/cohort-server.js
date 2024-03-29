// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const webSocket = require('ws')

const broadcastService = require('./services/broadcastService')
const mailerService = require('./services/mailerService')

const app = require('./cohort-app')

const CHSession = require('./models/CHSession')

console.log('starting cohort server...')
console.log('   environment: ' + process.env.NODE_ENV)

/*
 * HTTP connections
 */

const server = app.listen(3000, function(err){
	if(err) {
		throw err
	}

	console.log('   http server started on port 3000')
})

start = async () => {
	/*
	 *   WebSocket connections
	 */

	const webSocketServer = await require('./cohort-websockets')({
		app: app,
		server: server,
		path: '/sockets',
		keepaliveIntervalDuration: 25000
	})

	/*
	 *   Cohort session init
	 */

	await CHSession.initAndSetOnApp(app).then( () => {
		console.log("   cohort session started")
	}) 

	// /* broadcast service init */
	// await broadcastService.initService(app.get('cohortSession'), webSocketServer)

	/* mail service init */
	if(process.env.NODE_ENV != 'localoffline'){
		mailerService.initService()
	}
}

start()