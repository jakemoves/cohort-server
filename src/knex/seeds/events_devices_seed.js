
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('devices').del()
    .then( () => {
      // Inserts seed entries
      return knex('devices').insert({
        id: 1,
        guid: 1234567,
        apnsDeviceToken: 'dkjsfalkj3400fds',
        isAdmin: false
      });
    }).then( () => {
      return knex('devices').insert({
        id: 2,
        guid: 1250453409,
        apnsDeviceToken: 'lkafdoeo9304fkdlf',
        isAdmin: false
      });
    }).then( () => {
      return knex('devices').insert({
        id: 3,
        guid: 54321,
        apnsDeviceToken: 'kdjfa3r343',
        isAdmin: false
      });
    }).then( () => {
      // Deletes ALL existing entries
      return knex('events').del()
      .then(function () {
        // Inserts seed entries
        return knex('events').insert([
          {id: 1, label: 'pimohtēwak', state: 'closed'},
          {id: 2, label: 'lot_x', state: 'closed'},
          {id: 3, label: 'midway', state: 'open' },
          {id: 4, label: 'fluxdelux', state: 'open' }
        ]).then(function() {
          return knex('events_devices').del()
            .then(function () {
            // Inserts seed entries
            return knex('events_devices').insert([
              { event_id: 3, device_id: 3 },
              { event_id: 3, device_id: 2 },
              { event_id: 4, device_id: 3 }
            ]);
          });
        });
      });
    })
};
