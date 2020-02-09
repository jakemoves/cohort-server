<!-- Login component with a simple password verification -->

 <script>
  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  import { urlStore } from './ServerURLstore.js';
  import { pageStateInStore } from './PageStore.js';
  import { getEventsAndStore } from './EventsStore.js';

  let serverURL;
  let selectedURL;

  let usernameFieldValue, passwordFieldValue
  let errorAlertMessage = ""

 //everytime serverURL changes, update it in the store.
  $: serverURL,urlStore.update(value => value = serverURL) ; 
// add this to the above line to keep track of serverUrl value in store: , urlStore.subscribe(value => {console.log(value)}) 
  onMount(async () => {
    serverURL;
    //checking for local dev ...needs testing on staging site
    checkLocalUrl();
    
  });

  function checkLocalUrl () {
    let page = window.location.href;
    let splitURL = page.split('/');
    let splitLocal = splitURL[2].split(":")
    if(splitLocal[0] == "localhost"){
      serverURL = "http://localhost:3000/api/v2";
    }
  };
  
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

  function hideShowDev() {
    let devTools = document.getElementById('devTools');

    if(devTools.style.visibility == "visible"){
      devTools.style.visibility = "hidden";
    } else {
      devTools.style.visibility = "visible"
    }

    
  }
  
</script> 
<style>
  #devTools{
    visibility: hidden;
  }
  
  /* .form-control{
    font-size:0.8rem;
  } */
</style>


<div id="login">
  <div class="container">

    <div class="row"> 
      <div class= "col-md-12 text-center mt-4 mb-2">  
        <h4>Login to Cohort</h4>
      </div>
    </div>

    <form id="loginFormContent">
      <div class="form-group">
          <input type="text" id="login_username" class="form-control" name="loginFormContent" placeholder="username" bind:value={usernameFieldValue}> 
      </div>

      <div class="form-group"> 
        <input type="password" id="login_password" class="form-control" name="loginFormContent" placeholder="password" bind:value={passwordFieldValue}>     
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

    <form id="devToolsFormContent">
      <div class="form-group mt-5">
        <Button on:click={hideShowDev}
        buttonStyle = "btn-light btn-outline-dark btn-sm mt-4"
        gridStyle = ""
        buttonText = "Show/Hide Developer Tools"/>
       </div>    
     
      <div class="form-group" id = "devTools">
        <label for="urlSelect">Select Cohort server to connect to</label>
        <select bind:value={serverURL} size= "1" class="form-control" id="urlSelect" name="selector">
          <option value="https://staging.cohort.rocks/api/v2">Staging</option>
          <option value="http://localhost:3000/api/v2">Development (localhost)</option>
        </select>
      </div>
    </form>
  </div>
</div>



