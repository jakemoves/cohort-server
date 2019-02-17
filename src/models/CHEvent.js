const machina = require('machina')
const fs = require('fs')
const path = require('path')
const CHDevice = require('./CHDevice')

class CHEvent extends machina.Fsm {
  id
  label
  devices
  
  constructor(id, label){
    // constructor options for FSM
    super({
      namespace: 'cohort-event',
      initialState: 'uninitialized',
      states: {
        uninitialized: {
          openEvent: "open"
        },
        open: {
          _onEnter: function(){
            console.log('event ' + this.label + ' is now open')
          },
          closeEvent: "closed"
        },
        closed: {
          _onEnter: function(){
            console.log('event ' + this.label + ' is now closed')
          }, 
          openEvent: "open"
        }
      },

      // handlers
      open: function(){
        this.handle('openEvent')
      },

      close: function() {
        // once we're listening for device events, this should get refactored as a new state (openWithConnectedDevices)

        // we have to manually count websocket connections as they're closed
        let connectedDevices = this.devices.filter( device => device.socket != null )
        
        if(connectedDevices === undefined || 
           connectedDevices.length == 0){

          this.handle('closeEvent')

        } else {
          const expectedClosedSockets = connectedDevices.length
          let closedSockets = 0

          connectedDevices.forEach( device => {
            device.socket.on('close', socket => {
              closedSockets++
              if(closedSockets == expectedClosedSockets){
                this.handle('closeEvent')
              }
            })
            device.socket.close(1000, 'cohort event ' + this.label + ' is closing')
          })
        }
      }
    })

    // CHEvent-specific constructor
    this.id = id
    this.label = label
    this.cuesheet = null
    this.devices = []
  }

  static fromDatabaseRow(dbEvent){
    let event = new CHEvent(dbEvent.id, dbEvent.label)
    
    // add devices
    if(dbEvent.devices != null &&
       dbEvent.devices !== undefined &&
       dbEvent.devices.length > 0){
      
      dbEvent.devices.map( dbDevice => {
        const cohortDevice = CHDevice.fromDatabaseRow(dbDevice)
        event.checkInDevice(cohortDevice)
      })
    } 

    // add cuesheet if it exists
    let cuesheet = null
    try {
      const cuesheetPath = path.join(__dirname, '../../event-assets/cuesheets')
      cuesheet = fs.readFileSync(cuesheetPath + '/' + event.label + '-' + event.id + '.json')
    } catch (error){
      // console.log(error)
    }

    if(cuesheet){
      let parsedCuesheet = null
      try {
        parsedCuesheet = JSON.parse(cuesheet)
      } catch (error) {
        console.log(error)
      }

      if(parsedCuesheet){
        // console.log(parsedCuesheet)
        event.cuesheet = parsedCuesheet
      }
    }

    return event
  }

  checkInDevice(device){
    // make sure the device is not already checked in on this event
    if(this.devices.find( existingDevice => {
      return existingDevice.guid === device.guid
    }) === undefined){
      this.devices.push(device)
      this.emit('deviceCheckedIn', device)
      this.broadcastDeviceStates() // eventually this should get triggered by a deviceStatesDidChange event bubbled up from CHDevice... I think?
    }  else {
      return new Error("Error: device guid:" + device.guid + " is already checked in to event " + this.label)
    }
  }

  broadcastDeviceStates(){
    let connectedAdminDevices = this.devices.filter( device => {
      return (device.isAdmin && device.socket != null && device.socket.readyState == 1)
    })

    if(connectedAdminDevices.length == 0) {
      return
    }

    const deviceStates = this.devices.map( device => {
      return device.deviceState()
    })

    connectedAdminDevices.forEach( adminDevice => {
      adminDevice.socket.send(JSON.stringify({ eventId: this.id, status: deviceStates }))
    })
  }
}

module.exports = CHEvent