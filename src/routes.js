const express = require('express')
const router = express.Router()

const eventsController = require('./controllers/eventsController')
const devicesController = require('./controllers/devicesController')
const occasionsController = require('./controllers/occasionsController')
const demoController = require('./controllers/demoController')

router.get('', (req, res) => {
  res.send('Cohort rocks')
})

/* 
 *   events
 */

router.get('/events', eventsController.events)
router.get('/events/:id', eventsController.events_id)
router.post('/events', eventsController.events_create)
router.delete('/events/:id', eventsController.events_delete)

router.patch('/events/:id/check-in', eventsController.events_checkIn)
router.get('/events/:id/devices', eventsController.events_devices)
router.patch('/events/:id/open', eventsController.events_open)
router.patch('/events/:id/close', eventsController.events_close)

router.get('/events/:id/cuesheet', eventsController.cuesheet)
router.post('/events/:id/broadcast', eventsController.events_broadcast)
// router.post('/events/:id/broadcast-push-notification', eventsController.events_broadcast_push_notification)

/*
 *   devices
 */ 

router.get('/devices', devicesController.devices)
router.get('/devices/:id', devicesController.devices_id)

router.post('/devices', devicesController.devices_create)

router.patch('/devices/:id/register-for-notifications', devicesController.devices_registerForNotifications)

/*
 *   occasions
 */

router.get('/events/:id/occasions', occasionsController.occasionsForEvent)
router.post('/events/:id/occasions', occasionsController.occasions_create)
router.get('/occasions', occasionsController.occasions)
router.delete('/occasions/:id', occasionsController.occasions_delete)

/*
 *   demo stuff
 */

router.get('/events/:id/demo/prepare', demoController.prepare_demo)

module.exports = router