<!--
  Copyright Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE) 
-->

<script>
  import { onMount } from 'svelte';
  import Button from './Button.svelte'
  import { urlStore } from './ServerURLstore.js';

  let serverURL
  let registrationSuccessful = false
  let registeredUsername
  
  let usernameFieldValue, passwordFieldValue, confirmPasswordFieldValue
  let errorAlertMessage = ""

  onMount( () => {
    urlStore.subscribe( value => serverURL = value)
  })
  
  async function register(){
    if(passwordFieldValue != confirmPasswordFieldValue){
      throw new Error("Password and confirmation do not match")
    }

    const payload = { username: usernameFieldValue, password: passwordFieldValue }

    let response = await fetch(serverURL + '/users', {
      method: 'POST',
      headers: { 'Content-Type':  'application/json' },
      body: JSON.stringify(payload) 
    })

    if(response.status != 201){
      let errorMessage = await response.text()
      throw new Error(errorMessage)
    } else {
      let userdata = await response.json()
      console.log(userdata)
      return userdata.username
    }
  }

  function onRegisterButton(event){
    event.preventDefault()

    register()
    .then( (username) => {
      registeredUsername = username
      errorAlertMessage = ""
      registrationSuccessful = true
      // if some parent code needs to know when the registration was successful, dispatch an event per https://svelte.dev/tutorial/component-events
    })
    .catch( error => {
      console.log(error)
      errorAlertMessage = error
      // based on the error, tell the user what went wrong
      // common errors:
      // Password and confirmation do not match
      // Username already exists
    })
  }
</script>

<div class="container">
  {#if !registrationSuccessful}
    <div class="row">
      <div class= "col-md-12 text-center mt-4 mb-2">
        <h5>Register</h5>
      </div>
    </div>

    <form id="registrationForm">
      <div class="form-group">
        <label for="registration_username">New Username</label> 
        <input type="text" id="registration_username" name="registration_username" class="form-control" placeholder="Enter desired username" bind:value={usernameFieldValue}>
      </div>
      <div class="form-group">
        <label for="registration_password">New Password</label> 
        <input type="password" id="registration_password" name="registration_username"class="form-control" placeholder="Enter new password" bind:value={passwordFieldValue}>
      </div>
      <div class="form-group">
        <label for="registration_confirm_password">Confirm Password</label> 
        <input type="password" id="registration_confirm_password" name="registration_username"class="form-control" placeholder="Confirm new password" bind:value={confirmPasswordFieldValue}>
      </div>
      <div class="form-row">
        <Button on:click={onRegisterButton}
          buttonType = "submit"
          buttonStyle = "btn-outline-primary btn-block"
          gridStyle = "form-group col-xs-12 col-sm-6"
          buttonText = "Register"/>
      </div>
      {#if errorAlertMessage != ""}
        <div class="alert alert-danger col-12" role="alert">
          {errorAlertMessage}
        </div>
      {/if}
    </form>
  {:else}
    <div class="row">
      <div class="alert alert-success col-12" role="alert">
        Registration successful! You can now log in as '{registeredUsername}'.
      </div>
    </div>
  {/if}
</div>

