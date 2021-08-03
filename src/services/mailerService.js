// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const nodemailer = require('nodemailer')

var transporter = "test"
var connectedToMailServer = false;

exports.initService = async function(){
  transporter = await nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'cohortrocks@gmail.com',
      pass: 'yjztneomtitdynai'
    }
  })

  transporter.verify( (error, success) => {
    if(error){
      // no internet connection?
      if((error.errno == "ECONNREFUSED" || error.errno == 'ETIMEDOUT') &&
        (error.code == 'EDNS' || error.code == 'ESOCKET') &&
        error.command == 'CONN'){

        console.log("   warning: cannot connect to mail server, emails may not send successfully")
      } else {
        console.log(error)
      }
    } else {
      connectedToMailServer = true
      console.log('   mailer service started')
    }
  })
}

exports.sendMail = function(text, subject, recipients){
  if(!connectedToMailServer){
    return new Error("Mailer service is not available")
  } else {
    return transporter.sendMail({
      from: '"Cohort" <cohortrocks@gmail.com>',
      to: recipients,
      subject: subject,
      text: text
    })
  }
}