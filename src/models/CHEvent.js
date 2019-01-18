const machina = require('machina')

CHEvent = function(id, label, devices = []){

  let eventFSM = new machina.Fsm({
    _id: id,
    _label: label,
    devices: devices, // do not add / remove objects to this array directly

    initialize: function(options) {
    },

    namespace: 'cohort-event',

    initialState: 'uninitialized',

    states: {
      uninitialized: {
        openEvent: "open"
      },
      open: {
        _onEnter: function(){
          console.log('event ' + this._label + ' is now open')
        },
        closeEvent: "closed"
      },
      closed: {
        _onEnter: function(){
          let i = 0;
          this.devices.forEach( device => {
            if(device.socket != null && device.socket !== undefined){
              device.socket.close(4002, "Event is closing")
              i++
            }
          })
          console.log('closed websocket connections to ' + i + ' clients')
          console.log('event ' + this._label + ' is now closed')
        },
        // changeLabel: function(newLabel) {
        //   console.log('changeLabel(' + newLabel + ')')
        //   this.label = newLabel
        // },
        openEvent: "open"
      }
    },

    // changeLabel: function(newLabel){
    //   this.handle('changeLabel', newLabel)
    // }
    open: function(){
      this.handle('openEvent')
    },

    close: function() {
      this.handle('closeEvent')
    },

    checkInDevice: function(device){
      // make sure the device is not already checked in on this event
      if(this.devices.find( existingDevice => existingDevice._id === device._id) === undefined){
        this.devices.push(device)
        this.emit('deviceCheckedIn', device)
        this.broadcastDeviceStates() // eventually this should get triggered by a deviceStatesDidChange event bubbled up from CHDevice... I think?
      } 
    },

    broadcastDeviceStates: function(){

      const connectedAdminDevices = this.devices.filter( device => {
        return (device.isAdmin && device.socket != null && device.socket !== undefined && device.socket.readyState == 1)
      })

      const deviceStates = this.devices.map( device => {
        let deviceState = { 
          guid: device.guid
        }
        
        if(device.socket != null && device.socket !== undefined){
          deviceState.webSocketState = device.socket.readyState
        } else {
          deviceState.webSocketState = null
        }
        
        return deviceState
      })

      connectedAdminDevices.forEach( device => {
        device.socket.send(JSON.stringify({ status: deviceStates }))
      })
    }
  })

  devices.forEach( device => {
    eventFSM.checkInDevice(device)
  })

  return eventFSM
}

module.exports = CHEvent