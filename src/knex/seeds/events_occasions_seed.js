exports.seed = function(knex, Promise) {
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
          "cueAction": 0,
          "targetTags": ["all"]          
        },{ 
          "mediaDomain": 0,
          "cueNumber": 1,
          "cueAction": 0,
          "targetTags": ["all"]          
        },{ 
          "mediaDomain": 1,
          "cueNumber": 1,
          "cueAction": 0,
          "targetTags": ["all"]          
        },{ 
          "mediaDomain": 2,
          "cueNumber": 1,
          "cueAction": 0,
          "targetTags": ["all"]          
        },{ 
          "mediaDomain": 4,
          "cueNumber": 1,
          "cueAction": 0,
          "targetTags": ["all"]          
        }]
      } else {
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
      {label: 'The Itinerary', episodes: defaultEpisodeAsJSON('The Itinerary', false)}
    ])
    .then( () => {
      // add occasions to events
      return knex.raw('TRUNCATE TABLE occasions RESTART IDENTITY CASCADE').then( () => {
        return knex('occasions').insert([
          { 
            event_id: 1,
            label: 'Workshop / Development',
            state: 'open',
            doorsOpenDateTime: '2019-04-01 13:30:00+05:00',
            startDateTime: '2019-04-01 14:00:00+05:00',
            endDateTime: '2019-04-01 15:30:00+05:00',
            locationLabel: "n/a",
            locationAddress: 'n/a',
            locationCity: 'n/a'
          }
        ])
      });
    })
  })
};
