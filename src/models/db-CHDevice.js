const bookshelf = require('./bookshelf')

const CHDevice_db = bookshelf.Model.extend({
  tableName: 'devices',
  hasTimestamps: true,

})

module.exports = bookshelf.Model('CHDevice', CHDevice_db)