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
  import OccasionsList from './OccasionsList.svelte';
  import EventsList from './EventsList.svelte';
  import RegistrationForm from './RegistrationForm.svelte'
  import DevTools from './DevTools.svelte';
  import EventCreation from './EventCreation.svelte';
  import OccasionCreation from './OccasionCreation.svelte';
  

    //for new event creation parameters if we implment it
  // let label = "";

  let focusedOccasionID;
  let focusedEvent;
  let focusedEventLabel;
  let focusedOccasion;
  let dateSortedOccasions =[];
  let isOccasionOpen;
  
  let indexInOccasions;

  let sliderCue;
  let broadcastStatus = "unsent";
  // let broadcastResults;

  let openEventCreation = false;
  let openOccasionCreation = false;
  let pageState;
  //grab pageState from store
  pageStateInStore.subscribe(value => {
    pageState = value;
  })

  //grab info from events + occasions
  function messageFromArrayList(value){
    focusedEventLabel = value.detail.focusedEventLabel;
    sliderCue = value.detail.sliderCue;
    
  }

  function messageFromArrayListOccasions(value){
    focusedOccasionID = value.detail.focusedOccasionID;
    focusedOccasion = value.detail.focusedOccasion;
    indexInOccasions = value.detail.indexInOccasions;
    isOccasionOpen = value.detail.isOccasionOpen;

  }

  function messageCloseEventForm(value){
    openEventCreation = value.detail.openEventCreation;
  }
  function messageOpenEventForm(value){
    openEventCreation = value.detail.openEventCreation;
  }
  function messageCloseOccasionForm(value){
    openOccasionCreation = value.detail.openOccasionCreation;
  }
  function messageOpenOccasionForm(value){
    openOccasionCreation = value.detail.openOccasionCreation;
    
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
<style>
  @media (min-width:641px)  {
    :global(body) {  
      width: 500px;  
      margin-left: auto;  
      margin-right: auto;  
      text-align: left; 
      }
  }
</style>

{#if pageState == 0}
  <Login/>
  <hr>
  <!-- <DevTools/> -->
  <RegistrationForm />

{:else if pageState == 1}
  <Page
    pageID="eventsList"
    headingText="Events">
    {#if !openEventCreation}
<!-- #eventsList allows a list of events to be built and shown based on "events" from store-->
      <EventsList on:message = {messageFromArrayList}
        on:state ={messageOpenEventForm}/>
    {:else}
      <EventCreation on:message = {messageCloseEventForm}/>

    {/if}
  </Page>

{:else if pageState == 2}
<!-- //occasions list populated by looping through events of "focused" event ID -->
  <Page on:message={broadcastStatusFromBackButton}
    pageID = "occasionList" 
    headingText="Occasions"
    includeBackButton = true>

    {#if !openOccasionCreation}
      <OccasionsList on:message = {messageFromArrayListOccasions}
        on:state={messageOpenOccasionForm}
        focusedEventLabel = {focusedEventLabel}/>
    {:else}
      <OccasionCreation on:message = {messageCloseOccasionForm} />
    {/if}
    
  </Page>
{:else if pageState == 3}
  
  <Occasion
    focusedOccasion = {focusedOccasion}
    focusedOccasionID  = {focusedOccasionID}
    indexInOccasions = {indexInOccasions}
    sliderCue = {sliderCue}
    broadcastStatus ={broadcastStatus}/>

{/if}



