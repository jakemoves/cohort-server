
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary().notNullable()
    table.unique('username')
    table.string('username')
    table.string('password')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('users')
};
