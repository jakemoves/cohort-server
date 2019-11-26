// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const request = require('supertest')
const uuid = require('uuid/v4')
const knex = require('./knex/knex')
const moment = require('moment')

// for websocket tests only
const ws = require('ws')

const CHSession = require('./models/CHSession')

var app, server, webSocketServer
var socketURL = 'http://localhost:3000/sockets'

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
		keepaliveIntervalDuration: 25000
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

  // test('initial handshake: error -- device already connected', (done) => {
  //   const occasionId = 3
  //   const guid = uuid()

  //   const wsClient = new ws(socketURL)

  //   wsClient.addEventListener('open', event => {
  //     wsClient.send(JSON.stringify({ guid: guid, occasionId: occasionId }))
  //   })

  //   wsClient.addEventListener('close', error => {
  //     expect(error.code).toEqual(4000)
  //     expect(error.reason).toEqual("Error: The device with guid:" + guid + " is already connected over WebSockets")
  //     done()
  //   })
  // })

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