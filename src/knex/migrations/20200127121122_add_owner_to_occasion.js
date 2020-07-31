
exports.up = function(knex) {
  return knex.schema.alterTable('occasions', table => {
    table.integer('owner_id')
      .references('id').inTable('users')
      .notNullable()
      .onDelete('CASCADE')
  })
}

exports.down = function(knex) {
  return knex.schema.alterTable('occasions', table => {
    table.dropColumn('owner_id')
  })
}
