// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const express = require('express')
const router = express.Router()
const occasionsController = require('./controllers/occasionsController')

router.get('', (req, res) => {
  res.send('Cohort rocks')
})

router.get('/occasions/:id', occasionsController.occasions_join)

module.exports = router