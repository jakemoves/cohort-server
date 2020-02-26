<script>
import Button from './Button.svelte';
import { createEventDispatcher } from 'svelte';
import { serverURL } from "./ServerURLstore.js";
import { getEventsAndStore } from './EventsStore.js';
import { focusedEvent } from './UpdateUIstore.js';
import ErrorMessage from './ErrorMessages.js';

let newOccasionLabel;
let showError = false;
let errorResults;
const dispatch = createEventDispatcher();


function sendOccasionCreationFormState(){
  dispatch('message', {
    "occasionCreationFormIsOpen": false
  });
}

function createOccasion() {
  
  if(newOccasionLabel == undefined){
    showError = true;
    errorResults = ErrorMessage.formEmptyNameField;

  } else if (newOccasionLabel.length == 0){
    showError = true;
    errorResults = ErrorMessage.formEmptyNameField;
    
  } else {
    
    try {
        fetch(serverURL + "/occasions/", {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ "label": newOccasionLabel,
                                  "eventId": focusedEvent.id }) 
        }).then( response => { 
          if(response.status == 201){
            response.json().then( details => {
              
              // make sure store updates from server
              getEventsAndStore();
              sendOccasionCreationFormState();
              showError = false;
            })
          } else {
            response.text().then( errorMessage => {
              console.log(`Occasion creation error: ${errorMessage}`)
              showError = true;
              errorResults = errorMessage;
            })
          }
        }).catch( error => {
          console.log("Error on occasion creation")
        })
      } catch (e) {
        console.log(e.message)
    }
  }

}

function cancel(){
  sendOccasionCreationFormState();
}

</script>

<form>
  <div class="form-group">
    <label for="occasionLabel">Occasion Name</label>
    <input class="form-control" id="occasionLabel" aria-describedby="occasionCreation" placeholder="Enter occasion name." bind:value = {newOccasionLabel}>
  </div>

  <Button on:click={createOccasion}
    buttonText = "Create Occasion"
    buttonStyle = "btn-outline-success btn-block"/>
  
  <Button on:click={cancel}
    buttonText = "Cancel"
    buttonStyle = "btn-outline-secondary btn-block"/>
  
  {#if showError}
    <div class="alert alert-danger text-center">
        {errorResults}
    </div>
  {/if}
 
</form>
