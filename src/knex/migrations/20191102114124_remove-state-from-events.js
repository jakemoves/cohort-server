
exports.up = function(knex) {
  return knex.schema.alterTable('events', table => {
    table.dropColumn('state')
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('events', table => {
    table.string('state').notNullable().defaultTo('closed')
  })
};