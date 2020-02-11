// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const request = require('supertest')
require('dotenv').config({ path: __dirname + '/../.env' })

const cohortCredentials = {
  'test_admin_user': process.env.TEST_ADMIN_USER_PASSWORD,
  'test_user_1': process.env.TEST_USER_1_PASSWORD,
  'test_user_2': process.env.TEST_USER_2_PASSWORD
}

async function login(username, app, requestToken = true){
  let agent = request.agent(app)
  
  let queryString = ""
  if(requestToken){
    queryString = "?sendToken=true"
  }

  let loginResponse = await agent
  .post('/api/v2/login' + queryString)
  .send({
    username: username,
    password: cohortCredentials[username]
  })

  let jwtToken = loginResponse.body.jwt

  if(!requestToken){
    return agent 
    // this agent object is used when testing cookie-based authentication (i.e. admin site)
    // agent.get('/some/secured/endpoint') will automatically send the cookie with a request
  } else {
    return jwtToken 
    // used for token-based authentication (i.e. third parties making API calls)
    // request(app).get('/some/secured/endpoint').set('Authorization', 'JWT ' + jwtToken) 
  }
}

module.exports = {
  login: login
}