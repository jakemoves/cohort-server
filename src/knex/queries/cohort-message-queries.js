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
  addOne: addOne
}