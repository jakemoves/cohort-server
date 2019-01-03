
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('events', (table) => {
      table.increments('id').primary().notNullable()
      table.string('label').notNullable()
      table.timestamps()
    })
  ])
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('events')
}
