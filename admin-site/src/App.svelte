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
  import EventCreationFrom from './EventCreationForm.svelte';
  import OccasionCreationForm from './OccasionCreationForm.svelte';
  

  let sliderCue;
  let broadcastStatus = "unsent";
  // let broadcastResults;

  let openEventCreation = false;
  let occasionCreationFormIsOpen = false;
  let pageState;
  //grab pageState from store
  pageStateInStore.subscribe(value => {
    pageState = value;
  })

  /////Functions below grab dispatch messages
  
  //grab info from events + occasions
  function messageFromArrayList(value){
    openEventCreation = value.detail.openEventCreation;
  }

   //receive message package from EventCreationFrom to hide the event creation form
  function messageToCloseEventForm(value){
    openEventCreation = value.detail.openEventCreation;
  }

   //receive message package from OccasionCreationForm to exit the occasion creation form
  function messageToCloseOccasionForm(value){
    occasionCreationFormIsOpen = value.detail.occasionCreationFormIsOpen;
  }

  //receive message package from OccasionList to show the occasion creation form
  function messageToOpenOccasionForm(value){
    occasionCreationFormIsOpen = value.detail.occasionCreationFormIsOpen;
    
  }
  //receive message package from BackButton on occasion list page to only update occasion state (as opposed to pageState);
  function broadcastStatusFromBackButton(value){
    broadcastStatus = value.detail.broadcastStatus;
    occasionCreationFormIsOpen = value.detail.occasionCreationFormIsOpen;
  }
 
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
  <!-- dev tools are currently commented out but could allow manual choosing of serverURL -->
  <!-- <DevTools/> -->
  <RegistrationForm />

{:else if pageState == 1}
  <Page
    pageID="eventsList"
    headingText="Events">
    
    {#if !openEventCreation}
<!-- #eventsList allows a list of events to be built and shown based on "events" from store-->
      <EventsList on:message = {messageFromArrayList}/>
    {:else}
      <EventCreationFrom on:message = {messageToCloseEventForm}/>

    {/if}
  </Page>

{:else if pageState == 2}
  <Page on:goBack={broadcastStatusFromBackButton}
    pageID = "occasionList" 
    headingText="Occasions"
    includeBackButton = true
    occasionCreationFormIsOpen = {occasionCreationFormIsOpen}>
    <!-- open and close occasion creation form -->
    {#if !occasionCreationFormIsOpen}
    <!-- //occasions list populated by looping through events of "focused" event ID -->
      <OccasionsList
        on:state={messageToOpenOccasionForm}/>
    {:else}
      <OccasionCreationForm on:message = {messageToCloseOccasionForm} />
    {/if}
    
  </Page>
{:else if pageState == 3}
  
  <Occasion
    broadcastStatus ={broadcastStatus}/>

{/if}



