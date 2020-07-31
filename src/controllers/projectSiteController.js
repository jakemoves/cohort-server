
const mailerService = require('../services/mailerService')

exports.submit_contact_form = async (req, res) => {
  console.log(req.body)
  const messageText = `New contact request from Cohort project site
      name: ${req.body.name}, email: ${req.body.email}, message: ${req.body.message}`
  let result
  try{
    result = await mailerService.sendMail(messageText, "New contact request for Cohort.", ["luckyjakemoves@gmail.com", "cohortrocks@gmail.com"])
  } 
  catch(error){
    //*create error message
    console.log(error)
    res.sendStatus(500)
    return
  }
  
  console.log(result)
  res.sendStatus(200)
  
}