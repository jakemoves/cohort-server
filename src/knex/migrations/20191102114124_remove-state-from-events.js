
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    table.dropColumn('state')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    table.string('state').notNullable().defaultTo('closed')
  })
};