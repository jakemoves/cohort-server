
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    var defaultEpisodes = JSON.stringify([]);
    
    table.json('episodes').notNullable().defaultTo(defaultEpisodes)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('events', table => {
    table.dropColumn('episodes')
  })
};