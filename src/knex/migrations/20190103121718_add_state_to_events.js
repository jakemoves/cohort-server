
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    table.string('state').notNullable()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    table.dropColumn('state')
  })
};
