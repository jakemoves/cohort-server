const express = require('express')
const cohortServer = require('./cohort-server')

test('', () => {
  const app = express()
  app.use(cohortServer)
  
})