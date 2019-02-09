
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('occasions', (table) => {
      table.increments('id').primary().notNullable()
      table.integer('event_id')
        .unsigned()
      table.foreign('event_id')
        .references('id').inTable('events')
        .onDelete('CASCADE')
      table.timestamp('startDateTime')
      table.timestamp('doorsOpenDateTime')
      table.timestamp('endDateTime')
      table.string('locationLabel')
      table.string('locationAddress')
      table.string('locationCity')
      table.timestamps()
    })
  ])
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('occasions')
};
