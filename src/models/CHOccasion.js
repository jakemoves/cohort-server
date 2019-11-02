// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

class CHOccasion {
  id
  label
  state
  startDateTime
  doorsOpenDateTime
  endDateTime
  locationLabel
  locationAddress
  locationCity
  devices
  cues

  constructor(id, label){
    this.id = id
    this.label = label
    this.state = 'uninitialized'
  }
}


module.exports = CHOccasion