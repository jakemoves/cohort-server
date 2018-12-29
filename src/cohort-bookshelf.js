const dbConfig = {
  client: 'postgresql',
  connection: '127.0.0.1', 
  user: 'cohort-admin',
  password: 'changethislater',
  database: 'cohort',
  charset: 'utf8'
}

const knex = require('knex')(dbConfig)

const bookshelf = require('bookshelf')(knex)

bookshelf.plugin('registry')

module.exports = bookshelf