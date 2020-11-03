require('dotenv').config({ path: __dirname + '/../../../.env' })

exports.seed = function(knex) {
  if(process.env.NODE_ENV == "production"){
    // DO NOT DO ANYTHING TO THE PRODUCTION DATABASE :)
    return;
  } else {
    // Deletes ALL existing entries
    // see https://github.com/tgriesser/knex/issues/1506 for why it's done this way instead of something easy like .del() or .truncate()
    return knex.raw('TRUNCATE TABLE events RESTART IDENTITY CASCADE')
    .then(function () {
      // Inserts events entries
      defaultEpisodeAsJSON = (eventLabel, defaultCues) => {
        let cues
        if(defaultCues){
          cues = [{ 
            "mediaDomain": 0,
            "cueNumber": 1,
            "cueAction": 0,
            "targetTags": ["all"]          
          },{ 
            "mediaDomain": 0,
            "cueNumber": 2,
            "cueAction": 3,
            "targetTags": ["all"]          
          },{ 
            "mediaDomain": 1,
            "cueNumber": 1,
            "cueAction": 0,
            "targetTags": ["all"]          
          },{ 
            "mediaDomain": 1,
            "cueNumber": 2,
            "cueAction": 1,
            "targetTags": ["all"]          
          },{ 
            "mediaDomain": 1,
            "cueNumber": 3,
            "cueAction": 3,
            "targetTags": ["all"]          
          },{ 
            "mediaDomain": 2,
            "cueNumber": 1,
            "cueAction": 0,
            "targetTags": ["all"]          
          },{ 
            "mediaDomain": 2,
            "cueNumber": 2,
            "cueAction": 3,
            "targetTags": ["all"]          
          }]
        }  else {
          cues = []
        }

        return JSON.stringify([defaultEpisode(eventLabel, cues)])
      }

      defaultEpisode = (label, cues) => {
        return {
          episodeNumber: 0,
          label: label,
          cues: cues
        }
      }

      return knex('events').insert([
        {label: 'pimohtēwak', owner_id: 3, episodes: defaultEpisodeAsJSON('pimohtēwak', false)},
        {label: 'demo event', owner_id: 3, episodes: defaultEpisodeAsJSON('demo event', "defaultCues")},
        {label: 'midway', owner_id: 3, episodes: defaultEpisodeAsJSON('midway', false)},
        {label: 'fluxdelux', owner_id: 3, episodes: defaultEpisodeAsJSON('fluxdelux', false)},
        {label: 'café sarajevo', owner_id: 3, episodes: defaultEpisodeAsJSON('café sarajevo', false)},
      ])
      .then( () => {
        // add occasions to events
        return knex.raw('TRUNCATE TABLE occasions RESTART IDENTITY CASCADE').then( () => {
          return knex('occasions').insert([
            { 
              event_id: 2,
              owner_id: 3,
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
              event_id: 2,
              owner_id: 3,
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
              owner_id: 3,
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
              owner_id: 3,
              label: 'Show 3',
              state: 'closed',
              doorsOpenDateTime: '2019-06-02 13:30:00+05:00',
              startDateTime: '2019-06-02 14:00:00+05:00',
              endDateTime: '2019-06-02 15:30:00+05:00',
              locationLabel: "Harbourfront Centre",
              locationAddress: '235 Queens Quay W',
              locationCity: 'Toronto'
            },{ 
              event_id: 2,
              owner_id: 3,
              label: 'Show 4',
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
  }
};
