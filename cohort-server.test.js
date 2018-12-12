const request = require('supertest')
const express = require('express')
const app = require('./cohort-server')
const CHDevice = require('./models/CHDevice')

describe('Routes', () => {
  test('the app inits', async () => {
    expect.assertions(2)
    const res = await request(app).get('/api/')
    expect(res.status).toEqual(200)
    expect(res.text).toEqual('Cohort rocks')
  })
})