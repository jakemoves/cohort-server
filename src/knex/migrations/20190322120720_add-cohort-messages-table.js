// NB the cohort_messages_n10n table only stores messages sent with notifications. NOT websocket messages
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('cohort_messages_n10n', (table) => {
      table.increments('id').primary().notNullable()
      table.integer('event_id')
        .references('events.id')
        .onDelete('CASCADE')
      table.json('message')
      table.timestamps(false, true)
    })
  ])
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('cohort_messages_n10n')
};
