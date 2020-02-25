<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->
<!-- Creating list of events -->
<script>
  import { createEventDispatcher } from 'svelte';
  import moment from 'moment';
  import Array from './ArrayList.svelte';
  import Button from './Button.svelte';
  import { storedEvents } from './EventsStore.js';
  import { pageStateInStore, focusedEventStore, indexInEventsStore, focusedEventLabelStore} from './UpdateUIstore.js';

  const dispatch = createEventDispatcher();
  
  let events;
  storedEvents.subscribe(value => {
    events = value;
  })

  function sendEventsPackage(){
    dispatch('message', {
      "openEventCreation": true
    });
  }

  function openForm(){
    sendEventsPackage();  
  }

  //when an event button gets clicked, it becomes the "focusedEvent"
  function eventButton(e){ 
    let focusedEventLabel = e.currentTarget.value;
    let indexInEvents = events.findIndex(event => event.label === focusedEventLabel);
    let focusedEvent = events[indexInEvents];
    
    //update stores
    pageStateInStore.set(2);
    focusedEventLabelStore.set(focusedEventLabel);
    focusedEventStore.set(focusedEvent);
    indexInEventsStore.set(indexInEvents);
    
  }

</script>

<style>
 .eventLabel {
  word-wrap:break-word;
 }
 h3 {
   font-size: 1.55rem;
 }
 
</style>

<Array
  arrayName = {events} 
  emptyArrayMessage = "This happens on occasion. No occasions for this event yet.">
    {#each events as item (item.id)}
      <div class="row mt-2">
        <div class="col-6 text-right eventLabel">
            <h3>{item.label}:</h3>
        </div>
        <Button on:click={eventButton}
          buttonHtml='<p class="mb-0">Occasions&nbsp;<span style="font-size: 1.1rem; vertical-align: middle" class="fas fa-angle-right" /></p>'
          value = {item.label}
          gridStyle ="col-6" />
      </div>
    {/each}
</Array>
<hr>
<Button on:click={openForm}
    buttonText = "Create a new event"
    buttonStyle = "btn-outline-success btn-block"/>