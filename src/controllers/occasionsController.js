const occasionsTable = require('../knex/queries/occasion-queries')

exports.occasions = ( req, res ) => {
  console.log('1')
  // verify event exists!
  let eventId = req.params.id

  occasionsTable.getAllForEvent(eventId)
  .then( occasions => {
    console.log(occasions)
    res.status(200).json(occasions)
  })
  .catch( error => {
    console.log(error)
  })
}

exports.occasions_create = (req, res) => {
  // validate request
  // must have valid event
  // create occasion object?
  // verify date & time formatting
  // add occasion
}