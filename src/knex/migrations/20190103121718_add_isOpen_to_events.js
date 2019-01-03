
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    table.boolean('is_open').notNullable()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    table.dropColumn('is_open')
  })
};
