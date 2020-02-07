<!-- Login component with a simple password verification -->

 <script>
  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  import { urlStore } from './ServerURLstore.js';
  import { pageStateInStore } from './PageStore.js';

  let serverURL;
  let selectedURL;

 //everytime serverURL changes, update it in the store.
  $: serverURL,urlStore.update(value => value = serverURL); 
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
    console.log(splitLocal)
    if(splitLocal[0].match(/local/) != null ){
        serverURL = "http://" + splitLocal[0] + ":3000/api/v2";
        document.getElementById("password").value = "5555";
      // if(splitLocal[0].match(/localhost/) != null){
      // } else if(splitLocal[0].match(/.local/)){
      //   serverURL = "http://" + spli""
      // }
    }
    console.log(serverURL)
  };
  
  function verifyPassword(){
    // verifying password logic 
    var passwordCheck = document.getElementById('password').value;
    if (passwordCheck == "5555"){
      pageStateInStore.set(1);
    }
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
  .form-control{
    font-size:0.8rem;
  }
</style>


<div id="login">
  <div class="container">
    <form id="formContent">

      <div class="row"> 
        <div class= "col-md-12 text-center mt-4 mb-2">  
          <h4>Welcome Administrator</h4>
        </div>
      </div>

      <div class="form-group">
          <input type="text" id="login" class="form-control" name="login" placeholder="username"> 
      </div>

      <div class="form-group"> 
        <input type="text" id="password" class="form-control" name="login" placeholder="password">     
      </div>

      <Button on:click={verifyPassword}
        buttonStyle = "btn-primary"
        gridStyle = ""
        buttonText = "Login"/>

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



