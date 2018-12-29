
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('devices', (table) => {
      table.increments()
      table.string('guid').notNullable()
      table.string('apnsDeviceToken')
      table.boolean('isAdmin')
    })
  ])
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('devices')
};
