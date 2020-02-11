
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    table.integer('owner_id')
      .references('id').inTable('users')
      .notNullable()
      .onDelete('CASCADE')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    table.dropColumn('owner_id')
  })
}
