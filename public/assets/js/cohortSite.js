
document.getElementById("contact-form").addEventListener("submit", async () => {
  event.preventDefault();
  const email = document.getElementById('form_email').value;
  const message = document.getElementById('form_message').value;
  const name = document.getElementById('form_name').value;
  const payload = {email: email, message: message, name: name};

  let response = await fetch("/api/v2/contact-form", { 
    method: 'POST',
    headers: { 'Content-Type':  'application/json' },
    body: JSON.stringify(payload) 
  })
  if(response.status == 200){
    //happy path
    document.getElementById('contactFormSendSuccess').style.display = "block";
  } else {
    //error, usually a 500 error
    const errorMessage = await response.text();
    document.getElementById('contactFormSendFailure').innerHTML= `<p> Sorry, message failed to send to cohortrocks at gmail.com: ${errorMessage} with code ${response.status}.</p>`;
    document.getElementById('contactFormSendFailure').style.display = "block";
  }
  //console.log(response);


})



