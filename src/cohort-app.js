// import dependencies
const express = require('express');
const bodyParser = require('body-parser')
const CHEvent = require('./models/CHEvent')


require('dotenv').config({ path: __dirname + '/../.env' })

// configure express
const app = express()
const jsonParser = bodyParser.json()
const routes = require('./routes.js')
app.use(bodyParser.json())

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
  next()
})

app.use('/api', routes)
app.use(express.static('public'))

let newEvent = CHEvent()

app.set("cohort", {
  devices: [],
  event: newEvent
})


/*
 * Database 
 */

// configure cohort
const CHDevice = require('./models/CHDevice')

/* 
 * 	 Apple Push Notifications 
 */

//const apnProvider = require('./cohort-apple-notifications')
//app.set('apnProvider', apnProvider)

module.exports = app
