<script>
  import Button from './Button.svelte';
  import { urlStore } from './ServerURLstore.js';

  let serverURL;

  //everytime serverURL changes, update it in the store.
  $: serverURL,urlStore.update(value => value = serverURL);

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
</style>

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