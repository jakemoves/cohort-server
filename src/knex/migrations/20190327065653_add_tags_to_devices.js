
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('devices', table => {
    table.json('tags')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('devices', table => {
    return table.dropColumn('tags')
  })
};
