// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const machina = require('machina')
// occasions are modeled as a finite state machine

class CHOccasion extends machina.Fsm {
  id
  label
  owner_id
  startDateTime
  doorsOpenDateTime
  endDateTime
  locationLabel
  locationAddress
  locationCity
  devices

  constructor(id, label, owner_id){
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
          addDevice: function(device){

            device.on('socketClosed', () => {
              let deviceIndex = this.devices.findIndex(
                matchingDevice => device.guid == matchingDevice.guid
              )

              if(deviceIndex !== undefined){
                this.devices.splice(deviceIndex, 1)
                console.log("" + this.devices.length + " devices connected to occasion:" + this.id)
              } else {
                throw new Error('Device with closed socket not found in occasion.devices')
              }
            })
            this.devices.push(device)
          },
          deviceStates: function(){
            return this.devices
          },
          closeOccasion: 'closed'
        },
        closed: {
          _onEnter: function(){
            this.devices.forEach(device => {
              device.socket.close(1001, 'Cohort occasion is closing')
            })
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
    this.owner_id = owner_id
    this.devices = []
  }

  static fromDatabaseRow(dbOccasion){
    return new CHOccasion(dbOccasion.id, dbOccasion.label, dbOccasion.owner_id)
  }

  addDevice(device){
    this.handle('addDevice', device)
    console.log("" + this.devices.length + " devices connected to occasion:" + this.id)
  }

  deviceStates(){
    const devices = this.handle('deviceStates')
    console.log(devices)
    const deviceStates = devices.map( device => {
      return {
        connected: device.socket.isAlive,
        guid: device.guid
      }
    })
    console.log(deviceStates)
    return deviceStates
  }
}


module.exports = CHOccasion