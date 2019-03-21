
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('events_devices', table => {
    table.integer('occasion_id')
      .references('occasions.id')
      .onDelete('CASCADE')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('events_devices', table => {
    return table.dropColumn('occasion_id')
  })
}