const bookshelf = require('../cohort-bookshelf')

const CHDevice_db = bookshelf.Model.extend({
  tableName: 'devices',
  hasTimestamps: true,

})

module.exports = bookshelf.model('CHDevice', CHDevice_db)