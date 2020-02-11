// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

/* 
Notes:
- if you fail to close a websocket client within a test -- client.close() --  the test will hang
*/

const request = require('supertest')
const uuid = require('uuid/v4')
const knex = require('./knex/knex')
const moment = require('moment')

const ws = require('ws')

const CHSession = require('./models/CHSession')
const login = require('./cohort-test-helpers').login

var app, server, webSocketServer
var socketURL = 'http://localhost:3000/sockets'
var keepaliveIntervalDuration = 1000 // for testing only, values this small cause issues over cellular connections in production

process.env.NODE_ENV = 'test'

beforeEach( async () => {
  console.log('global beforeEach()')
  await knex.migrate.rollback()
  await knex.migrate.latest()
  await knex.seed.run()

  app = require('./cohort-app')

  await CHSession.initAndSetOnApp(app)
  
  // this is pretty much the same as cohort-server.js
  serverPromise = await new Promise( (resolve, reject) => {
    server = app.listen(3000, function(err){
      if(err) {
        throw err
      }

      console.log('  http server started on port 3000')
      console.log('  environment: ' + process.env.NODE_ENV)
      resolve()
    })
    return server
  })

  webSocketServer = await require('./cohort-websockets')({
		app: app,
		server: server,
		path: '/sockets',
		keepaliveIntervalDuration: keepaliveIntervalDuration 
	})

  console.log('end global beforeEach()')
})

afterEach( async () => {
  console.log('global afterEach()')
  await knex.migrate.rollback()

  return new Promise( (resolve, reject) => {
    server.close( () => {
      console.log('server closed')
      app.set('cohort', null)
      console.log('end global afterEach()')
      server = null
      resolve()
    })
  })
})

afterAll( async () => {
  console.log("global afterAll")
  // await knex.destroy()
  console.log("end global afterAll")
})

/* 
 *    UTILITY METHODS
 */

beforeAll( () => {
  createClientAndConnect = (occasionId) => {
    return new Promise( (resolve, reject) => {
      const guid = uuid()

      const wsClient = new ws(socketURL)
      wsClient.cohortDeviceGUID = guid
  
      wsClient.addEventListener('message', message => {
        const msg = JSON.parse(message.data)
        if(msg.response == 'success'){
          resolve(wsClient)
        } else {
          reject('Error: handshake failed')
        }
      }, {once: true})
      
      wsClient.addEventListener('open', event => {
        wsClient.send(JSON.stringify({ guid: guid, occasionId: occasionId }))
      })
    })
  }

  createClientArray = async (occasionId, length, onCueReceived) => {
    let clients = []
    for(i = 0; i < length; i++){
      let client = await createClientAndConnect(occasionId)
      expect(client).toBeDefined()

      client.addEventListener('message', message => {
        const msg = JSON.parse(message.data)
        onCueReceived(msg, client)
      })

      clients.push(client)
    }

    return clients
  }
})

/*
 *    WEBSOCKETS
 */

describe('WebSockets', () => { 
  test('server starts up and shuts down', (done) => {
    expect(server).not.toBeNull()
    expect(server).toBeDefined()
    expect(webSocketServer).not.toBeNull()
    expect(webSocketServer).toBeDefined()
    
    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      expect(wsClient.readyState).toEqual(1)
      wsClient.close()
      done()
    })
  })

  test('server starts up and shuts down twice', (done) => {
    expect(server).not.toBeNull()
    expect(server).toBeDefined()
    expect(webSocketServer).not.toBeNull()
    expect(webSocketServer).toBeDefined()
    
    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      expect(wsClient.readyState).toEqual(1)
      wsClient.close()
      done()
    })
  })

  test('send message: error -- json parse error', (done) => {
    const wsClient = new ws(socketURL)

    wsClient.addEventListener('message', message => {
      const msg = JSON.parse(message.data)
      expect(msg.error).toEqual("message is not valid JSON (Unexpected string in JSON at position 9)")
      wsClient.close()
      done()
    })

    wsClient.addEventListener('open', event => {
      let badJSONString = '{\"blep:\" \"blop\"}'
      wsClient.send(badJSONString)
    })
  })

  test('initial handshake: error -- no guid included', (done) => {
    const occasionId = 3

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      wsClient.send(JSON.stringify({ occasionId: occasionId }))
    })

    wsClient.addEventListener('close', error => {
      expect(error.code).toEqual(4003)
      expect(error.reason).toEqual("Error: first message from client must include fields 'guid' and 'occasionId'")
      done()
    })
  })

  test('initial handshake: error -- no occasionId included', (done) => {
    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      const guid = uuid()
      wsClient.send(JSON.stringify({ guid: guid }))
    })

    wsClient.addEventListener('close', error => {
      expect(error.code).toEqual(4003)
      expect(error.reason).toEqual("Error: first message from client must include fields 'guid' and 'occasionId'")
      done()
    })
  })

  test('initial handshake: error -- open occasion not found', (done) => {
    expect.assertions(2)
    const occasionId = 4

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('open', event => {
      const guid = uuid()
      wsClient.send(JSON.stringify({ guid: guid, occasionId: occasionId }))
    })

    wsClient.addEventListener('close', error => {
      expect(error.code).toEqual(4002)
      expect(error.reason).toEqual("Error: No open occasion found with id:4")
      done()
    })
  })

  test('initial handshake: error -- handshake not completed within time limit', (done) => {
    expect.assertions(3)
    const occasionId = 3

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('close', error => {
      expect(error.code).toEqual(4004)
      expect(error.reason).toEqual("Error: cohort handshake not completed within time limit")
      expect(webSocketServer.clients.size).toEqual(0)
      done()
    })
  })

  // test('initial handshake: error -- device already connected' 

  test('initial handshake: happy path', (done) => {
    const occasionId = 3
    const guid = uuid()

    const wsClient = new ws(socketURL)

    wsClient.addEventListener('message', message => {
      const msg = JSON.parse(message.data)
      expect(msg.response).toEqual("success")
      wsClient.close()
      done()
    })

    wsClient.addEventListener('open', event => {
      wsClient.send(JSON.stringify({ guid: guid, occasionId: occasionId }))
    })
  })
})
  
/*
 *    OCCASIONS & BROADCAST TESTS
 */

describe('Occasions & WebSocket broadcasts', () => {
  
  test('client disconnect', async (done) => {
    const occasionId = 3

    let client = await createClientAndConnect(occasionId)

    expect(webSocketServer.clients.size).toEqual(1)

    let occasion = app.get('cohortSession').openOccasions[0]
    expect(occasion).toBeDefined()
    expect(occasion.devices).toHaveLength(1)

    client.close()

    setTimeout(() => {
      expect(webSocketServer.clients.size).toEqual(0)
      expect(occasion.devices).toHaveLength(0)
      
      done()
    }, 1500)
  })
  
  test('POST /occasions/:id/broadcast -- error: auth required', async () => {
    const payload = { 
      "mediaDomain": 0,
      "cueNumber": 1,
      "cueAction": 0,
      "targetTags": ["all"]
    }

    const res = await request(app)
    .post('/api/v2/occasions/3/broadcast')
    .send(payload)

    expect(res.status).toEqual(401)
  })

  test('POST occasions/:id/broadcast: error -- no open occasion matching id', async () => {
    const token = await login('test_admin_user', app)
    expect(token).toBeDefined()
    
    const occasionId = 4

    const res = await request(app)
      .post('/api/v2/occasions/' + occasionId + '/broadcast')
      .set('Authorization', 'JWT ' + token)
      .send({
        "mediaDomain": 0,
        "cueNumber": 1,
        "cueAction": 0,
        "targetTags": ["all"]
      })
    
    expect(res.status).toEqual(404)
    expect(res.text).toEqual('Error: no open occasion found with id:' + occasionId)
  })

  test('POST occasions/:id/broadcast: error -- no devices connected', async () => {
    const token = await login('test_admin_user', app)
    expect(token).toBeDefined()

    const occasionId = 3

    const res = await request(app)
      .post('/api/v2/occasions/' + occasionId + '/broadcast')
      .set('Authorization', 'JWT ' + token)
      .send({
        "mediaDomain": 0,
        "cueNumber": 1,
        "cueAction": 0,
        "targetTags": ["all"]
      })
    
    expect(res.status).toEqual(409)
    expect(res.text).toEqual('Error: no devices connected to receive broadcast')
  })

  test('POST occasions/:id/broadcast: happy path', async () => {
    const token = await login('test_admin_user', app)
    expect(token).toBeDefined()

    const occasionId = 3
    const cue = { 
      "mediaDomain": 0,
      "cueNumber": 1,
      "cueAction": 0,
      "targetTags": ["all"]
    }

    let client = await createClientAndConnect(occasionId)
    expect(client).toBeDefined()

    client.addEventListener('message', message => {
      const msg = JSON.parse(message.data)
      expect(msg).toEqual(cue)
      client.close()
    })

    const res = await request(app)
      .post('/api/v2/occasions/3/broadcast')
      .set('Authorization', 'JWT ' + token)
      .send(cue)

    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toEqual({
      "guid": client.cohortDeviceGUID,
      "success": true
    })
  })

  test('POST occasions/:id/broadcast: happy path, multiple clients, same occasion', async () => {
    const token = await login('test_admin_user', app)
    expect(token).toBeDefined()

    const occasionId = 3
    const cue = { 
      "mediaDomain": 0,
      "cueNumber": 1,
      "cueAction": 0,
      "targetTags": ["all"]
    }

    let cuesReceived = 0

    let clients = await createClientArray(occasionId, 10, (msg, client) => {
      expect(msg).toEqual(cue)
      cuesReceived++
      client.close()
    })

    const res = await request(app)
      .post('/api/v2/occasions/3/broadcast')
      .set('Authorization', 'JWT ' + token)
      .send(cue)

    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(10)

    const results = res.body 
    expect(results).toHaveLength(10)
    
    const result = new Set(results.map( result => result.success)) // serves to remove duplicates from the array

    expect(result.has(true)).toBeTruthy()
    expect(result.size).toEqual(1)

    expect(cuesReceived).toEqual(10)
  })

  test('POST occasions/:id/broadcast: happy path, multiple clients, different occasions', async () => {
    const token = await login('test_admin_user', app)
    expect(token).toBeDefined()
    
    let res1 = await request(app)
      .patch('/api/v2/occasions/4')
      .set('Authorization', 'JWT ' + token)
      .send({state: 'opened'})
    
    expect(res1.status).toEqual(200)

    const cue = { 
      "mediaDomain": 0,
      "cueNumber": 1,
      "cueAction": 0,
      "targetTags": ["all"]
    }

    let cuesReceived = 0
    let clientsA = await createClientArray(3, 5, (msg, client) => {
      expect(msg).toEqual(cue)
      cuesReceived++
    })
    let clientsB = await createClientArray(4, 5, (msg, client) => {
      expect(msg).toEqual(cue)
      cuesReceived++
    })

    const res = await request(app)
      .post('/api/v2/occasions/3/broadcast')
      .set('Authorization', 'JWT ' + token)
      .send(cue)

    clientsA.forEach(client => client.close())
    clientsB.forEach(client => client.close())

    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(5)

    const results = res.body 
    expect(results).toHaveLength(5)
    
    const result = new Set(results.map( result => result.success)) // serves to remove duplicates from the array

    expect(result.has(true)).toBeTruthy()
    expect(result.size).toEqual(1)

    expect(cuesReceived).toEqual(5)
  })

  test('POST occasions/:id/broadcast: happy path, user can broadcast to an occasion they own', async () => {
    const token = await login('test_user_1', app)
    expect(token).toBeDefined()

    const cue = { 
      "mediaDomain": 0,
      "cueNumber": 1,
      "cueAction": 0,
      "targetTags": ["all"]
    }

    let cuesReceived = 0
    
    let clients = await createClientArray(3, 10, (msg, client) => {
      cuesReceived++
      expect(msg).toEqual(cue)
      client.close()
    })

    let res = await request(app)
    .post('/api/v2/occasions/3/broadcast')
    .set('Authorization', 'JWT ' + token)
    .send(cue)

    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(10)

    const results = res.body 
    expect(results).toHaveLength(10)
    
    const result = new Set(results.map( result => result.success)) //remove duplicates from the array

    expect(result.has(true)).toBeTruthy()
    expect(result.size).toEqual(1)

    expect(cuesReceived).toEqual(10)
  })

  test('POST occasions/:id/broadcast: happy path, user cannot broadcast to an occasion they do not own', async () => {
    const token = await login('test_user_2', app)
    expect(token).toBeDefined()

    const cue = { 
      "mediaDomain": 0,
      "cueNumber": 1,
      "cueAction": 0,
      "targetTags": ["all"]
    }
    
    let clients = await createClientArray(3, 10, (msg, client) => {
      cuesReceived++
      expect(msg).toEqual(cue)
      client.close()
    })

    let res = await request(app)
    .post('/api/v2/occasions/3/broadcast')
    .set('Authorization', 'JWT ' + token)
    .send(cue)

    expect(res.status).toEqual(401)
    clients.forEach(client => client.close())
  })

  // test('broadcast: error -- inactive socket (returned array from /broadcast should specify which device guid)

  test('close occasion with connected client', async (done) => {
    expect.assertions(8)

    const token = await login('test_admin_user', app)
    expect(token).toBeDefined()

    const occasionId = 3

    let client = await createClientAndConnect(occasionId)

    expect(client).toBeDefined()

    client.addEventListener('close', event => {
      expect(event.code).toEqual(1001)
      expect(event.reason).toEqual('Cohort occasion is closing')
      done()
    })

    const res = await request(app)
      .patch('/api/v2/occasions/3')
      .set('Authorization', 'JWT ' + token)
      .send({state: 'closed'})

    expect(res.status).toEqual(200)
    expect(res.body.id).toEqual(3)
    expect(res.body.state).toEqual('closed')
    expect(app.get('cohortSession').openOccasions).toHaveLength(0)
    done()
  })

  
  test('sockets stay open via keepalive ping/pong', async (done) => {
    jest.setTimeout(keepaliveIntervalDuration * 4)

    const occasionId = 3
    let client = await createClientAndConnect(occasionId)
    expect(client).toBeDefined()

    expect(webSocketServer.clients.size).toEqual(1)
    let occasion = app.get('cohortSession').openOccasions[0]
    expect(occasion).toBeDefined()
    expect(occasion.devices).toHaveLength(1)

    setTimeout( () => {
      console.log('simulating a nonresponsive client')
      client._receiver._events.ping = () => { 
        console.log('client got ping but is pretending to be dead')
      }

      setTimeout( () => {
        expect(webSocketServer.clients.size).toEqual(0)
        let occasion = app.get('cohortSession').openOccasions[0]
        expect(occasion).toBeDefined()
        expect(occasion.devices).toHaveLength(0)
        done()
      }, keepaliveIntervalDuration * 2.4)

    }, keepaliveIntervalDuration * 1.2)
  })
})




//   test('admin device gets broadcasts when device state changes', async (done) => {
//     const eventId = 3
//     const adminGUID = "54321" // this is seeded as an admin device
//     const device1GUID = "1234567"

//     const webSocketServer = require('./cohort-websockets')({
//       app: app, server: server, path: '/sockets'
//     })
//     expect(webSocketServer).toBeDefined()

//     const adminClient = new ws(socketURL)
//     var device1Client

//     adminClient.addEventListener('open', event => {
//       let messagesReceived = 0
//       adminClient.addEventListener('message', message => {
//         const msg = JSON.parse(message.data)
//         messagesReceived++

//         if(messagesReceived == 1){        // handshake was successful
//           expect(msg.response).toEqual('success')

//           // connect the first device
//           device1Client = new ws(socketURL)
//           device1Client.addEventListener('open', event => {
//             device1Client.send(JSON.stringify({ guid: device1GUID, eventId: eventId}))
//           })

//         } else if(messagesReceived == 2){ // first device state broadcast
//           expect(msg.status).toHaveLength(3)
//           expect(msg.status
//             .find( deviceState => deviceState.guid == device1GUID)
//             .socketOpen
//           ).toEqual(false)

//         } else if(messagesReceived == 3){ // second device state broadcast 
//           expect(msg.status).toHaveLength(3)
//           expect(msg.status
//             .find( deviceState => deviceState.guid == device1GUID)
//             .socketOpen
//           ).toEqual(true)
//           device1Client.close()

//         } else if(messagesReceived == 4){ // last device state broadcast 
//           expect(msg.status).toHaveLength(3)
//           expect(msg.status
//             .find( deviceState => deviceState.guid == device1GUID)
//             .socketOpen
//           ).toEqual(false)
//           done()
//         } 
//       })

//       adminClient.send(JSON.stringify({ guid: adminGUID, eventId: eventId }))
//     })
//   })

