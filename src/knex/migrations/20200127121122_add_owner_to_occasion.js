
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('occasions', table => {
    table.integer('owner_id').references('id').inTable('users')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('occasions', table => {
    table.dropColumn('owner_id')
  })
}
