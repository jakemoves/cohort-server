
exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('events', (table) => {
      table.increments('id').primary().notNullable()
      table.string('label').notNullable()
      table.timestamps(false, true)
    })
  ])
}

exports.down = function(knex) {
  return knex.schema.dropTable('events')
}
