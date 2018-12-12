const express = require('express')
const router = express.Router()

const devicesController = require('./controllers/devicesController')

router.get('/', (req, res) => {
  res.send('Cohort rocks')
})

router.get('/devices/create', devicesController.devices_create)

router.post('/device/register-for-notifications', devicesController.device_registerForNotifications)

module.exports = router