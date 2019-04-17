const request = require('supertest')
const uuid = require('uuid/v4')
const knex = require('./knex/knex')
const ws = require('ws')

const CHSession = require('./models/CHSession')

var app
process.env.NODE_ENV = 'test'

beforeEach( async () => {
  console.log('global beforeEach()')
  await knex.migrate.rollback()
  await knex.migrate.latest()
  await knex.seed.run()

  app = require('./cohort-app')
  await CHSession.initAndSetOnApp(app).then( () => {
    console.log("starting cohort session")
  })
})

afterEach( async () => {
  console.log('global afterEach()')
  await knex.migrate.rollback()
  // per issue #12, we should actually tear down the app/server here
  app.set('cohort', null)
})

/* 
 *    UTILITY METHODS
 */

beforeAll( () => {
  createDevice = (guid, tags) => {
    let payload = { guid: guid }
    if(tags !== undefined){
      payload.tags = tags
    }
    return request(app)
      .post('/api/v1/devices')
      .send(payload)
  }
})

/*
 *    BASIC TESTS
 */

describe('Basic startup', () => {
  test('the app inits', async () => {
    const res = await request(app).get('/api/v1')
    expect(res.status).toEqual(200)
    expect(res.text).toEqual('Cohort rocks')
  })
})


/*
 *    EVENT ROUTES
 */

 describe('Event routes', () => {
  test('GET /events', async () => {
    const res = await request(app).get('/api/v1/events')
    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(5)

    expect(res.body[0]).toHaveProperty('label')
    expect(res.body[0].label).toEqual('pimohtēwak')

    expect(res.body[1]).toHaveProperty('label')
    expect(res.body[1].label).toEqual('lot_x')

    expect(res.body[3]).toHaveProperty('state')
    expect(res.body[3].state).toEqual('open')
  })

  test('GET /events/:id', async () => {
    const res = await request(app).get('/api/v1/events/1')
    expect(res.status).toEqual(200)

    expect(res.body).toHaveProperty('id')
    expect(res.body.id).toEqual(1)
    expect(res.body).toHaveProperty('label')
    expect(res.body.label).toEqual('pimohtēwak')
    expect(res.body).toHaveProperty('state')
    expect(res.body.state).toEqual('closed')
  })

  test('GET /events/:id : error: event not found', async () => {
    const res = await request(app).get('/api/v1/events/99')
    expect(res.status).toEqual(404)

    expect(res.text).toEqual("Error: event with id:99 not found")
  })

  test('POST /events', async () =>{
    const res = await request(app)
      .post('/api/v1/events')
      .send({ label: 'new event' })

    expect(res.status).toEqual(201)
    expect(res.header.location).toEqual('/api/v1/events/6')
    expect(res.body).toHaveProperty('id')
    expect(res.body.id).toEqual(6)
    expect(res.body.label).toEqual('new event')
    expect(res.body.state).toEqual('closed')
  })

  test('DELETE /events/:id', async () => {
    const res = await request(app)
      .delete('/api/v1/events/2')
    expect(res.status).toEqual(204)

    const res2 = await request(app).get('/api/v1/events/2')
    expect(res2.status).toEqual(404)
  })

  test('DELETE /events/:id -- error: open event cannot be deleted', async () =>{
    const res = await request(app)
      .delete('/api/v1/events/4')
    expect(res.status).toEqual(403)

    const res2 = await request(app).get('/api/v1/events/4')
    expect(res2.status).toEqual(200)
  })

  test('GET /events/:eventId/devices', async () => {
    const res = await request(app)
      .get('/api/v1/events/3/devices')

    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(3)
  })

  test('GET /events/:eventId/occasions/:occasionId/devices', async () => {
    const res = await request(app)
      .get('/api/v1/events/4/occasions/1/devices')

    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(1)
  })

  // happy path
  test('PATCH /events/:eventId/check-in', async () => {
    const res1 = await request(app).get('/api/v1/events/1/devices')
    expect(res1.status).toEqual(200)
    const deviceCount = res1.body.length

    // this device already exists in the DB
    // in a full flow, we would create the device at POST /devices first
    // yeah it's a bit much
    const res2 = await request(app)
      .patch('/api/v1/events/1/check-in')
      .send({ guid: "1234567" })

    expect(res2.status).toEqual(200)
    expect(res2.body).toHaveProperty('id')
    expect(res2.body.id).toEqual(1)

    const res3 = await request(app).get('/api/v1/events/1/devices')
    expect(res3.body).toHaveLength(deviceCount+1)
  })
  
  // happy path for checking into a specific occasion of an event
  test('PATCH /events/:eventId/occasions/:occasionId/check-in', async () => {
    const getDevicesEndpoint = '/api/v1/events/4/occasions/1/devices'
    const res1 = await request(app).get(getDevicesEndpoint)
    expect(res1.status).toEqual(200)
    const deviceCount = res1.body.length

    // this device already exists in the DB
    // in a full flow, we would create the device at POST /devices first
    // yeah it's a bit much
    const res2 = await request(app)
      .patch('/api/v1/events/4/occasions/1/check-in')
      .send({ guid: "1234567" })

    console.log(res2.body)
    expect(res2.status).toEqual(200)

    const eventsTable = require('./knex/queries/event-queries')
    let devices = await eventsTable.getDevicesForEventOccasion(4,1)
    // expect(devices.length).toEqual(2)
    
    // expect(res2.body).toHaveProperty('id')
    // expect(res2.body.id).toEqual(1)

    const res3 = await request(app).get(getDevicesEndpoint)
    expect(res3.body).toHaveLength(deviceCount+1)
  })

  test('PATCH /events/:eventId/check-in => occasion check-in -- error: device is already checked in', async () => {
    const eventId = 4
    const deviceId = 1
    const occasionId = 1

    const res1 = await request(app).get('/api/v1/events/' + eventId + '/devices')
    expect(res1.status).toEqual(200)
    const deviceCount = res1.body.length
    // check into event
    
    const res2 = await request(app)
      .patch('/api/v1/events/' + eventId + '/check-in')
      .send({ guid: "1234567" }) // this device already exists in the DB
    expect(res2.status).toEqual(200)
    expect(res2.body).toHaveProperty('id')
    expect(res2.body.id).toEqual(4)

    // verify event check-in
    const getDevicesEndpoint = '/api/v1/events/' + eventId + '/devices'
    const res3 = await request(app).get(getDevicesEndpoint)
    expect(res3.status).toEqual(200)
    const deviceCountAfterEventCheckin = res3.body.length
    expect(deviceCountAfterEventCheckin).toEqual(deviceCount + 1)

    // now check into occasion
    const res4 = await request(app)
      .patch('/api/v1/events/' + eventId + '/occasions/' + occasionId + '/check-in')
      .send({ guid: "1234567" })

    console.log(res4.body)
    expect(res4.status).toEqual(200)


    const eventsDevicesTable = knex('events_devices')

    const eventDeviceRelations = await eventsDevicesTable
      .where('event_id', eventId)
      .where('device_id', deviceId)
    
    console.log(eventDeviceRelations)
    expect(eventDeviceRelations.length).toEqual(1)
    expect(eventDeviceRelations[0].occasion_id).toEqual(1)

    // now check in to event 
    const res5 = await request(app)
      .patch('/api/v1/events/' + eventId + '/check-in')
      .send({ guid: "1234567" })

    console.log(res5.body)
    expect(res5.status).toEqual(200)
  })

  // happy path for checking into an open event
  test('PATCH /events/:id/check-in (to open event)', async () => {
    let eventId = 3

    // in db
    const res1 = await request(app).get('/api/v1/events/' + eventId +'/devices')
    expect(res1.status).toEqual(200)
    dbDeviceCount = res1.body.length

    // in memory
    let event = app.get("cohort").events.find( event => event.id == eventId)
    let deviceCount = event.devices.length

    expect(dbDeviceCount).toEqual(deviceCount)

    const res = await request(app)
      .patch('/api/v1/events/3/check-in')
      .send({ guid: "sifubar" }) // already exists in db

    expect(res.status).toEqual(200)

    // in memory
    expect(event.devices).toHaveLength(deviceCount + 1)

    // in db
    const res3 = await request(app).get('/api/v1/events/' + eventId +
   '/devices')
    expect(res3.body).toHaveLength(deviceCount+1)
  })

  test('PATCH /events/:id/check-in -- error: device guid not found', async () => {
    const guid = "foo"
    const res = await request(app)
      .patch('/api/v1/events/1/check-in')
      .send({ guid: guid })

    expect(res.status).toEqual(404)
    expect(res.text).toEqual("Error: no device found with guid:foo")
  })  
  
  test('PATCH /events/:id/check-in -- error: no guid included in request', async () => {
    const res = await request(app)
      .patch('/api/v1/events/1/check-in')
      .send({ foo: "bar" })

    expect(res.status).toEqual(400)
    expect(res.text).toEqual("Error: request must include a device guid")
  })

  test('PATCH /events/:id/check-in -- error: invalid event id', async () => {
    const res = await request(app)
      .patch('/api/v1/events/99/check-in')
      .send({ guid: "1234567" })

    expect(res.status).toEqual(404)
    expect(res.text).toEqual("Error: no event found with id:99")
  })

  test('PATCH /events/:id/open', async () => {
    let consoleOutput = "";
    storeLog = inputs => (consoleOutput += inputs)

    console["log"] = jest.fn(storeLog)
    expect(app.get("cohort").events.length).toEqual(2)
    const res = await request(app)
      .patch('/api/v1/events/2/open')
    
    expect(res.status).toEqual(200)
    expect(res.body.state).toEqual('open')
    expect(app.get("cohort").events.length).toEqual(3)
    expect(consoleOutput).toEqual("event lot_x is now open")
  })

  test('PATCH /events/:id/close', async () => {
    expect(app.get("cohort").events.length).toEqual(2)
    const res = await request(app)
      .patch('/api/v1/events/3/close')
    
    expect(res.status).toEqual(200)
    expect(res.body.state).toEqual('closed')
    expect(app.get("cohort").events.length).toEqual(1)
  })

  test('PATCH /events/:id/open and /close', async () => {
    let consoleOutput = "";
    storeLog = inputs => (consoleOutput += inputs)

    console["log"] = jest.fn(storeLog)
    expect(app.get("cohort").events.length).toEqual(2)
    const res1 = await request(app)
      .patch('/api/v1/events/2/open')
    
    expect(res1.status).toEqual(200)
    expect(res1.body.state).toEqual('open')
    expect(app.get("cohort").events.length).toEqual(3)
    expect(consoleOutput).toEqual("event lot_x is now open")

    // next close it

    expect(app.get("cohort").events.length).toEqual(3)
    const res2 = await request(app)
      .patch('/api/v1/events/2/close')
    
    expect(res2.status).toEqual(200)
    expect(res2.body.state).toEqual('closed')
    expect(app.get("cohort").events.length).toEqual(2)
    expect(consoleOutput).toEqual("event lot_x is now openevent lot_x is now closed")

    // now re-open it
    const res3 = await request(app)
      .patch('/api/v1/events/2/open')
    
    expect(res3.status).toEqual(200)
    expect(res3.body.state).toEqual('open')
    expect(app.get("cohort").events.length).toEqual(3)
    expect(consoleOutput).toEqual("event lot_x is now openevent lot_x is now closedevent lot_x is now open")

    // now close it once more
    const res4 = await request(app)
      .patch('/api/v1/events/2/close')
    
    expect(res4.status).toEqual(200)
    expect(res4.body.state).toEqual('closed')
    expect(app.get("cohort").events.length).toEqual(2)
    expect(consoleOutput).toEqual("event lot_x is now openevent lot_x is now closedevent lot_x is now openevent lot_x is now closed")
  })

  test('PATCH /events/:id/open -- with device tags', async () => {
    const payload = { tags: [ 'blue', 'red' ]}
    const res = await request(app)
      .patch('/api/v1/devices/1/set-tags')
      .send(payload)
    expect(res.status).toEqual(200)
    expect(res.body.tags).toEqual(['blue', 'red'])

    let consoleOutput = "";
    storeLog = inputs => (consoleOutput += inputs)

    console["log"] = jest.fn(storeLog)
    expect(app.get("cohort").events.length).toEqual(2)
    const res1 = await request(app)
      .patch('/api/v1/events/2/open')
    
    expect(res1.status).toEqual(200)
    expect(res1.body.state).toEqual('open')
    expect(app.get("cohort").events.length).toEqual(3)
    expect(consoleOutput).toEqual("event lot_x is now open")

    // next close it

    expect(app.get("cohort").events.length).toEqual(3)
    const res2 = await request(app)
      .patch('/api/v1/events/2/close')
    
    expect(res2.status).toEqual(200)
    expect(res2.body.state).toEqual('closed')
    expect(app.get("cohort").events.length).toEqual(2)
    expect(consoleOutput).toEqual("event lot_x is now openevent lot_x is now closed")

    // now re-open it
    const res3 = await request(app)
      .patch('/api/v1/events/2/open')
    
    expect(res3.status).toEqual(200)
    expect(res3.body.state).toEqual('open')
    expect(app.get("cohort").events.length).toEqual(3)
    expect(consoleOutput).toEqual("event lot_x is now openevent lot_x is now closedevent lot_x is now open")

    // now close it once more
    const res4 = await request(app)
      .patch('/api/v1/events/2/close')
    
    expect(res4.status).toEqual(200)
    expect(res4.body.state).toEqual('closed')
    expect(app.get("cohort").events.length).toEqual(2)
    expect(consoleOutput).toEqual("event lot_x is now openevent lot_x is now closedevent lot_x is now openevent lot_x is now closed")
  })

  test('POST /events/:id/broadcast: error -- no devices connected', async () => {
    const cohortMessage = {
      targetTags: ["all"],
	    mediaDomain: "sound",
	    cueNumber: 1,
	    cueAction: "play"
    }

    const res = await request(app)
      .post('/api/v1/events/3/broadcast')
      .send(cohortMessage)

    expect(res.status).toEqual(403)
    expect(res.text).toEqual("Warning: No devices are connected via WebSockets, broadcast was not sent")
  })

  // push notifications
  // limited test! only verifying which devices will have n10ns attempted
  test('POST /events/:id/broadcast-push-notification', async () =>{
    const eventsTable = require('./knex/queries/event-queries')
    getDevicesForEvent(4).then( devices => {
      expect(devices.length).toEqual(2)
    })
  })

  test('POST /events/:eventId/occasions/:occasionId/broadcast-push-notification', async () => {
    const eventsTable = require('./knex/queries/event-queries')
    getDevicesForEventOccasion(4, 1).then( devices => {
      console.log(devices)
      expect(devices.length).toEqual(1)
    })
  })
})


/*
 *    DEVICE & NOTIFICATION ROUTES
 */

describe('Device routes', () => {

  test('GET /devices', async () => {
    const res = await request(app).get('/api/v1/devices')

    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(4)
    expect(res.body[2]).toHaveProperty('guid')
    expect(res.body[2].guid).toEqual('54321')
  })

  test('GET /devices/:id', async () => {
    const res = await request(app).get('/api/v1/devices/1')

    expect(res.status).toEqual(200)
    expect(res.body.guid).toEqual('1234567')
  })

  test('GET /devices/:id -- error: device not found', async () => {
    const res = await request(app).get('/api/v1/devices/5')

    expect(res.status).toEqual(404)
    expect(res.text).toEqual('Error: no device found with id:5')
  })

  test('POST /devices', async () => {
    const res0 = await request(app).get('/api/v1/devices')
    const deviceCount = res0.body.length

    const res = await createDevice(12345678)
    
    expect(res.status).toEqual(201)
    expect(res.header.location).toEqual('/api/v1/devices/' + (deviceCount + 1))
    expect(res.body.guid).toEqual('12345678')

    const res1 = await request(app)
      .get('/api/v1/devices/' + res.body.id)

    expect(res1.status).toEqual(200)
    expect(res1.body.guid).toEqual('12345678')
  })

  test('POST /devices with tags', async () => {
    const res0 = await request(app).get('/api/v1/devices')
    const deviceCount = res0.body.length

    const res1 = await createDevice(123456789, ['blue', 'red'])
    expect(res1.status).toEqual(201)
    expect(res1.header.location).toEqual('/api/v1/devices/' + (deviceCount + 1))
    expect(res1.body.guid).toEqual('123456789')
    expect(res1.body.tags).toEqual(['blue', 'red'])
  })

  test('GET /devices -- filter by tag', async () => {
    const res1 = await createDevice(123456789, ['blue', 'red'])
    expect(res1.status).toEqual(201)

    const res2 = await createDevice(1234567890, ['blue'])
    expect(res2.status).toEqual(201)


    const res3 = await createDevice(12345678900, ['red'])
    expect(res3.status).toEqual(201)
    
    const res4 = await request(app).get('/api/v1/devices?tag=blue')
    expect(res4.body).toHaveLength(2)
  })

  test('POST /devices -- error: device already exists', async () => {
    const res0 = await request(app).get('/api/v1/devices')
    const deviceCount = res0.body.length

    const res = await createDevice(12345678)
    
    expect(res.status).toEqual(201)
    expect(res.header.location).toEqual('/api/v1/devices/' + (deviceCount + 1)) 
    expect(res.body.guid).toEqual('12345678')

    const res1 = await createDevice(12345678)
    expect(res1.status).toEqual(200)
  })

  test('POST /devices -- error: no guid', async () => {
    const res = await createDevice(null)
    
    expect(res.status).toEqual(400)
  })

  test('POST /devices -- error: empty guid', async () => {
    const res = await createDevice("")
    
    expect(res.status).toEqual(400)
  })

  test('devices/:id/registerForNotifications : happy path', async () => {
    const guid = uuid()
    const interimResponse = await createDevice(guid)

    const payload = { token: 'abcde12345' }
    const deviceId = interimResponse.body.id
    
    const res = await request(app)
      .patch('/api/v1/devices/' + deviceId + '/register-for-notifications')
      .send(payload)
    expect(res.status).toEqual(200)
    expect(res.body.apnsDeviceToken).toEqual('abcde12345')
  })
  
  // add test for id not found

  test('devices/register-for-notifications : error: missing token', async () => {
    const payload = { 'blep': '012345678901234567890123456789012345'}
    const res = await request(app)
      .patch('/api/v1/devices/1/register-for-notifications')
      .send(payload)
    expect(res.status).toEqual(400)
    expect(res.text).toEqual("Error: Request must include a 'token' object")
  })

  test('devices/set-tags', async () => {
    const payload = { tags: [ 'blue', 'red' ]}
    const res = await request(app)
      .patch('/api/v1/devices/1/set-tags')
      .send(payload)
    expect(res.status).toEqual(200)
    expect(res.body.tags).toEqual(['blue', 'red'])

    const payload1 = { tags: [ 'purple' ]}
    const res1 = await request(app)
      .patch('/api/v1/devices/1/set-tags')
      .send(payload1)
    expect(res1.status).toEqual(200)
    expect(res1.body.tags).toEqual(['purple'])
  })
})


/*
 *    WEBSOCKETS
 */

describe('WebSockets', () => { 
  var server
  var socketURL

  beforeEach( () => {
    console.log('websockets beforeEach()')
    socketURL = 'http://localhost:3000/sockets'

    // this is pretty much the same as cohort-server.js
    server = app.listen(3000, function(err){
      if(err) {
        throw err
      }
    
      console.log('http server started on port 3000')
      console.log('environment: ' + process.env.NODE_ENV)
    })
  })

  afterEach( () => {
    console.log('websockets afterEach()')
    server.close()
  })

  test('startup & new connection', async (done) => {
    expect(app.get("cohort").events[0].devices.length).toEqual(3)

    const webSocketServer = require('./cohort-websockets')({
      app: app, server: server, path: '/sockets'
    })

    expect(webSocketServer).toBeDefined()

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      expect(wsClient.readyState).toEqual(1)
      done()
    })
  })

  test('send message: error -- json parse error', async (done) => {
    expect.assertions(3)

    expect(app.get("cohort").events[0].devices.length).toEqual(3)

    const webSocketServer = require('./cohort-websockets')({
      app: app, server: server, path: '/sockets'
    })

    expect(webSocketServer).toBeDefined()

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {

      wsClient.addEventListener('message', message => {
        const msg = JSON.parse(message.data)
        expect(msg.error).toEqual("message is not valid JSON (Unexpected string in JSON at position 9)")
        done()
      })

      let badJSONString = '{\"blep:\" \"blop\"}'
      wsClient.send(badJSONString)
    })
  })

test('initial handshake: error -- no guid included', async(done) => {
    const eventId = 3

    const webSocketServer = require('./cohort-websockets')({
      app: app, server: server, path: '/sockets'
    })

    expect(webSocketServer).toBeDefined()

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      let guid = uuid()
      wsClient.send(JSON.stringify({ eventId: eventId }))
    })

    wsClient.addEventListener('close', error => {
      expect(error.code).toEqual(4003)
      expect(error.reason).toEqual("First message from client must include fields 'guid' and 'eventId'")
      done()
    })
  })

test('initial handshake: error -- event not found', async(done) => {
    const eventId = 100

    const webSocketServer = require('./cohort-websockets')({
      app: app, server: server, path: '/sockets'
    })

    expect(webSocketServer).toBeDefined()

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      let guid = uuid()
      wsClient.send(JSON.stringify({ guid: guid, eventId: eventId }))
    })

    wsClient.addEventListener('close', error => {
      expect(error.code).toEqual(4002)
      expect(error.reason).toEqual('No open event found with id:' + eventId)
      done()
    })
  })

  test('initial handshake: error -- device not checked in to event', async(done) => {
    const eventId = 3

    const webSocketServer = require('./cohort-websockets')({
      app: app, server: server, path: '/sockets'
    })

    expect(webSocketServer).toBeDefined()

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      let guid = uuid()
      wsClient.send(JSON.stringify({ guid: guid, eventId: eventId }))
    })

    wsClient.addEventListener('close', error => {
      expect(error.code).toEqual(4000)
      expect(error.reason).toEqual("Devices must be registered via HTTP before opening a WebSocket connection")
      done()
    })
  })

  test('initial handshake: happy path', async (done) => {
    const eventId = 3

    /* 
       this device is already created and checked in 
       in a full flow, we would:
     - POST /devices with {guid: 'whatever'} to create the device
     - PATCH /events/3/check-in with {guid: 'whatever'} to check in

       yeah it's a bit much
     */
    const guid = "1234567"

    const webSocketServer = require('./cohort-websockets')({
      app: app, server: server, path: '/sockets'
    })

    expect(webSocketServer).toBeDefined()

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      wsClient.addEventListener('message', message => {
        const msg = JSON.parse(message.data)
        expect(msg.response).toEqual("success")
        done()
      })

      wsClient.send(JSON.stringify({ guid: guid, eventId: 3 }))
    })
  })

  test('closing socket: error -- socket has no cohortDeviceGUID property', async (done) => {

    const eventId = 3
    const guid = "1234567"

    const webSocketServer = require('./cohort-websockets')({
      app: app, server: server, path: '/sockets'
    })
    expect(webSocketServer).toBeDefined()

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      wsClient.addEventListener('message', message => {
        const msg = JSON.parse(message.data)
        expect(msg.response).toEqual("success")

        let event = app.get("cohort").events.find( event => event.id == eventId)
        expect(event).toBeDefined()

        let device = event.devices.find( device => device.guid == guid)
        expect(device).toBeDefined()  
        expect(device.socket.cohortDeviceGUID).toEqual(guid)
        
        delete device.socket.cohortDeviceGUID
        expect(device.socket.cohortDeviceGUID).toBeUndefined()

        wsClient.close()
        setTimeout( () => {
          expect(app.get('cohort').errors[0]).toEqual('Error: Could not find device for closed socket')
          done()
        }, 100)
      })

      wsClient.send(JSON.stringify({ guid: guid, eventId: 3 }))
    })
  })

  test('closing socket (explicitly): happy path', async (done) => {

    const eventId = 3
    const guid = "1234567"

    const webSocketServer = require('./cohort-websockets')({
      app: app, server: server, path: '/sockets'
    })
    expect(webSocketServer).toBeDefined()

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      wsClient.addEventListener('message', message => {
        const msg = JSON.parse(message.data)
        expect(msg.response).toEqual("success")

        wsClient.close()
        setTimeout( () => {
          expect(wsClient.readyState).toEqual(3)
          
          let event = app.get("cohort").events.find( event => event.id == eventId)
          expect(event).toBeDefined()

          let device = event.devices.find( device => device.guid == guid)
          expect(device).toBeDefined()  
          expect(device.socket).toBeNull()

          done()
        }, 50)
      })

      wsClient.send(JSON.stringify({ guid: guid, eventId: 3 }))
    })
  })

  // FYI this test takes ~15-20 seconds to complete because it tests the keepalive function
  test('destroying socket: happy path', async (done) => { 
    jest.setTimeout(20000)
    const eventId = 3
    const guid = "1234567"

    const webSocketServer = await require('./cohort-websockets')({
      app: app, server: server, path: '/sockets'
    })
    expect(webSocketServer).toBeDefined()

    let wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      wsClient.addEventListener('message', message => {
        const msg = JSON.parse(message.data)
        expect(msg.response).toEqual("success")
        expect(webSocketServer.clients.size).toEqual(1)
      })

      wsClient.send(JSON.stringify({ guid: guid, eventId: eventId }))

      setTimeout( () => {
        console.log('simulating a nonresponsive client')
        wsClient._receiver._events.ping = () => { 
          console.log('client got ping but is pretending to be dead')
        }

        setTimeout( () => {
          expect(webSocketServer.clients.size).toEqual(0)
          done()
        }, 10000)

      }, 7000)
    })
  })

  test('admin device gets broadcasts when device state changes', async (done) => {
    const eventId = 3
    const adminGUID = "54321" // this is seeded as an admin device
    const device1GUID = "1234567"

    const webSocketServer = require('./cohort-websockets')({
      app: app, server: server, path: '/sockets'
    })
    expect(webSocketServer).toBeDefined()

    const adminClient = new ws(socketURL)
    var device1Client

    adminClient.addEventListener('open', event => {
      let messagesReceived = 0
      adminClient.addEventListener('message', message => {
        const msg = JSON.parse(message.data)
        messagesReceived++

        if(messagesReceived == 1){        // handshake was successful
          expect(msg.response).toEqual('success')

          // connect the first device
          device1Client = new ws(socketURL)
          device1Client.addEventListener('open', event => {
            device1Client.send(JSON.stringify({ guid: device1GUID, eventId: eventId}))
          })

        } else if(messagesReceived == 2){ // first device state broadcast
          expect(msg.status).toHaveLength(3)
          expect(msg.status
            .find( deviceState => deviceState.guid == device1GUID)
            .socketOpen
          ).toEqual(false)

        } else if(messagesReceived == 3){ // second device state broadcast 
          expect(msg.status).toHaveLength(3)
          expect(msg.status
            .find( deviceState => deviceState.guid == device1GUID)
            .socketOpen
          ).toEqual(true)
          device1Client.close()

        } else if(messagesReceived == 4){ // last device state broadcast 
          expect(msg.status).toHaveLength(3)
          expect(msg.status
            .find( deviceState => deviceState.guid == device1GUID)
            .socketOpen
          ).toEqual(false)
          done()
        } 
      })

      adminClient.send(JSON.stringify({ guid: adminGUID, eventId: eventId }))
    })
  })

  // test that admin devices (2) get status for the correct event...

  // test that event close shuts down active sockets nicely

  test('broadcast: happy path', async (done) => {
    const cohortMessage = {
      targetTags: ["all"],
	    mediaDomain: "sound",
	    cueNumber: 1,
	    cueAction: "play"
    }

    const eventId = 3
    const guid1 = "54321" 
    const guid2 = "1234567"

    const webSocketServer = require('./cohort-websockets')({
      app: app, server: server, path: '/sockets'
    })
    expect(webSocketServer).toBeDefined()

    const client1 = new ws(socketURL)

    var broadcastsReceived = 0

    client1.addEventListener('open', () => {
      client1.send(JSON.stringify({ guid: guid1, eventId: eventId }))

      client1.addEventListener('message', message => {
        const msg = JSON.parse(message.data)
        if(msg.mediaDomain !== undefined && msg.mediaDomain == 'sound'){
          broadcastsReceived++
        }
      })

      const client2 = new ws(socketURL)
      
      client2.addEventListener('open', () => {
        client2.send(JSON.stringify({ guid: guid2, eventId: eventId }))
        
        client2.addEventListener('message', message => {
          const msg = JSON.parse(message.data)
          if(msg.mediaDomain !== undefined && msg.mediaDomain == 'sound'){
            broadcastsReceived++
          }
        })

        setTimeout( async () => {
          setTimeout( () => {
            expect(broadcastsReceived).toEqual(2)
            done()
          }, 500)
    
          const res = await request(server)
            .post('/api/v1/events/3/broadcast')
            .send(cohortMessage)
    
          expect(res.status).toEqual(200)
          expect(res.text).toEqual("Successfully broadcast to 2 clients")
        }, 500)

      })
    })
  })
})

// partially written tests, keeping them around for useful bits

//   test('websocket : multiple connections', async () => {
//     expect.assertions(3)

//     expect(app.get('cohort').devices).toHaveLength(0)
    
//     const webSocketServer = await require('./cohort-websockets')({ 
//       app: app, server: server
//     })

//     expect(webSocketServer).toBeDefined()

//     const guids = [ uuid(), uuid(), uuid(), uuid() ]

//     guids.map( guid => new CHDevice(guid) ).forEach( device => {
//       app.get('cohort').devices.push(device)
//     })
  
//     expect(app.get('cohort').devices).toHaveLength(4)

//     let clients = []
//     let connectionStatuses = []

//     guids.forEach( guid => {
//       const wsClient = new WebSocket('ws://localhost:3000')
//       let isOpen = new Promise( resolve => {
//         wsClient.addEventListener('open', event => {
//           wsClient.send(JSON.stringify({ guid: guid }))
//         })

//         // pick up here
//       })
//       clients.push(wsClient)
//       connectionStatuses.push(promise)
//     })
//   })


//     // const webSocketServer = require('./cohort-websockets')({
//     //   app: app, 
//     //   server: server,
//     //   callback: () => {
//     //     let clients = []
//     //     let connectionOpenPromises = []
//     //     for(i = 0; i < 4; i++){
//     //       const wsClient = new webSocket('ws://localhost:3000')
//     //       let promise = new Promise( (resolve) => {
//     //         wsClient.addEventListener('open', (event) => {
//     //           resolve()
//     //         })
//     //       })
//     //       clients.push(wsClient)
//     //       connectionOpenPromises.push(promise)
//     //     }
        
//     //     Promise.all(connectionOpenPromises).then(() => {
//     //       expect(app.get('cohort').devices).toHaveLength(4)
//     //       let connectedClients = clients.filter( (client) => {
//     //         return client.readyState == WebSocket.OPEN
//     //       })
//     //       expect(connectedClients).toHaveLength(4)
//     //       done()
//     //     })
//     //   }
//     // })


//   // test('websocket: keepalive for one minute', (done) => {
//   //   const webSocketServer = require('./cohort-websockets')({
//   //     app: app, 
//   //     server: server,
//   //     callback: () => {
//   //       const wsClient = new webSocket('ws://localhost:3000')
        
//   //       wsClient.addEventListener('open', (event) => {
//   //         expect(app.get('cohort').devices).toHaveLength(1)
//   //         setTimeout(() => {
//   //           expect(wsClient.readyState).toEqual(WebSocket.OPEN) // still open
//   //           done()
//   //         }, 60000)
//   //       })
//   //     }
//   //   })
//   // }, 70000)
// })
  
//   test('broadcast/push-notification : happy path (one device)', async () => {
//     // create a device
//     const guid = uuid()
//     const res1 = await createDevice(guid)
//     expect(res1.status).toEqual(200)

//     // register a device
//     const payload2 = { token: '12345', guid: guid }
//     const res2 = await request(app)
//       .post('/api/devices/register-for-notifications')
//       .send(payload2)
//     expect(res2.status).toEqual(200)

//     // test broadcast endpoint
//     const payload = { 
//       "text": "hello world",
//       "bundleId": "rocks.cohort.test",
//       "simulate": "success"
//     }

//     const res = await request(app)
//       .post('/api/broadcast/push-notification')
//       .send(payload)
//     expect(res.status).toEqual(200)
//     expect(res.text).toEqual("Sent notifications to 1/1 registered devices")
//   })
// })
