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

router.get('/devices/create', devicesController.devices_create)

router.post('/device/register-for-notifications', devicesController.device_registerForNotifications)

/*
 *   broadcast
 */

router.post('/broadcast/push-notification', broadcastController.broadcast_pushNotification)

module.exports = router