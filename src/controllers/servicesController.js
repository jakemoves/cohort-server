const mailerService = require('../services/mailerService')

exports.send_email = async (req, res) => {
  if(req.body.emailBody && req.body.emailSubject && req.body.emailRecipient){
    let results = await mailerService.sendMail(req.body.emailBody, req.body.emailSubject, req.body.emailRecipient)
    console.log(results)
    if(results.rejected.length > 0){
      res.status(500)
      res.json(results)
    }
    res.sendStatus(200)
  } else {
    res.status(400)
    res.write('Error: request must include the fields emailBody, emailSubject, and emailRecipient')
    res.send()
  }
}