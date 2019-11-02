
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('occasions', table => {
    table.string('state').notNullable()
    table.string('label').notNullable()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('occasions', table => {
    table.dropColumn('state')
    table.dropColumn('label')
  })
};
