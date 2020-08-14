// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const knex = require('../knex.js')

Users = () => {
  return knex('users')
}

// queries
findOneByUsername = async (username) => {
  let users = await Users().where('username', username)
  if(users.length == 0){
    return null
  } else {
    return users[0]
  }
}

findOneByID = async (id) => {
  let users = await Users().where('id', parseInt(id))
  if(users.length == 0){
    return null
  } else {
    return users[0]
  }
}

create = async (username, hashedPassword) => {
  return Users()
  .insert({
    username: username, 
    password: hashedPassword
  })
  .returning('username')
  .then(usernames => {
    if(usernames.length == 1){
      return findOneByUsername(usernames[0])
    } else {
      return new Error('Insert query failed')
    }
  })
}

deleteOne = (userId) => {
  return Users()
  .where('id', parseInt(userId))
  .del()
  .returning('id')
}

module.exports = { 
  findOneByUsername: findOneByUsername,
  findOneByID: findOneByID,
  create: create,
  deleteOne: deleteOne
}