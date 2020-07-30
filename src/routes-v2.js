// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const express = require('express')
const router = express.Router()
const routerWithAuth = express.Router()

const eventsController = require('./controllers/eventsController')
const occasionsController = require('./controllers/occasionsController')
const usersController = require('./controllers/usersController')
const projectSiteController = require('./controllers/projectSiteController')
// const demoController = require('./controllers/demoController')
// const servicesController = require('./controllers/servicesController')

router.get('', (req, res) => {
  res.send('Cohort rocks')
})

/*
 *   project site routes
 */
router.post('/contact-form', projectSiteController.submit_contact_form)


/*
 *   login, registration, users
 */

router.post('/users', usersController.register_user)
router.post('/login', usersController.login_user)
routerWithAuth.delete('/users/:id', usersController.delete_user)

/* 
 *   events
 */

routerWithAuth.get('/events', eventsController.events)
routerWithAuth.get('/events/:id', eventsController.events_id)
routerWithAuth.post('/events', eventsController.events_create)
routerWithAuth.delete('/events/:id', eventsController.events_delete)
routerWithAuth.post('/events/:id/episodes', eventsController.events_update_episodes) // POST here instead of PATCH because Unity supports a limited set of HTTP verbs

/*
 *   occasions
 */

routerWithAuth.post('/occasions', occasionsController.occasions_create)
routerWithAuth.delete('/occasions/:id', occasionsController.occasions_delete)
routerWithAuth.patch('/occasions/:id', occasionsController.occasions_update)
routerWithAuth.post('/occasions/:id/broadcast', occasionsController.occasions_broadcast)
routerWithAuth.get('/occasions/:id/qrcode', occasionsController.occasions_qrcode)

// router.post('/events/:id/occasions', occasionsController.occasions_create)
// router.get('/occasions', occasionsController.occasions)
// 

// router.patch('/events/:eventId/check-in', eventsController.events_checkIn) // eventId rather than id to disambiguate when the user checks in to a specific occasion (see that route listed under occasions) 
// router.get('/events/:eventId/devices', eventsController.events_devices)
// router.patch('/events/:id/open', eventsController.events_open)
// router.patch('/events/:id/close', eventsController.events_close)

// router.post('/events/:id/broadcast', eventsController.events_broadcast)
// router.post('/events/:eventId/broadcast-push-notification', eventsController.events_broadcast_push_notification) // eventId rather than id to disambiguate when the user checks in to a specific occasion (see that route listed under occasions)

// router.get('/events/:eventId/last-cohort-message', eventsController.events_lastCohortMessage)
// router.get('/events/:id/lotx-ar-tweaks', eventsController.events_getLotXARTweaks)

/*
 *   occasions
 */

// router.get('/events/:id/occasions', occasionsController.occasionsForEvent)
// router.post('/events/:id/occasions', occasionsController.occasions_create)
// router.get('/occasions', occasionsController.occasions)
// router.delete('/occasions/:id', occasionsController.occasions_delete)
// router.get('/events/:id/occasions/upcoming', occasionsController.event_occasions_upcoming)

// these are handled by the events controller, not sure if that's best
// router.get('/events/:eventId/occasions/:occasionId/devices', eventsController.events_devices)
// router.patch('/events/:eventId/occasions/:occasionId/check-in', eventsController.events_checkIn) 
// router.post('/events/:eventId/occasions/:occasionId/broadcast-push-notification', eventsController.events_occasions_broadcast_push_notification) // yes this is a little weird, it's located in the events controller for convenience... eventually the broadcast stuff should get extracted to a service

/* 
 *   one-offs
 */

// router.post('/services/mail', servicesController.send_email)

/*
 *   demo stuff
 */

// router.get('/events/:id/demo/prepare', demoController.prepare_demo)
// router.get('/events/:id/demo', demoController.prepare_lotx_demo)

module.exports = {
  router: router,
  routerWithAuth: routerWithAuth
}