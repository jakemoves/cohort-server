// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const knex = require('../knex.js')

Users = () => {
  return knex('users')
}

// queries
findOneByUsername = async (username) => {
  let user = await Users().select()
  if(user.length == 0){
    return null
  } else {
    return user[0]
  }
}

create = async (username, hashedPassword) => {
  return Users().insert({username: username, password: hashedPassword})
}

module.exports = { 
  findOneByUsername: findOneByUsername,
  create: create
}