// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

// import dependencies
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path')
const passport = require('passport')
const AuthStrategy = require('passport-local').Strategy
const session = require('express-session')

require('dotenv').config({ path: __dirname + '/../.env' })

const knex = require('./knex/knex.js')

// configure express
const app = express()
const jsonParser = bodyParser.json()

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))

/*
 *   Authentication
 */

passport.use(new AuthStrategy(
  function(username, password, callback) {
    // try to retrieve the user from the database

    // check for error
    
    // check for user not found

    // check for incorrect password
    if(password != '5555'){
      return callback(null, false)
    }
    
    return callback(null, { id: 0, username: "cohort_test_user"})
  })
)

passport.serializeUser(function(user, callback) {
  callback(null, user.id)
})

passport.deserializeUser(function(id, callback) {
  // this gets replaced by a database lookup
  if(id != 0){
    return callback(new Error("User with id:" + id + " not found"))
  }
  callback(null, { id: 0, username: "cohort_test_user"} )
})

app.use(passport.initialize())
app.use(passport.session())

/*
 *   Routing
 */

const v1routes = require('./routes-v1.js')
const v2routes = require('./routes-v2.js')
app.use(bodyParser.json())

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
  next()
})

app.use('/api/v1', v1routes)
app.use('/api/v2', v2routes)

let staticPath = path.join(__dirname, '../public') // because we run the app from /lib
app.use(express.static(staticPath))

/*
 *   Cohort
 */

// cohort-server.js handles starting a Cohort session and making it available using app.get('cohortSession')
// this makes it possible to tear down state between tests

/*
 *   Database 
 */

// Database setup is handled by Knex

/* 
 * 	 Apple Push Notifications 
 */

const cohort_apple_n10ns = require('./cohort-apple-notifications')

const apnProvider = cohort_apple_n10ns.start()

app.set('apnProvider', apnProvider)

module.exports = app
