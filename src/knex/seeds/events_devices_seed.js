
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  // see https://github.com/tgriesser/knex/issues/1506 for why it's done this way instead of something easy like .del() or .truncate()
  return knex.raw('TRUNCATE TABLE devices RESTART IDENTITY CASCADE').then( () => {
    // Inserts devices entries
    return knex('devices').insert([
      {
        guid: "1234567",
        apnsDeviceToken: 'dkjsfalkj3400fds',
        isAdmin: false
      },{
        guid: "1250453409",
        apnsDeviceToken: 'lkafdoeo9304fkdlf',
        isAdmin: false
      },{
        guid: "54321",
        apnsDeviceToken: 'kdjfa3r343',
        isAdmin: true
      },{
        guid: "sifubar",
        apnsDeviceToken: 'fdlakr3rf43f',
        isAdmin: false
      }
    ]).then( () => {
      // Deletes ALL existing entries
      return knex.raw('TRUNCATE TABLE events RESTART IDENTITY CASCADE')
      .then(function () {
        // Inserts events entries
        return knex('events').insert([
          {label: 'pimohtēwak', state: 'closed'},
          {label: 'lot_x', state: 'closed'},
          {label: 'midway', state: 'open' },
          {label: 'fluxdelux', state: 'open' },
          {label: 'café sarajevo', state: 'closed'}
        ])
        .then( () => {
          // add occasions to events
          return knex.raw('TRUNCATE TABLE occasions RESTART IDENTITY CASCADE').then( () => {
            return knex('occasions').insert([
              { 
                event_id: 4,
                doorsOpenDateTime: '2019-04-01 13:30:00+05:00',
                startDateTime: '2019-04-01 14:00:00+05:00',
                endDateTime: '2019-04-01 15:30:00+05:00',
                locationLabel: "Jacob's house",
                locationAddress: '125 Emerson Ave',
                locationCity: 'Toronto'
              },{
                // overnight occasion
                event_id: 4,
                doorsOpenDateTime: '2019-05-31 09:30:00+05:00',
                startDateTime: '2019-05-31 11:00:00+05:00',
                endDateTime: '2019-06-01 17:00:00+05:00',
                locationLabel: "Studio 5B, National Ballet School",
                locationAddress: '400 Jarvis St',
                locationCity: 'Toronto'
              },{ 
                // for lot_x 
                event_id: 2,
                doorsOpenDateTime: '2019-06-01 13:30:00+05:00',
                startDateTime: '2019-06-01 14:00:00+05:00',
                endDateTime: '2019-06-01 15:30:00+05:00',
                locationLabel: "Harbourfront Centre",
                locationAddress: '235 Queens Quay W',
                locationCity: 'Toronto'
              },,{ 
                event_id: 2,
                doorsOpenDateTime: '2019-06-02 13:30:00+05:00',
                startDateTime: '2019-06-02 14:00:00+05:00',
                endDateTime: '2019-06-02 15:30:00+05:00',
                locationLabel: "Harbourfront Centre",
                locationAddress: '235 Queens Quay W',
                locationCity: 'Toronto'
              },,{ 
                event_id: 2,
                doorsOpenDateTime: '2019-06-03 13:30:00+05:00',
                startDateTime: '2019-06-03 14:00:00+05:00',
                endDateTime: '2019-06-03 15:30:00+05:00',
                locationLabel: "Harbourfront Centre",
                locationAddress: '235 Queens Quay W',
                locationCity: 'Toronto'
              },
            ])
            .then( () => {
              return knex.raw('TRUNCATE TABLE events_devices RESTART IDENTITY CASCADE').then( () => {
                // add events/devices relations
                return knex('events_devices').insert([
                  { event_id: 2, device_id: 1 },
                  { event_id: 3, device_id: 3 },
                  { event_id: 3, device_id: 2 },
                  { event_id: 3, device_id: 1 },
                  { event_id: 4, device_id: 3 },
                  { event_id: 4, device_id: 2, occasion_id: 1 }
                ])
              })
            })
          });
        });
      })
    })
  })
};