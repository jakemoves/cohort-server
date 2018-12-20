const webSocket = require('ws')
const app = require('./cohort-app')

/*
 * HTTP connections
 */

const server = app.listen(3000, function(err){
	if(err) {
		throw err
	}

	console.log('http server started on port 3000')
	console.log('environment: ' + process.env.NODE_ENV)
})

/*
 *   WebSocket connections
 */

const webSocketServer = require('./cohort-websockets')({
	app: app,
	server: server,
	callback: () => { }
})