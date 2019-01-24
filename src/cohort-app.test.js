const request = require('supertest')
// const express = require('express')
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

describe('Basic startup', () => {
  test('the app inits', async () => {
    const res = await request(app).get('/api/v1')
    expect(res.status).toEqual(200)
    expect(res.text).toEqual('Cohort rocks')
  })
})

/* 
 *    UTILITY METHODS
 */

beforeAll( () => {
  createDevice = (guid) => {
    const payload = { guid: guid }
    return request(app)
      .post('/api/v1/devices')
      .send(payload)
  }
})

/*
 *    EVENT ROUTES
 */

 describe('Event routes', () => {
  test('GET /events', async () => {
    const res = await request(app).get('/api/v1/events')
    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(4)

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
    const res = await request(app).get('/api/v1/events/5')
    expect(res.status).toEqual(404)

    expect(res.text).toEqual("Error: event with id:5 not found")
  })

  test('POST /events', async () =>{
    const res = await request(app)
      .post('/api/v1/events')
      .send({ label: 'new event' })

    expect(res.status).toEqual(201)
    expect(res.header.location).toEqual('/api/v1/events/5')
    expect(res.body).toHaveProperty('id')
    expect(res.body.id).toEqual(5)
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

  test('GET /events/:id/devices', async () => {
    const res = await request(app)
      .get('/api/v1/events/3/devices')

    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(2)
  })

  // happy path
  test('PATCH /events/:id/check-in', async () => {
    const res1 = await request(app).get('/api/v1/events/1/devices')
    expect(res1.status).toEqual(200)
    const deviceCount = res1.body.length

    // this device already exists in the DB
    // in a full flow, we would create the device at POST /devices first
    // yeah it's a bit much
    const res2 = await request(app)
      .patch('/api/v1/events/1/check-in')
      .send({ guid: 1234567 })

    expect(res2.status).toEqual(200)
    expect(res2.body).toHaveProperty('id')
    expect(res2.body.id).toEqual(1)

    const res3 = await request(app).get('/api/v1/events/1/devices')
    expect(res3.body).toHaveLength(deviceCount+1)
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
      .send({ guid: 1234567 })

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
      .patch('/api/v1/events/5/check-in')
      .send({ guid: "1234567" })

    expect(res.status).toEqual(404)
    expect(res.text).toEqual("Error: no event found with id:5")
  })

  test('PATCH /events/:id/open', async () => {
    expect(app.get("cohort").events.length).toEqual(2)
    const res = await request(app)
      .patch('/api/v1/events/2/open')
    
    expect(res.status).toEqual(200)
    expect(res.body.state).toEqual('open')
    expect(app.get("cohort").events.length).toEqual(3)
  })

  test('PATCH /events/:id/close', async () => {
    expect(app.get("cohort").events.length).toEqual(2)
    const res = await request(app)
      .patch('/api/v1/events/3/close')
    
    expect(res.status).toEqual(200)
    expect(res.body.state).toEqual('closed')
    expect(app.get("cohort").events.length).toEqual(1)
  })

  // broadcast
})


/*
 *    DEVICE & NOTIFICATION ROUTES
 */

describe('Device routes', () => {

  test('GET /devices', async () => {
    const res = await request(app).get('/api/v1/devices')

    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(3)
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
    const res = await createDevice(12345678)
    
    expect(res.status).toEqual(201)
    expect(res.header.location).toEqual('/api/v1/devices/4')
    expect(res.body.guid).toEqual('12345678')

    const res1 = await request(app)
      .get('/api/v1/devices/' + res.body.id)

    expect(res1.status).toEqual(200)
    expect(res1.body.guid).toEqual('12345678')
  })

  test('POST /devices -- device already exists', async () => {
    const res = await createDevice(12345678)
    
    expect(res.status).toEqual(201)
    expect(res.header.location).toEqual('/api/v1/devices/4')
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
//   // test('device: open websocket', () => {

//   // })

//   test('devices/:id/registerForNotifications : happy path', async () => {
//     const guid = uuid()
//     const interimResponse = await createDevice(guid)
//     const payload = { token: 'abcde12345' }
//     const deviceId = interimResponse.body.id
    
//     const res = await request(app)
//       .patch('/api/devices/' + deviceId + '/register-for-notifications')
//       .send(payload)
//     expect(res.status).toEqual(200)
//     expect(res.body.apnsDeviceToken).toEqual('abcde12345')
//   })
  
//   // test for id not found

//   test('devices/registerForNotifications : error: missing token', async () => {
//     const payload = { 'blep': '012345678901234567890123456789012345'}
//     const res = await request(app)
//       .patch('/api/devices/1/register-for-notifications')
//       .send(payload)
//     expect(res.status).toEqual(400)
//     expect(res.text).toEqual("Error: Request must include a 'token' object")
//   })
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

  afterEach( async () => {
    console.log('websockets afterEach()')
    await server.close()
  })

  test('startup & new connection', async (done) => {
    expect.assertions(3)

    expect(app.get("cohort").events[0].devices.length).toEqual(2)

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

//   test('send message: error -- json parse error', async (done) => {
//     expect.assertions(3)

//     expect(app.get("cohort").events[0].devices.length).toEqual(2)

//     const webSocketServer = require('./cohort-websockets')({
//       app: app, server: server, path: '/sockets'
//     })

//     expect(webSocketServer).toBeDefined()

//     const wsClient = new ws(socketURL)

//     wsClient.addEventListener('open', event => {

//       wsClient.addEventListener('message', message => {
//         const msg = JSON.parse(message.data)
//         expect(msg.error).toEqual("message is not valid JSON (Unexpected string in JSON at position 9)")
//         done()
//       })

//       let badJSONString = '{\"blep:\" \"blop\"}'
//       wsClient.send(badJSONString)
//     })
//   })

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
    const guid = 54321

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
})


//   test('websocket : new connection', async () => {
//     expect.assertions(4)

//     expect(app.get('cohort').devices).toHaveLength(0)

//     const guid = uuid()

//     let device = new CHDevice(guid)
//     app.get('cohort').devices.push(device)
//     expect(app.get('cohort').devices).toHaveLength(1)

//     console.log("creating server")

//     const webSocketServer = await require('./cohort-websockets')({ 
//       app: app, server: server
//     })

//     expect(webSocketServer).toBeDefined()

//     const wsClient = new webSocket('ws://localhost:3000')
    
//     wsClient.addEventListener('open', (event) => {
//       wsClient.send(JSON.stringify({ guid: guid }))
//     })

//     const msg = await new Promise ( resolve => {
//       wsClient.addEventListener('message', (message) => {
//         const msg = JSON.parse(message.data)
//         console.log(msg)
//         resolve(msg)
//       })
//     })

//     expect(msg.result).toEqual("success")
//   })

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

//   test('websocket : broadcast (happy path)', (done) => {
//     expect.assertions(4)
    
//     const webSocketServer = require('./cohort-websockets')({
//       app: app, 
//       server: server,
//       callback: () => {
//         const wsClient = new webSocket('ws://localhost:3000')
        
//         wsClient.addEventListener('message', (msg) => {
//           let message = JSON.parse(msg.data)
//           console.log(message)
//           expect(message).toEqual({ cohortMessage: "test" })
//         })

//         wsClient.addEventListener('open', async (event) => {
//           expect(app.get('cohort').devices).toHaveLength(1)
          
//           const payload = { "cohortMessage": "test" }
          
//           const res = await request(app)
//             .post('/api/broadcast')
//             .send(payload)

//           expect(res.status).toEqual(200)
//           expect(res.text).toEqual('Successfully broadcast to 1 clients')
//           done()
//         })
//       }
//     })
//   })

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

// /*
//  *    BROADCAST ROUTES
//  */

// describe('Broadcast routes', () => {

//   beforeEach( async () => {
//     await knex.migrate.rollback()
//     await knex.migrate.latest()
//     await knex.seed.run()
//   })

//   afterEach( async () => {
//     await knex.migrate.rollback()
//   })

//   test('broadcast (using websockets) : error: no devices', async () => {
//     const payload = { "cohortMessage": "test" }
//     const res = await request(app)
//       .post('/api/broadcast')
//       .send(payload)
//     expect(res.status).toEqual(200)
//     expect(res.text).toEqual("Warning: No devices are connected, broadcast was not sent")
//   })
  
//   test('broadcast (using websockets) : error: no connected devices', async () => {
//     // create a device
//     const guid = uuid()
//     const res1 = await createDevice({ guid: guid })
//     expect(res1.status).toEqual(200)

//     // send a message (but device never opened a socket!)
//     const payload = { "cohortMessage": "test" }
//     const res = await request(app)
//       .post('/api/broadcast')
//       .send(payload)
//     expect(res.status).toEqual(200)
//     expect(res.text).toEqual("Warning: No devices are connected via WebSockets, broadcast was not sent")
//   })

// //   // test('broadcast (using websockets) : happy path' is located in websocket section
  
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
