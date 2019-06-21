const nodemailer = require('nodemailer')

var transporter = "test" 

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
      console.log(error)
    } else {
      console.log('   mailer service started')
    }
  })
}

exports.sendMail = function(text, subject, recipient){
  console.log('sendMail()')
  return transporter.sendMail({
    from: '"Cohort" <cohortrocks@gmail.com>',
    to: recipient,
    subject: subject,
    text: text
  })
}