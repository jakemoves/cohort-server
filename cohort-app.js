// import dependencies
const express = require('express');
const bodyParser = require('body-parser')

require('dotenv').config({path: __dirname + '/.env'})

// configure express
const app = express()
const jsonParser = bodyParser.json()
const routes = require('./routes.js')
app.use(bodyParser.json())
app.use('/api', routes)

app.set("cohort", {
	devices: []
})

// configure cohort
const CHDevice = require('./models/CHDevice')

/* 
 * 	 Apple Push Notifications 
 */

const apnProvider = require('./cohort-apple-notifications')
app.set('apnProvider', apnProvider)

module.exports = app