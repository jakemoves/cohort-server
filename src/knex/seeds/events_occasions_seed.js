exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  // see https://github.com/tgriesser/knex/issues/1506 for why it's done this way instead of something easy like .del() or .truncate()
  return knex.raw('TRUNCATE TABLE events RESTART IDENTITY CASCADE')
  .then(function () {
    // Inserts events entries
    return knex('events').insert([
      {label: 'pimohtēwak'},
      {label: 'lot_x'},
      {label: 'midway'},
      {label: 'fluxdelux'},
      {label: 'café sarajevo'}
    ])
    .then( () => {
      // add occasions to events
      return knex.raw('TRUNCATE TABLE occasions RESTART IDENTITY CASCADE').then( () => {
        return knex('occasions').insert([
          { 
            event_id: 4,
            label: 'Show 1',
            state: 'closed',
            doorsOpenDateTime: '2019-04-01 13:30:00+05:00',
            startDateTime: '2019-04-01 14:00:00+05:00',
            endDateTime: '2019-04-01 15:30:00+05:00',
            locationLabel: "Jacob's house",
            locationAddress: '125 Emerson Ave',
            locationCity: 'Toronto'
          },{
            // overnight occasion
            event_id: 4,
            label: 'Show 2',
            state: 'closed',
            doorsOpenDateTime: '2019-05-31 09:30:00+05:00',
            startDateTime: '2019-05-31 11:00:00+05:00',
            endDateTime: '2019-06-01 17:00:00+05:00',
            locationLabel: "Studio 5B, National Ballet School",
            locationAddress: '400 Jarvis St',
            locationCity: 'Toronto'
          },{ 
            event_id: 2,
            label: 'Rehearsal',
            state: 'opened',
            doorsOpenDateTime: '2019-06-01 13:30:00+05:00',
            startDateTime: '2019-06-01 14:00:00+05:00',
            endDateTime: '2019-06-01 15:30:00+05:00',
            locationLabel: "Harbourfront Centre",
            locationAddress: '235 Queens Quay W',
            locationCity: 'Toronto'
          },{ 
            event_id: 2,
            label: 'Show 1',
            state: 'closed',
            doorsOpenDateTime: '2019-06-02 13:30:00+05:00',
            startDateTime: '2019-06-02 14:00:00+05:00',
            endDateTime: '2019-06-02 15:30:00+05:00',
            locationLabel: "Harbourfront Centre",
            locationAddress: '235 Queens Quay W',
            locationCity: 'Toronto'
          },{ 
            event_id: 2,
            label: 'Show 2',
            state: 'closed',
            doorsOpenDateTime: '2019-06-03 13:30:00+05:00',
            startDateTime: '2019-06-03 14:00:00+05:00',
            endDateTime: '2019-06-03 15:30:00+05:00',
            locationLabel: "Harbourfront Centre",
            locationAddress: '235 Queens Quay W',
            locationCity: 'Toronto'
          },
        ])
      });
    })
  })
};
