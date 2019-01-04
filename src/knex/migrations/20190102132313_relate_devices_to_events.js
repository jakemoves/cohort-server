
exports.up = function(knex, Promise) {
  return knex.schema.createTable('events_devices', table => {
    table.increments('id').primary().notNullable()
    table.unique(['event_id', 'device_id'])
    table.integer('event_id')
      .references('events.id')
      .notNullable()
      .onDelete('CASCADE')
    table.integer('device_id')
      .references('devices.id')
      .notNullable()
      .onDelete('CASCADE')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('events_devices')
}
