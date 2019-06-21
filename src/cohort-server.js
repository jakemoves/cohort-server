const webSocket = require('ws')
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
		path: '/sockets'
	})

	/*
	 *   Cohort session init
	 */

	await CHSession.initAndSetOnApp(app).then( () => {
		console.log("   cohort session started")
	}) 

	/* mail service init */
	mailerService.initService()
}

start()