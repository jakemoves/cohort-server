// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const knex = require('../knex.js')

ClientActivities = () => {
  return knex('client_activities')
}

// queries

addOne = (occasionID, episodeID, activityName) => {
  return ClientActivities()
    .insert({occasion_id: occasionID, episode_id: episodeID, activityName: activityName})
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