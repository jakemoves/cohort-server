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

            let useSecureCookie 
            switch(process.env.NODE_ENV){
              case "development":
                useSecureCookie = false
                break
              case "test":
                useSecureCookie = false
                break
              case "staging":
                useSecureCookie = true
                break
              case "production":
                useSecureCookie = true
                break
              default:
                useSecureCookie = true
            }
            
            res.cookie('jwt', token, {
              secure: useSecureCookie,
              httpOnly: true
            })
            res.send()
            console.log('user "' + user.username + '" logged in')
          })
          .catch(error => {
            handleError(500, error, res) // DB error
          })
      })
    }
  })(req, res, next)
}

exports.delete_user = async (req, res) => {
  if(req.user.id != req.params.id && req.user.is_admin == false){
    handleError(401, new Error("A user can only be deleted by themselves or by an admin"), res)
    return
  }
  
  if(req.user.id == req.params.id || req.user.is_admin){

    const userToDelete = await usersTable.findOneByID(req.params.id)
    if(userToDelete == null){
      handleError(404, new Error("User with id:" + req.params.id + " not found"), res)
      return
    }

    usersTable.deleteOne(req.params.id)
    .then(deletedIDs => {
      if(deletedIDs.length == 1 && deletedIDs[0] == req.params.id) {
        console.log('deleted user with id:' + req.params.id)
        res.sendStatus(204)
      } else {
        handleError(404, "Error: more than one user was deleted?!", res)
      }
    })
    .catch( error => {
      handleError(500, error, res)
    }) 
  }
}