
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('events_devices', table => {
    table.integer('occasion_id')
      .references('occasions.id')
      .onDelete('CASCADE')
    table.dropUnique(['event_id', 'device_id'])
    // table.unique(['event_id', 'device_id', 'occasion_id'])
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('events_devices', table => {
    // table.dropUnique(['event_id', 'device_id', 'occasion_id'])
    table.dropColumn('occasion_id')
    table.unique(['event_id', 'device_id'])
  })
}