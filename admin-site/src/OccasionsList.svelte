<script>
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import Array from './ArrayList.svelte';
  import Button from './Button.svelte';
  import Modal from './Modal.svelte';
  import { focusedEventStore, pageStateInStore, indexInEvents } from './PageStore.js';
  import { storedEvents, getEventsAndStore} from './EventsStore.js';
  import { occasionOpen } from './OccasionState.js';
  import { serverURL } from './ServerURLstore.js';
  import moment from "moment";

  export let focusedEventLabel;
  let dateSortedOccasions = [];
  const dispatch = createEventDispatcher();
  let focusedOccasionID;
  let indexInOccasions;
  let focusedOccasion;
  let focusedOccasionState;
  let focusedEvent;

 

  
  focusedEventStore.subscribe(value => {
    focusedEvent = value;
    if(focusedEvent != undefined){
      let occasionArray = focusedEvent.occasions;
      let sortDates = (a, b) => moment(a.startDateTime).format('YYYYMMDD') -moment(b.startDateTime).format('YYYYMMDD');
      dateSortedOccasions = occasionArray.sort(sortDates);
    }
  });

  

   function sendOccasionsPackage(){
    dispatch('message', {
      "focusedOccasion": focusedOccasion,
      "focusedOccasionID": focusedOccasionID,
      "indexInOccasions":indexInOccasions,
    });
  }

  function occasionButton(id) {
    focusedOccasionID = id;
    indexInOccasions = focusedEvent.occasions.findIndex(x => x.id == focusedOccasionID);

    focusedOccasion = focusedEvent.occasions[indexInOccasions];
    
    pageStateInStore.set(3);

    storedEvents.subscribe(value => {
      if(focusedEvent != undefined){
        if (value[indexInEvents].occasions[indexInOccasions] != undefined){
          focusedOccasionState = value[indexInEvents].occasions[indexInOccasions].state
        }
      }
    });
    
    if (focusedOccasionState == "closed"){
      occasionOpen.set(false);
    } else{
      occasionOpen.set(true);
    }  

    sendOccasionsPackage();
  }

  function deleteEvent(){
    try {
    return fetch(serverURL + "/events/" + focusedEvent.id, {
      method: 'DELETE'
    }).then( response => {
      console.log(response.status); 
      if(response.status == 204){
          console.log("fired");

           getEventsAndStore()
           pageStateInStore.set(1)
          
          
          
      } else {
        console.log(response.text)
        }
      }).catch( error => {
        console.log("Error on event delete!")
      })
    } catch (e) {
        console.log(e.message)
    }
  }


</script>

    <Array
      arrayName = {dateSortedOccasions} 
      emptyArrayMessage = "This happens on occasion. No occasions for this event yet.">

      {#each  dateSortedOccasions as item (item.id)}
        <Button on:click={() => occasionButton(item.id)}
        buttonHtml = '<h3 class="m-0">{item.label}  - {item.label} </h3> <h5>{item.locationCity} - {moment(item.startDateTime).format("LL")} - id:{item.id}</h5>'
        value = {item.id}/> 
      {/each}
     
    </Array>

    <hr>
    <Button
                buttonStyle="btn-outline-danger btn-block"
                buttonText="Delete Event"
                dataTarget="#deleteEventModal"/>

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
      buttonText="Delete This Event"/>
  </div>
</Modal>
          

 