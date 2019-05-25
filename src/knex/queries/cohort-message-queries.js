const knex = require('../knex.js')

CohortMessages = () => {
  return knex('cohort_messages_n10n')
}

// queries
getLatestByEvent = (eventId) => {
  return CohortMessages()
  .where('event_id', parseInt(eventId))
  .orderBy('created_at', 'desc')
  .then(messages => {
    if(messages.length > 0){ 
      return messages[0]
    } else {
      return undefined
    }
  })
}

getLatestByEventForTag = (eventId, tag) => {
  return CohortMessages()
  .where('event_id', parseInt(eventId))
  .orderBy('created_at', 'desc')
  .then(messages => {
    if(messages.length == 0){
      return undefined
    }
    for(i = 0; i < messages.length; i++){
      const msg = messages[i].message
      if(msg.targetTags.includes(tag) || msg.targetTags.includes("all")){
        return messages[i]
      }
    }
    return undefined
  })
}

addOne = (cohortMessage, eventId) => {
  let wrappedMsg = {
    event_id: eventId,
    message: JSON.stringify(cohortMessage)
  }
  return CohortMessages()
    .insert(wrappedMsg)
    .returning('id')
}

module.exports = {
  getLatestByEvent: getLatestByEvent,
  getLatestByEventForTag: getLatestByEventForTag,
  addOne: addOne
}