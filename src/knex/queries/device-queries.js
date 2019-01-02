const knex = require('../knex.js')

Devices = () => {
  return knex('devices')
}

// queries

getAll = () => {
  return Devices().select()
}

getOneByID = (deviceId) => {
  return Devices().where('id', parseInt(deviceId)).first()
}

getOneByDeviceGUID = (deviceGUID) => {
  return Devices().where('guid', deviceGUID).first()
}

addOne = (device) => {
  return Devices()
    .insert(device)
    .returning('id')
}

deleteOne = (device) => {
  return Devices().where('id', parseInt(deviceId)).del()
}

module.exports = { 
  getAll: getAll,
  getOneByID: getOneByID,
  getOneByDeviceGUID: getOneByDeviceGUID,
  addOne: addOne,
  deleteOne: deleteOne
}