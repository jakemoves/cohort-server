const webSocket = require('ws')
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

/*
 *   WebSocket connections
 */

const webSocketServer = require('./cohort-websockets')({
	app: app,
	server: server,
	path: '/sockets'
})

/*
 *   Cohort session init
 */

// this is async, not sure if it causes problems...
CHSession.initAndSetOnApp(app).then( () => {
	console.log("   cohort session started")
}) 