<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->

<!-- form component for creating new events -->
<script>
import Button from './Button.svelte';
import { createEventDispatcher } from 'svelte';
import { serverURL } from "./ServerURLstore.js";
import { getEventsAndStore } from './EventsStore.js';
import ErrorMessage from './ErrorMessages.js';

let newEventLabel;
let showError = false;
let errorResults;
const dispatch = createEventDispatcher();


function sendEventCreationFormState(){
  dispatch('message', {
    "openEventCreation": false
  });
}

function createEvent() {
  event.preventDefault();
  if(newEventLabel == undefined){
    showError = true;
    errorResults = ErrorMessage.formEmptyNameField;

  } else if (newEventLabel.length == 0){
    showError = true;
    errorResults = ErrorMessage.formEmptyNameField;

  } else {
    try {
        fetch(serverURL + "/events", {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ "label": newEventLabel }) 
        }).then( response => { 
          if(response.status == 201){
            response.json().then( details => {
              
              // make sure store updates from server
              getEventsAndStore();
              sendEventCreationFormState();
              showError = false;
            })
          } else {
            response.text().then( errorMessage => {
              console.log(`Event creation error: ${errorMessage}`)
              showError = true;
              errorResults = errorMessage;
            })
          }
        }).catch( error => {
          console.log("Error on event creation")
        })
      } catch (e) {
        console.log(e.message)
    }
  }

}

function cancel(){
  sendEventCreationFormState();
}

</script>

<form>
  <div class="form-group">
    <label for="eventLabel">Event Name</label>
    <input class="form-control" id="eventLabel" aria-describedby="eventLabelCreation" placeholder="i.e. the title of your project" bind:value = {newEventLabel}>
  </div>

  <Button on:click={createEvent}
    buttonType = "submit"
    buttonText = "Create Event"
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
