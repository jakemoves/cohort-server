// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const request = require('supertest')
require('dotenv').config({ path: __dirname + '/../.env' })

var app

setupHelpers = appInstance => {
  app = appInstance
}

cohortLogin = async (username, password) => {
  const payload = { username: username, password: password }

  const res = await request(app)
  .post('/api/v2/login')
  .send(payload)

  if(res.status != 200 || res.body.token === undefined){
    return new Error('login failed: ' + res.text)
  }

  return res.body.token
}

loginAsTestAdminUser = async () => {
  return cohortLogin('test_admin_user', process.env.TEST_ADMIN_USER_PASSWORD)
}

loginAsTestUser1 = async () => {
  return cohortLogin('test_user_1', process.env.TEST_USER_1_PASSWORD)
}

loginAsTestUser2 = async () => {
  return cohortLogin('test_user_2', process.env.TEST_USER_2_PASSWORD)
}

module.exports = {
  setupHelpers: setupHelpers,
  cohortLogin: cohortLogin,
  loginAsTestAdminUser: loginAsTestAdminUser,
  loginAsTestUser1: loginAsTestUser1,
  loginAsTestUser2: loginAsTestUser2
}