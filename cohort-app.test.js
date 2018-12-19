const request = require('supertest')
const express = require('express')
const CHDevice = require('./models/CHDevice')
var app

beforeEach( () => {
  app = require('./cohort-app')  
})

afterEach( () => {
  app.set('cohort', { 
    devices: [] 
  })
})

describe('Core routes', () => {
  test('the app inits', async () => {
    const res = await request(app).get('/api')
    expect(res.status).toEqual(200)
    expect(res.text).toEqual('Cohort rocks')
  })
})

describe('Device routes', () => {
  test('devices/create', async () => {
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

describe('Broadcast routes', () => {
  test('broadcast/push-notification : happy path (one device)', async () => {
    // create a device
    const res1 = await request(app).get('/api/devices/create')
    expect(res1.status).toEqual(200)
    expect(res1.body.guid).toHaveLength(36)
    const guid = res1.body.guid

    // register a device
    const payload2 = { token: '12345', guid: guid }
    const res2 = await request(app)
      .post('/api/device/register-for-notifications')
      .send(payload2)
    expect(res2.status).toEqual(200)

    // test broadcast endpoint
    const payload = { 
      "text": "hello world",
      "bundleId": "rocks.cohort.test",
      "simulate": "success"
    }

    const res = await request(app)
      .post('/api/broadcast/push-notification')
      .send(payload)
    expect(res.status).toEqual(200)
    expect(res.text).toEqual("Sent notifications to 1/1 registered devices")
  })
})