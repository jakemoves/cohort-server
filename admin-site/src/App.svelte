<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->

<script>
  import Page from './ParentPage.svelte';
  import Login from './Login.svelte';
  import Button from './Button.svelte';
  import Occasion from './Occasion.svelte';
  import { pageStateInStore } from "./PageStore.js";
  import List from './ArrayList.svelte';
  //import events from store
  import { events, storedEvents } from './EventsStore.js';

    //for new event creation parameters if we implment it
  // let label = "";

  let focusedOccasionID;
  let focusedEvent;
  let focusedOccasion;
  let dateSortedOccasions =[];
  let isOccasionOpen;
  
  let indexInOccasions;

  let sliderCue;
  let broadcastStatus = "unsent";
  // let broadcastResults;

  
  let pageState;
  //grab pageState from store
  pageStateInStore.subscribe(value => {
    pageState = value;
  })

  //grab info from events + occasions
  function messageFromArrayList(value){
    focusedEvent = value.detail.focusedEvent;
    dateSortedOccasions = value.detail.dateSortedOccasions;
    sliderCue = value.detail.sliderCue;
    focusedOccasion = value.detail.sliderCue;
  }

  function messageFromArrayListOccasions(value){
    focusedOccasionID = value.detail.focusedOccasionID;
    focusedOccasion = value.detail.focusedOccasion;
    indexInOccasions = value.detail.indexInOccasions;
    isOccasionOpen = value.detail.isOccasionOpen;

  }
  
  function broadcastStatusFromBackButton(value){
    broadcastStatus = value.detail.broadcastStatus;
  }
  /////for new event generation if we implemet it///
  // function setTitle(event) {
  //   label = event.target.value;
  // }
  //whichever parameters we want to be able to build for new events from the site would go below
  // function createEvent() {
  //   let newEvent = [
  //     {
  //       label: label
  //     }
  //   ];
  //   events = events.concat(newEvent);
  // }

</script>

{#if pageState == 0}
  <Login/>

{:else if pageState == 1}
  <Page
    pageID="eventsList"
    headingText="Events">
<!-- #eventsList allows a list of events to be built and shown based on "events" from store-->
    <List on:message = {messageFromArrayList}
    arrayName = {events}
    emptyArrayMessage = "That's uneventful. Sorry, no events have been added yet."
    />
  </Page>

{:else if pageState == 2}
<!-- //occasions list populated by looping through events of "focused" event ID -->
  <Page on:message={broadcastStatusFromBackButton}
    pageID = "occasionList" 
    headingText="Occasions"
    includeBackButton = true>

    <List on:message = {messageFromArrayListOccasions}
    arrayName = {dateSortedOccasions}
    listType = "Occasions"
    emptyArrayMessage = "This happens on occasion. No occasions for this event yet."
    />
    
  </Page>
{:else if pageState == 3}
  
  <Occasion
    focusedEvent = {focusedEvent}
    focusedOccasion = {focusedOccasion}
    focusedOccasionID  = {focusedOccasionID}
    indexInOccasions = {indexInOccasions}
    sliderCue = {sliderCue}
    broadcastStatus ={broadcastStatus}/>

{/if}



