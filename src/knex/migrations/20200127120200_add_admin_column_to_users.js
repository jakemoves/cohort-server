
exports.up = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.bool('is_admin').notNullable().defaultTo(false)
  })
}

exports.down = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.dropColumn('is_admin')
  })
}
