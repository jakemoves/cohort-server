// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const express = require('express')
const router = express.Router()

router.get(/[\s\S]*/, (req, res) => {
  res.status(400)
  res.write('Cohort API v1 is deprecated. Please update your client to use v2 (endpoints preceded by "/api/v2"). API documentation is available at https://cohort.rocks. Sorry for the inconvenience :(')
})

module.exports = router