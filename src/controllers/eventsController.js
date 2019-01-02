const queries = require('../knex/queries/queries')

exports.events = (req, res) => {
  queries.getAllEvents()
  .then( events => {
    res.status(200).json(events)
  })
}