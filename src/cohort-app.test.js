const request = require('supertest')
const express = require('express')
const CHDevice = require('./models/CHDevice')
const uuid = require('uuid/v4')
const knex = require('./knex/knex')

var app
process.env.NODE_ENV = 'test'

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
 *    UTILITY METHODS
 */

beforeAll( () => {
  createDevice = (guid) => {
    if(guid == null || typeof guid == undefined){
      const guid = uuid()
    }
    const payload = { guid: guid }
    return request(app)
      .post('/api/devices')
      .send(payload)
  }

  // openSocketForDevice(guid, callback) // callback style gets ugly, this should be better
})

/*
 *    EVENT ROUTES
 */

 describe('Event routes', () => {
  beforeEach( async () => {
    await knex.migrate.rollback()
    await knex.migrate.latest()
    await knex.seed.run()
  })

  afterEach( async () => {
    await knex.migrate.rollback()
  })

  test('GET events', async () => {
    const res = await request(app).get('/api/events')
    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(2)

    expect(res.body[0]).toHaveProperty('label')
    expect(res.body[0].label).toEqual('pimohtēwak')

    expect(res.body[1]).toHaveProperty('label')
    expect(res.body[1].label).toEqual('lot_x')
  })

  test('GET events/:id', async () => {
    const res = await request(app).get('/api/events/1')
    expect(res.status).toEqual(200)

    expect(res.body).toHaveProperty('id')
    expect(res.body.id).toEqual(1)
    expect(res.body).toHaveProperty('label')
    expect(res.body.label).toEqual('pimohtēwak')
  })

  test('GET events/:id : error: event not found', async () => {
    const res = await request(app).get('/api/events/3')
    expect(res.status).toEqual(404)

    expect(res.text).toEqual("Error: event with id:3 not found")
  })

  // happy path
  test('PATCH events/:id/check-in', async () => {
    const res = await request(app)
      .patch('/api/events/1/check-in')
      .send({ guid: 1234567 })

    expect(res.status).toEqual(200)
    expect(res.body).toEqual( {
      event_id: 1, 
      device_id: 1
    })
  })

  test('PATCH events/:id/check-in : error: device guid not found', async () => {
    const guid = "bar"
    const res = await request(app)
      .patch('/api/events/1/check-in')
      .send({ guid: guid })

    expect(res.status).toEqual(500)
    expect(res.text).toEqual("Error: device with guid: " + guid + " does not exist")
  })  
  
  test('PATCH events/:id/check-in : error: no guid included in request', async () => {
    const res = await request(app)
      .patch('/api/events/1/check-in')
      .send({ foo: "bar" })

    expect(res.status).toEqual(500)
    expect(res.text).toEqual("Error: request must include a device guid")
  })

  test('PATCH events/:id/check-in : error: invalid event id', async () => {
    const res = await request(app)
      .patch('/api/events/3/check-in')
      .send({ guid: "1234567" })

    expect(res.status).toEqual(404)
    expect(res.text).toEqual("Error: no event found with id:3")
  })

  test('DELETE event/:id', async () => {
    const res = await request(app)
      .patch('/api/events/1/check-in')
      .send({ guid: 1234567 })

    expect(res.status).toEqual(200)

    const res2 = await request(app)
      .delete('/api/events/1')

    expect(res2.status).toEqual(200)
    expect(res2.body.id).toEqual(1)

    const res3 = await request(app)
      .get('/api/events/1')

    expect(res3.status).toEqual(404)

  })
})


/*
 *    DEVICE & NOTIFICATION ROUTES
 */

describe('Device routes', () => {
  beforeEach( async () => {
    await knex.migrate.rollback()
    await knex.migrate.latest()
    await knex.seed.run()
  })

  afterEach( async () => {
    await knex.migrate.rollback()
  })

  test('devices/create', async () => {
    const res = await createDevice(12345678)

    expect(res.status).toEqual(200)
    expect(res.body.guid).toEqual("12345678")
  })

  // test('device: open websocket', () => {

  // })

//   test('devices/registerForNotifications : happy path', async () => {
//     const guid = uuid()
//     const interimResponse = await createDevice(guid)
//     const payload = { guid: guid, token: 'abcde12345' }
    
//     const res = await request(app)
//       .post('/api/devices/register-for-notifications')
//       .send(payload)
//     expect(res.status).toEqual(200)
//   })

//   test('devices/registerForNotifications : error: guid not found', async () => {
//     const guid = uuid()
//     const payload = { guid: guid, token: 'abcde12345' }

//     const res = await request(app)
//       .post('/api/devices/register-for-notifications')
//       .send(payload)
//     expect(res.status).toEqual(400)
//     expect(res.text).toEqual("Error: no device found with matching GUID: " + payload.guid)
//   })

//   test('devices/registerForNotifications : error: device is already registered', async () => {
//     const guid = uuid()
//     const interimRes = await createDevice(guid)
//     expect(interimRes.status).toEqual(200)
//     const payload = { guid: guid, token: 'abcde12345' }
//     const interimRes1 = await request(app)
//       .post('/api/devices/register-for-notifications')
//       .send(payload)
//     expect(interimRes1.status).toEqual(200)
//     const res = await request(app)
//       .post('/api/devices/register-for-notifications')
//       .send(payload)
//     expect(res.status).toEqual(400)
//     expect(res.text).toEqual("Warning: Device with GUID " + guid + " is already registered for notifications")
//   })
  
//   test('devices/registerForNotifications : error: missing token', async () => {
//     const payload = { guid: '012345678901234567890123456789012345'}
//     const res = await request(app)
//       .post('/api/devices/register-for-notifications')
//       .send(payload)
//     expect(res.status).toEqual(400)
//     expect(res.text).toEqual("Error: Request must include 'token' and 'guid' objects")
//   })

//   test('devices/registerForNotifications : error: missing guid', async () => {
//     const payload = { token: '12345'}
//     const res = await request(app)
//       .post('/api/devices/register-for-notifications')
//       .send(payload)
//     expect(res.status).toEqual(400)
//     expect(res.text).toEqual("Error: Request must include 'token' and 'guid' objects")
//   })
})

// /*
//  *    BROADCAST ROUTES
//  */

// describe('Broadcast routes', () => {
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

//   // test('broadcast (using websockets) : hapy path' is located in websocket section
  
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

// describe('WebSocket connections', () => {
//   beforeAll( () => {
//     webSocket = require('ws')
//     var server
//   })

//   beforeEach( () => {
//     server = app.listen(3000, function(err){
//       if(err) {
//         throw err
//       }
    
//       console.log('http server started on port 3000')
//       console.log('environment: ' + process.env.NODE_ENV)
//     })
//   })

//   afterEach( () => {
//     server.close()
//   })

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