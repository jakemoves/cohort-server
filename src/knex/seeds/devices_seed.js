
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('devices').del()
    .then( () => {
      // Inserts seed entries
      return knex('devices').insert({
        guid: 1234567,
        apnsDeviceToken: 'dkjsfalkj3400fds',
        isAdmin: false
      });
    }).then( () => {
      return knex('devices').insert({
        guid: 1250453409,
        apnsDeviceToken: 'lkafdoeo9304fkdlf',
        isAdmin: false
      });
    })
};
