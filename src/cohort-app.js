// import dependencies
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path')

require('dotenv').config({ path: __dirname + '/../.env' })

const knex = require('./knex/knex.js')

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

app.use('/api/v1', routes)

let staticPath = path.join(__dirname, '../public') // because we run the app from /lib
app.use(express.static(staticPath))

/*
 *   Cohort
 */

// cohort-server.js handles starting a Cohort session and making it available using app.get('cohort')
// this makes it possible to tear down state between tests

/*
 *   Database 
 */

// Database setup is handled by Knex

/* 
 * 	 Apple Push Notifications 
 */

//const apnProvider = require('./cohort-apple-notifications')
//app.set('apnProvider', apnProvider)

module.exports = app
