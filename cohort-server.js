const app = require('./cohort-app')
/*
 * HTTP connections
 */

app.listen(3000, function(err){
	if(err) {
		throw err
	}

	console.log('http server started on port 3000')
	console.log('environment: ' + process.env.NODE_ENV)
})