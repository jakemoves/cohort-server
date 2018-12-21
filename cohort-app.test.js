const request = require('supertest')
const express = require('express')
const CHDevice = require('./models/CHDevice')
var app

beforeEach( () => {
  app = require('./cohort-app')  
})

afterEach( () => {
  // per issue #12, we should actually tear down the app/server here
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

/*
 *    DEVICE ROUTES
 */

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

/*
 *    BROADCAST ROUTES
 */

describe('Broadcast routes', () => {
  test('broadcast (using websockets) : error: no devices', async () => {
    const payload = { "cohortMessage": "test" }
    const res = await request(app)
      .post('/api/broadcast')
      .send(payload)
    expect(res.status).toEqual(200)
    expect(res.text).toEqual("Warning: No devices are connected, broadcast was not sent")
  })
  
  test('broadcast (using websockets) : error: no connected devices', async () => {
    // create a device
    const res1 = await request(app).get('/api/devices/create')
    expect(res1.status).toEqual(200)
    expect(res1.body.guid).toHaveLength(36)
    const guid = res1.body.guid

    // send a message (but device never opened a socket!)
    const payload = { "cohortMessage": "test" }
    const res = await request(app)
      .post('/api/broadcast')
      .send(payload)
    expect(res.status).toEqual(200)
    expect(res.text).toEqual("Warning: No devices are connected via WebSockets, broadcast was not sent")
  })
  
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

describe('WebSocket connections', () => {
  beforeAll( () => {
    webSocket = require('ws')
    var server
  })

  beforeEach( () => {
    server = app.listen(3000, function(err){
      if(err) {
        throw err
      }
    
      console.log('http server started on port 3000')
      console.log('environment: ' + process.env.NODE_ENV)
    })
  })

  afterEach( () => {
    server.close()
  })

  test('websocket : new connection', (done) => {
    // TODO this does NOT test 'new device', only new connection, we need to try and match up with existing device
    expect.assertions(2)

    expect(app.get('cohort').devices).toHaveLength(0)
    
    const webSocketServer = require('./cohort-websockets')({
      app: app, 
      server: server,
      callback: () => {
        const wsClient = new webSocket('ws://localhost:3000')
        
        wsClient.addEventListener('open', (event) => {
          expect(app.get('cohort').devices).toHaveLength(1)
          done()
        })
      }
    })
  })

  test('websocket : multiple connections', (done) => {
    expect.assertions(3)

    expect(app.get('cohort').devices).toHaveLength(0)
    
    const webSocketServer = require('./cohort-websockets')({
      app: app, 
      server: server,
      callback: () => {
        let clients = []
        let connectionOpenPromises = []
        for(i = 0; i < 4; i++){
          const wsClient = new webSocket('ws://localhost:3000')
          let promise = new Promise( (resolve) => {
            wsClient.addEventListener('open', (event) => {
              resolve()
            })
          })
          clients.push(wsClient)
          connectionOpenPromises.push(promise)
        }
        
        Promise.all(connectionOpenPromises).then(() => {
          expect(app.get('cohort').devices).toHaveLength(4)
          let connectedClients = clients.filter( (client) => {
            return client.readyState == WebSocket.OPEN
          })
          expect(connectedClients).toHaveLength(4)
          done()
        })
      }
    })
  })

  test('websocket : broadcast (happy path)', (done) => {
    expect.assertions(4)
    
    const webSocketServer = require('./cohort-websockets')({
      app: app, 
      server: server,
      callback: () => {
        const wsClient = new webSocket('ws://localhost:3000')
        
        wsClient.addEventListener('message', (msg) => {
          let message = JSON.parse(msg.data)
          console.log(message)
          expect(message).toEqual({ cohortMessage: "test" })
        })

        wsClient.addEventListener('open', async (event) => {
          expect(app.get('cohort').devices).toHaveLength(1)
          
          const payload = { "cohortMessage": "test" }
          
          const res = await request(app)
            .post('/api/broadcast')
            .send(payload)

          expect(res.status).toEqual(200)
          expect(res.text).toEqual('Successfully broadcast to 1 clients')
          done()
        })
      }
    })
  })

  // test('websocket: keepalive for one minute', (done) => {
  //   const webSocketServer = require('./cohort-websockets')({
  //     app: app, 
  //     server: server,
  //     callback: () => {
  //       const wsClient = new webSocket('ws://localhost:3000')
        
  //       wsClient.addEventListener('open', (event) => {
  //         expect(app.get('cohort').devices).toHaveLength(1)
  //         setTimeout(() => {
  //           expect(wsClient.readyState).toEqual(WebSocket.OPEN) // still open
  //           done()
  //         }, 60000)
  //       })
  //     }
  //   })
  // }, 70000)
})