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
router.patch('/events/:id/open', eventsController.events_open)

/*
 *   devices
 */ 

router.get('/devices', devicesController.devices)

router.post('/devices/create', devicesController.devices_create)

router.post('/devices/register-for-notifications', devicesController.devices_registerForNotifications)


/*
 *   broadcast
 */

router.post('/broadcast', broadcastController.broadcast)

router.post('/broadcast/push-notification', broadcastController.broadcast_pushNotification)

module.exports = router