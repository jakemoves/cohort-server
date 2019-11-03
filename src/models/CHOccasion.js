// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const machina = require('machina')

class CHOccasion extends machina.Fsm {
  id
  label
  startDateTime
  doorsOpenDateTime
  endDateTime
  locationLabel
  locationAddress
  locationCity
  // devices

  constructor(id, label){
    // constructor options for FSM
    super({
      namespace: 'cohort-occasion',
      initialState: 'uninitialized',
      states: {
        uninitialized: {
          openOccasion: 'opened'
        },
        opened: {
          _onEnter: function(){
            console.log('occasion ' + this.label + ' (id:' + this.id + ') is now open')
          },
          closeOccasion: 'closed'
        },
        closed: {
          _onEnter: function(){
            console.log('occasion ' + this.label + ' (id:' + this.id + ') is now closed')
          }, 
          openEvent: 'opened'
        }
      },

      // handlers
      open: function(){
        this.handle('openOccasion')
      },
      close: function() {
        // once we're listening for device events, should this get refactored as a new state (openWithConnectedDevices)?
        
        //socket logic goes here
        this.handle('closeOccasion')
      }
    })

    // constructor actions for CHOccasion
    this.id = id
    this.label = label
  }

  static fromDatabaseRow(dbOccasion){
    return new CHOccasion(dbOccasion.id, dbOccasion.label)
  }
}


module.exports = CHOccasion