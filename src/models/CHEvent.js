const machina = require('machina')

CHEvent = function(id, label, devices = []){

  return new machina.Fsm({
    _id: id,
    _label: label,
    devices: devices,

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
    }
  })
}

module.exports = CHEvent