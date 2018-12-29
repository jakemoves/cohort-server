const bookshelf = require('./bookshelf')

const CHDevice_db = bookshelf.Model.extend({
  tableName: 'devices',
  hasTimestamps: true,

})

module.exports = CHDevice_db