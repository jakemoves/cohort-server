
exports.up = function(knex) {
  // this will be used to store aggregate metrics for episodes, WITHOUT storing any client identifiers or personal / device-specific information. Example: user starts an episode, then finishes the episode. Two records are created with the same occasion ID and activity names 'episodeStarted' and 'episodeFinished'

  // this table should not store data for more than ~24hrs. If an occasion remains open for longer than 24hrs, data should be transferred to a handler and cleared.
  return knex.schema.createTable('client_activities', table => {
    table.increments('id').primary().notNullable()
    table.integer('occasion_id')
      .references('occasions.id')
      .notNullable()
      .onDelete('CASCADE')
    table.integer('episode_id')
      .notNullable()
      // episodes are stored as JSON, so we can't key on the actual episode ID in SQL -- need to add a check when storing to verify if there's a matching episode and if not, ?
      // this is basically ephemeral data anyways so that seems alright
    table.string('activityName')
      .notNullable()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('client_activities')
};
