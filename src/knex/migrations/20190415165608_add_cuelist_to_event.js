
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    // table.json('cuelist')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    return true
    // return table.dropColumn('cuelist')
  })
};