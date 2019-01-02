
exports.up = function(knex, Promise) {
  return knex.schema.createTable('events_devices', table => {
    table.increments('id').primary()
    table.integer('event_id').references('events.id')
    table.integer('device_id').references('devices.id')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('events_devices')
}
