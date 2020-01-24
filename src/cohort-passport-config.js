// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const bcrypt = require('bcrypt')
const BCRYPT_SALT_ROUNDS = 12
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const usersTable = require('./knex/queries/user-queries')

// per https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436
passport.use('register', 
  new LocalStrategy (
    {
      usernameField: 'username',
      passwordField: 'password',
      session: false
    },
    (username, password, done) => {
      usersTable.findOneByUsername(username)
        .then( user => {
          if(user !== null){
            return done(null, false, new Error('Username already exists'))
          } else {
            bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
              .then( hashedPassword => {
                usersTable.create(username, hashedPassword)
                  .then( user => {
                    return done(null, user)
                  })
              })
          }
        })
        .catch( error => {
          done(error)
        })
    }
  )
)