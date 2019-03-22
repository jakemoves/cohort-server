const knex = require('../knex.js')

CohortMessages = () => {
  return knex('cohort_messages')
}

// queries
getLatestByEvent = (eventId) => {
  return CohortMessages().where('event_id', parseInt(eventId))
  .then(messages => {
    if(messages.length > 0){ 
      return messages[messages.length - 1]
    } else {
      return undefined
    }
  })
}

addOne = (cohortMessage, eventId) => {
  console.log('saving cohort message from n10n to db')
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