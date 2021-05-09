// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const knex = require('../knex.js')

ClientActivities = () => {
  return knex('client_activities')
}

// queries

addOne = (clientActivity) => {
  return ClientActivities()
    .insert(clientActivity)
    .returning('id')
    .then(clientActivityIDs => {
      if(clientActivityIDs.length == 1){
        return ClientActivities().where('id', parseInt(clientActivityIDs[0])).then( clientActivities => {
          return clientActivities[0]
        })
      } else {
        return null
      }
    })
}

module.exports = {
  addOne: addOne
}