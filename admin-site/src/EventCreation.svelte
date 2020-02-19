<script>
import Button from './Button.svelte';
import { createEventDispatcher } from 'svelte';
import { serverURL } from "./ServerURLstore.js";
import { getEventsAndStore } from './EventsStore.js';


let newEventLabel;
const dispatch = createEventDispatcher();

function sendEventCreationFormState(){
  dispatch('message', {
    "openEventCreation": false
  });
}

function createEvent() {
  try {
      fetch(serverURL + "/events", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ "label": newEventLabel }) 
      }).then( response => {
      console.log(response.status); 
        if(response.status == 201){
          response.json().then( details => {
            
            // make sure store updates from server
            getEventsAndStore();
            sendEventCreationFormState();
          })
        } else {
          response.text().then( errorMessage => {
            console.log('Event creation error: ' + errorMessage)
          })
        }
      }).catch( error => {
        console.log("Error on event creation")
      })
    } catch (e) {
      console.log(e.message)
    }

}

</script>

<form>
  <div class="form-group">
    <label for="eventLabel">Event Label/Name</label>
    <input class="form-control" id="eventLabel" aria-describedby="eventLabelCreation" placeholder="Enter event label." bind:value = {newEventLabel}>
  </div>

  <Button on:click={createEvent}
    buttonText = "Create event"
    buttonStyle = "btn-outline-success btn-block"/>
 
</form>
