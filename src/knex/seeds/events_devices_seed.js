
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE devices RESTART IDENTITY CASCADE').then( () => {
    // Inserts seed entries
    return knex('devices').insert([
      {
        guid: 1234567,
        apnsDeviceToken: 'dkjsfalkj3400fds',
        isAdmin: false
      },{
        guid: 1250453409,
        apnsDeviceToken: 'lkafdoeo9304fkdlf',
        isAdmin: false
      },{
        guid: 54321,
        apnsDeviceToken: 'kdjfa3r343',
        isAdmin: false
      }
    ]).then( () => {
      // Deletes ALL existing entries
      return knex.raw('TRUNCATE TABLE events RESTART IDENTITY CASCADE')
      .then(function () {
        // Inserts seed entries
        return knex('events').insert([
          {label: 'pimohtēwak', state: 'closed'},
          {label: 'lot_x', state: 'closed'},
          {label: 'midway', state: 'open' },
          {label: 'fluxdelux', state: 'open' }
        ]).then( () => {
          return knex.raw('TRUNCATE TABLE events_devices RESTART IDENTITY CASCADE').then( () => {
            return knex('events_devices').insert([
              { event_id: 3, device_id: 3 },
              { event_id: 3, device_id: 2 },
              { event_id: 4, device_id: 3 }
            ]);
          })
        })
      })
    })
  })
};