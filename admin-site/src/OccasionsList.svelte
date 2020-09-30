<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->
<!-- Creating list of occasions based on chosen event -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import Array from './ArrayList.svelte';
  import Button from './Button.svelte';
  import Modal from './Modal.svelte';
  import { focusedEventStore, pageStateInStore, focusedOccasionStore, focusedOccasionIDStore } from './UpdateUIstore.js';
  import { storedEvents, getEventsAndStore} from './EventsStore.js';
  import { serverURL } from './ServerURLstore.js';
  import moment from "moment";

  
  let dateSortedOccasions = [];
  const dispatchOccasionState = createEventDispatcher();
  let focusedOccasionID;
  let indexInOccasions;
  let focusedOccasion;
  let focusedOccasionState;
  let focusedEvent;

  let deleteResults;
  let showDeleteError = false;
  let openOccasionCreation = false;

  
  focusedEventStore.subscribe(value => {
    focusedEvent = value;
    if(focusedEvent != undefined){
      let occasionArray = focusedEvent.occasions;
      let sortDates = (a, b) => moment(a.startDateTime).format('YYYYMMDD') -moment(b.startDateTime).format('YYYYMMDD');
      dateSortedOccasions = occasionArray.sort(sortDates);
    }
  });

  function sendOccasionState(){
    dispatchOccasionState('state',{
      "occasionCreationFormIsOpen": true
    })
  }

  function occasionButton(e) {
    focusedOccasionID = e.currentTarget.value;
    //grab id of occasion clicked and send to store
    focusedOccasionIDStore.set(focusedOccasionID);
    let indexInOccasions = focusedEvent.occasions.findIndex(x => x.id == focusedOccasionID);
    //update focusedOccasion accordingly
    focusedOccasion = focusedEvent.occasions[indexInOccasions];
    focusedOccasionStore.set(focusedOccasion);
    
    pageStateInStore.set(3);
  }

  function deleteEvent(){
    try {
    return fetch(serverURL + "/events/" + focusedEvent.id, {
      method: 'DELETE'
    }).then( async (response) => { 
      if(response.status == 204){
           getEventsAndStore()
           pageStateInStore.set(1)
           showDeleteError = false;  
      } else if (response.status == 400){
        showDeleteError = true;
        let serverSideError = await response.text()
        deleteResults = serverSideError;
      } else response.text().then( errorMessage => {
        showDeleteError = true;
        console.log('error on request: ' + errorMessage)
        deleteResults = errorMessage;
      });
      }).catch( error => {
        console.log("Error on event delete!")
        showDeleteError = true;
        deleteResults = "Deleting the event failed due to " + error;
      })
    } catch (e) {
        console.log(e.message)
    }
  }

   function openForm(){
    sendOccasionState(); 
  }

</script>

<style>
  h4 { text-align: center }
</style>

<h4>Occasions</h4> 
<p>In Cohort terms, an Occasion is a specific instance of an Event, analogous to an individual performance. You need at least one Occasion for an Event, but you can create more.</p>
<Array
  arrayName = {dateSortedOccasions} 
  emptyArrayMessage = "No occasions for this event yet.">

  {#each  dateSortedOccasions as item (item.id)}
    {#if item.locationCity == null}
      <Button on:click={occasionButton}
        buttonHtml = '<h3 class="m-0">{item.label}</h3> <h5> Occasion id: {item.id}</h5>'
        value = {item.id}/>
    {:else}
      <Button on:click={occasionButton}
        buttonHtml = '<h3 class="m-0">{item.label}</h3> <h5>{item.locationCity} - {moment(item.startDateTime).format("LL")} - Occasion id: {item.id}</h5>'
        value = {item.id}/> 
    {/if} 
  {/each}
  
</Array>
<!-- Block button, more consistent with other button UI -->
<Button on:click={openForm}
    buttonText = "Create a new occasion"
    buttonStyle = "btn-outline-success btn-block"/>

    <!-- Inline with other list items version -->
  <!-- <Button on:click={openForm}
    buttonHtml = '<h3 class="m-0">Occasion Creation Form</h3> <h5> </h5>'
    buttonStyle = "btn-outline-success btn-block"/> -->

<hr>

<Button
  buttonStyle="btn-outline-danger btn-block"
  buttonText="Delete {focusedEvent.label}"
  dataTarget="#deleteEventModal"/>
{#if showDeleteError}
<div class="alert alert-danger text-center">
    {deleteResults}
</div>
{/if}



<Modal
  modalID = "deleteEventModal"
  modalTitle= "Delete Event">

  <div slot="modalBody">
    <!-- {#if gotEvents} -->
      Are you sure you want to delete {focusedEvent.label}?
    <!-- {/if} -->
  </div>

  <div class="row" slot="modalFooter">
    <Button
      gridStyle = "mr-1"
      buttonStyle="btn-outline-secondary"
      dataDismiss ="modal"
      buttonText = "Cancel"/>

    <Button on:click={deleteEvent}
      gridStyle = "mr-1"
      buttonStyle="btn-outline-danger"
      dataDismiss="modal"
      buttonText="Delete this event"/>
  </div>
</Modal>
          

 