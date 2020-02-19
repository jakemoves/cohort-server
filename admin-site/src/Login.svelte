<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->

<!-- Login component with a simple password verification -->

 <script>
  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  import { urlStore, serverURL } from './ServerURLstore.js';
  import { pageStateInStore } from './PageStore.js';
  import { getEventsAndStore } from './EventsStore.js';

   
  let selectedURL;

  let usernameFieldValue, passwordFieldValue
  let errorAlertMessage = ""  
   
      
  async function login(){
    const payload = { username: usernameFieldValue, password: passwordFieldValue }

    let response = await fetch(serverURL + '/login', {
      method: 'POST',
      headers: { 'Content-Type':  'application/json' },
      body: JSON.stringify(payload) 
    })

    if(response.status != 200){
      let errorMessage = await response.text()
      throw new Error(errorMessage)
    }
  }

  function onLoginButton(event){
    event.preventDefault()

    login()
    .then( () => {
      // happy path!
      // a cookie named 'jwt' should now be present in this browser
      errorAlertMessage = ""
      getEventsAndStore();
      pageStateInStore.set(1);
    })
    .catch( error => {
      console.log(error)
      errorAlertMessage = error
      // based on the error, tell the user what went wrong
      // common errors:
      // "missing credentials" (no username and/or no password was entered)
      // "username not found"
      // "incorrect password"
    })
  }

  
</script> 


<div id="login">
  <div class="container">

    <div class="row"> 
      <div class= "col-md-12 text-center mt-4 mb-2">  
        <h4>Login to Cohort</h4>
      </div>
    </div>

    <form id="loginFormContent">
      <div class="form-group">
          <label for="login_username">Username</label>
          <input type="text" id="login_username" class="form-control" name="loginFormContent" placeholder="Enter your username" bind:value={usernameFieldValue}> 
      </div>

      <div class="form-group">
        <label for="login_password">Password</label> 
        <input type="password" id="login_password" class="form-control" name="loginFormContent" placeholder="Enter your password" bind:value={passwordFieldValue}>     
      </div>

      <div class="form-row">
        <Button on:click={onLoginButton}
          buttonType = "submit"
          buttonStyle = "btn-primary btn-block"
          gridStyle = "form-group col-xs-12 col-sm-6"
          buttonText = "Login"/>
      </div>

      {#if errorAlertMessage != ""}
        <div class="alert alert-danger col-12" role="alert">
          {errorAlertMessage}
        </div>
      {/if}
    </form>

    

  </div>
</div>



