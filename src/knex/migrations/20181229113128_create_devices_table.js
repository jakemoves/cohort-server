
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('devices', (table) => {
      table.increments('id').primary().notNullable()
      table.string('guid').notNullable()
      table.string('apnsDeviceToken')
      table.boolean('isAdmin').notNullable()
      table.timestamps(false, true)
    })
  ])
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('devices')
};
