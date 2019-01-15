const machina = require('machina')

CHEvent = function(){
  return new machina.Fsm({
    _label: "",

    initialize: function(options) {
    },

    namespace: 'cohort-event',

    initialState: 'uninitialized',

    states: {
      uninitialized: {
        "*": function() {
          this.deferUntilTransition()
          this.transition('closed')
        }
      },
      closed: {
        _onEnter: function(){
          console.log('event is now closed')
        },
        changeLabel: function(newLabel) {
          console.log('changeLabel(' + newLabel + ')')
          this._label = newLabel
        },
        openEvent: "open"
      },
      open: {
        _onEnter: function(){
          console.log('event is now open')
        },
        closeEvent: "closed"
      }
    },

    changeLabel: function(newLabel){
      console.log('here in handler')
      console.log(this)
      this.handle('changeLabel', newLabel)
    }
  })
}

module.exports = CHEvent