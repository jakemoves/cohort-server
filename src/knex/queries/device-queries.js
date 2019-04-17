const knex = require('../knex.js')

Devices = () => {
  return knex('devices')
}

// queries

getAll = () => {
  return Devices().select()
}

getOneByID = (deviceId) => {
  return Devices().where('id', parseInt(deviceId))
  .then( devices => {
    if(devices.length == 1){
      return devices[0]
    } else {
      throw new Error()
    }
  })
}

getOneByDeviceGUID = (deviceGUID) => {
  return Devices().where('guid', deviceGUID)
  .then( devices => {
    if(devices.length == 1){
      return devices[0]
    } else {
      console.log(devices.length + " devices found matching that GUID!")
      throw new Error("Error: no device found with guid:" + deviceGUID)
    }
  })
}

addOne = (device) => {
  return Devices()
    .insert(device)
    .returning('id')
}

deleteOne = (device) => {
  return Devices().where('id', parseInt(deviceId)).del()
}

addApnsDeviceToken = (deviceId, apnsDeviceToken) => {
  return Devices()
    .where('id', deviceId)
    .update({ apnsDeviceToken: apnsDeviceToken })
    .returning('id')
}

setTags = (deviceId, tags) => {
  return Devices()
    .where('id', deviceId)
    .update({ tags: JSON.stringify(tags)})
    .returning('id')
}

module.exports = { 
  getAll: getAll,
  getOneByID: getOneByID,
  getOneByDeviceGUID: getOneByDeviceGUID,
  addOne: addOne,
  deleteOne: deleteOne,
  addApnsDeviceToken: addApnsDeviceToken,
  setTags: setTags
}