const express = require('express')
const router = express.Router()

const devicesController = require('./controllers/devicesController')
const broadcastController = require('./controllers/broadcastController')

router.get('', (req, res) => {
  res.send('Cohort rocks')
})

/*
 *   devices
 */ 

router.post('/devices/create', devicesController.devices_create)

router.post('/devices/register-for-notifications', devicesController.devices_registerForNotifications)

/*
 *   broadcast
 */

router.post('/broadcast', broadcastController.broadcast)

router.post('/broadcast/push-notification', broadcastController.broadcast_pushNotification)

module.exports = router