
exports.up = function(knex) {
  return knex.schema.alterTable('events', table => {
    var defaultEpisodes = JSON.stringify([]);
    
    table.json('episodes').notNullable().defaultTo(defaultEpisodes)
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('events', table => {
    table.dropColumn('episodes')
  })
};