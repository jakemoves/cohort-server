// Update with your config settings.

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host : 'localhost',
      user : 'cohort_admin',
      password : 'changethislater',
      database : 'cohort',
      charset: 'utf8'
    },
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    }
  },
  test: {
    client: 'pg',
    connection: {
      host : 'localhost',
      user : 'cohort_admin',
      password : 'changethislater',
      database : 'cohort_test',
      charset: 'utf8'
    },
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    }
  },
  production: {
    client: 'pg',
    connection: {
      host : 'process.env.DATABASE_URL',
      user : 'cohort_admin',
      password : 'changethislater',
      database : 'cohort',
      charset: 'utf8'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    }
  }

  // staging: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },

  // production: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // }

}
