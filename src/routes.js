const express = require('express')
const router = express.Router()

const eventsController = require('./controllers/eventsController')
const devicesController = require('./controllers/devicesController')
const broadcastController = require('./controllers/broadcastController')

router.get('', (req, res) => {
  res.send('Cohort rocks')
})

/* 
 *   events
 */

router.get('/events', eventsController.events)
router.get('/events/:id', eventsController.events_id)
router.post('/events/create', eventsController.events_create)
router.delete('/events/:id', eventsController.events_delete)

router.patch('/events/:id/check-in', eventsController.events_checkIn)
router.get('/events/:id/devices', eventsController.events_devices)
router.patch('/events/:id/open', eventsController.events_open)
router.patch('/events/:id/close', eventsController.events_close)

/*
 *   devices
 */ 

router.get('/devices', devicesController.devices)
router.get('/devices/:id', devicesController.devices_id)

router.post('/devices', devicesController.devices_create)

router.patch('/devices/:id/register-for-notifications', devicesController.devices_registerForNotifications)


/*
 *   broadcast
 */

router.post('/broadcast', broadcastController.broadcast)

router.post('/broadcast/push-notification', broadcastController.broadcast_pushNotification)

module.exports = router