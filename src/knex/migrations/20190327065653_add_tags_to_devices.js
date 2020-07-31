
exports.up = function(knex) {
  return knex.schema.alterTable('devices', table => {
    table.json('tags')
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('devices', table => {
    return table.dropColumn('tags')
  })
};
