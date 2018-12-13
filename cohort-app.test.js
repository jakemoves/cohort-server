const request = require('supertest')
const express = require('express')
const CHDevice = require('./models/CHDevice')
const app = require('./cohort-app')

describe('Core routes', () => {
  test('the app inits', async () => {
    // expect.assertions(2)
    const res = await request(app).get('/api')
    expect(res.status).toEqual(200)
    expect(res.text).toEqual('Cohort rocks')
  })
})

describe('Device routes', () => {
  test('devices/create', async () => {
    // expect.assertions(2)
    const res = await request(app).get('/api/devices/create')
    expect(res.status).toEqual(200)
    expect(res.body.guid).toHaveLength(36)
  })

  test('devices/registerForNotifications : happy path', async () => {
    const interimResponse = await request(app).get('/api/devices/create')
    
    const payload = { guid: interimResponse.body.guid, token: 'abcde12345' }
    
    const res = await request(app)
      .post('/api/device/register-for-notifications')
      .send(payload)
    expect(res.status).toEqual(200)
  })

  test('devices/registerForNotifications : error: guid not found', async () => {
    const payload = { guid: '012345678901234567890123456789012345', token: 'abcde12345' }
    const res = await request(app)
      .post('/api/device/register-for-notifications')
      .send(payload)
    expect(res.status).toEqual(400)
    expect(res.text).toEqual("Error: no device found with matching GUID: " + payload.guid)
  })

  test('devices/registerForNotifications : error: device is already registered', async () => {
    const interimRes = await request(app).get('/api/devices/create')
    expect(interimRes.status).toEqual(200)
    expect(interimRes.body.guid).toHaveLength(36)
    const payload = { guid: interimRes.body.guid, token: 'abcde12345' }
    const interimRes1 = await request(app)
      .post('/api/device/register-for-notifications')
      .send(payload)
    expect(interimRes1.status).toEqual(200)
    const res = await request(app)
      .post('/api/device/register-for-notifications')
      .send(payload)
    expect(res.status).toEqual(400)
    expect(res.text).toEqual("Warning: Device with GUID " + payload.guid + " is already registered for notifications")
  })
  
  test('devices/registerForNotifications : error: missing token', async () => {
    const payload = { guid: '012345678901234567890123456789012345'}
    const res = await request(app)
      .post('/api/device/register-for-notifications')
      .send(payload)
    expect(res.status).toEqual(400)
    expect(res.text).toEqual("Error: Request must include 'token' and 'guid' objects")
  })

  test('devices/registerForNotifications : error: missing guid', async () => {
    const payload = { token: '12345'}
    const res = await request(app)
      .post('/api/device/register-for-notifications')
      .send(payload)
    expect(res.status).toEqual(400)
    expect(res.text).toEqual("Error: Request must include 'token' and 'guid' objects")
  })
})