
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    table.boolean('isOpen').notNullable()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    table.dropColumn('isOpen')
  })
};
