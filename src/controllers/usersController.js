// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

// uses passport's custom callback option to provide details on failed auth attempts
// per https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436

const passport = require('passport')
const jwt = require('jsonwebtoken')
const usersTable = require('../knex/queries/user-queries')

handleError = (httpStatusCode, error, res) => {
  console.log(error)

  if(error.message !== undefined){
    error = error.message
  }

  res.status(httpStatusCode)
  res.write(error)
  res.send()
}

exports.register_user = async (req, res, next) => {
  passport.authenticate('register', (err, user, authError) => {
    if(err){
      console.log(err)
      handleError(500, err, res)
      return
    } 
    if( authError !== undefined){
      handleError(403, authError, res)
    } else {
      req.logIn(user, error => {
        const username = user.username
        usersTable.findOneByUsername(username)
          .then(user => {
            // can store other data fields for user in database here
            console.log('user created with id:' + user.id)
            res.status(201)
            res.location('/api/v2/users/' + user.id)
            delete user.password
            res.json(user)
          })
          .catch(error => {
            handleError(500, error, res) // DB error
          })
      })
    }
  })(req, res, next)
}

exports.login_user = async (req, res, next) => {
  passport.authenticate('login', (err, user, authError) => {
    if(err){
      console.log(err)
      handleError(500, err, res)
      return
    }
    
    if(authError !== undefined){
      if(authError.message == 'Username not found'){
        handleError(404, authError, res)
        return
      } else {
        handleError(403, authError, res)
        return
      }
    } else {
      req.logIn(user, err => {
        const username = user.username
        usersTable.findOneByUsername(username)
          .then(user => {
            const token = jwt.sign({
              id: user.username
            }, process.env.JWT_SECRET)
            res.status(200)
            res.send({
              // auth: true,
              token: token
              //, message: 'User found and logged in'
            })
            console.log('user "' + user.username + '" logged in')
          })
          .catch(error => {
            handleError(500, error, res) // DB error
          })
      })
    }
  })(req, res, next)
}