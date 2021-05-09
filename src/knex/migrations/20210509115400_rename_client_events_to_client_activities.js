// NEVER CALL ANYTHING AN EVENT (derp)

exports.up = function(knex) {
  return knex.schema.renameTable('client_events', 'client_activities')
    .then( () => { 
      return knex.schema.table('client_activities', table => {
        table.renameColumn('eventName', 'activityName')
      })
    })
};

exports.down = function(knex) {
  return knex.schema.renameTable('client_activities', 'client_events', table => {
    table.renameColumn('activityName', 'eventName')
  })
};
