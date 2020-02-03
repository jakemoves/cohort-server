<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->

<script>
  import moment from "moment";
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from "svelte";
  import { writable } from 'svelte/store';
  import Page from './ParentPage.svelte';
  // import Slider from './Slider.svelte';
  import Button from './Button.svelte';
  import Occasion from './Occasion.svelte';
  
  import { pageStateInStore } from "./PageStore.js";

  // import Modal from './Modal.svelte';
  import List from './ArrayList.svelte';

  import { urlStore } from './ServerURLstore.js';
  
  //import events from store
  import {events, storedEvents} from './EventsStore.js';

    //for new event creation parameters
  let label = "";

  // let cueState = 0;
  //Holds event ID in order to display occasions for that event
  let focusedEventLabel = "0";
  let focusedOccasionID = 0;
  let focusedEvent;
  let focusedOccasion = "0";
  let dateSortedOccasions =[];
  let isOccasionOpen;
  //hold formatted time
  let formattedStartTime = "";
  let formattedEndTime = "";
  let formattedEndTimeFull ="";
  let formattedStartTimeFull ="";
  let formattedTime ="";

  
  let indexInEvents;
  let indexInOccasions;

  let sliderCue;
  let broadcastStatus = "unsent";
  // let broadcastResults;

//password check on login
  let authenticated = false;

//to show/hide dev Tools.
  let devElement = false;



  // initiate pageState at 0
  let pageState = 0;
  //then update pageState from store
  pageStateInStore.subscribe(value => {
    pageState = value;

  })
  //grab info from events
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
    formattedStartTimeFull = value.detail.formattedStartTimeFull;
    formattedEndTimeFull = value.detail.formattedEndTimeFull;
    formattedStartTime = value.detail.formattedStartTime;
    formattedEndTime = value.detail.formattedEndTime;
    isOccasionOpen = value.detail.isOccasionOpen;

  }
  
  function broadcastStatusFromBackButton(value){
    broadcastStatus = value.detail.broadcastStatus;
  }
  
  // let gotEvents = false;
  //holds a store of events
  // $: events = [];


  let serverURL;

   urlStore.subscribe(value => {
    serverURL = value;

  })


  function deleteOccasion() {
    let value;

    //use this at the end of whatever logic is used for delete
    deleteOccasionHasHappened = true;
  
    if (deleteOccasionHasHappened){
      pageState = 2;
    } 

   //updates events to remove selected occasion.
   focusedEvent.occasions.splice(indexInOccasions, 1);

    storedEvents.subscribe(value => {
      console.log(value);
    });
    
    
  //if wanting to delete from the server;
  // function deleteOccasionServer() {
  //   try {
  //       return fetch(serverURL + "/occasions/" + focusedOccasionID, {
  //         method: 'DELETE'
  //       }) .then(response => {
  //             response.json().then( details => {
  //             console.log(details)
  //             })
  //         }).catch( error => {
  //               console.log("Error on occasion delete!")
  //             })
  //       } catch (e) {
  //           console.log(e.message)
  //         }
  //         GetEvents();
  // } 

    // deleteOccasionServer();

   }


  /////for new event generation
  function setTitle(event) {
    label = event.target.value;
  }

  //whichever parameters we want to be able to build for new events from the site would go below
  // function createEvent() {
  //   let newEvent = [
  //     {
  //       label: label
  //     }
  //   ];
  //   events = events.concat(newEvent);
  // }

  function verifyPassword(){
    // verifying password logic 
    var passwordCheck = document.getElementById('password').value;
    if (passwordCheck == "5555"){
      authenticated = true;
      // pageState = 1;
      pageStateInStore.update(value => value = 1);
    }
  }
    
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

  .form-control{
    font-size:0.8rem;
  }

</style>


{#if pageState == 0}
<div id="login">
  <div class="container">
    <form id="formContent">

      <div class="row"> 
        <div class= "col-md-12 text-center mt-4 mb-2">  
          <h4>Welcome Administrator</h4>
        </div>
      </div>

      <div class="form-group">
          <input type="text" id="login" class="form-control" name="login" placeholder="username"> 
      </div>

      <div class="form-group"> 
        <input type="text" id="password" class="form-control" name="login" placeholder="password">     
      </div>

      <Button on:click={verifyPassword}
        buttonStyle = "btn-primary"
        gridStyle = ""
        buttonText = "Login"/>

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
  </div>
</div>

<!-- #eventsList allows a list of events to be built and shown based on "events" from store-->
{:else if pageState == 1}
  <Page
    pageID="eventsList"
    headingText="Events">

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
<!-- {:else if pageState == 3} 
  <Page on:message={broadcastStatusFromBackButton}
    pageID='closedOccasion' 
    headerSize={3} 
    headingText={focusedOccasion.label}
    includeBackButton = true>

    <div class="row">
      <Button on:click={showQR}
        buttonText="Get QR Code" 
        dataTarget="#QRcodeModal"/>
    </div>

    <div class="row">
      <div class="col-md-12">

        <label for="OccasionDetails">
          <h4>Occasion Details</h4>
        </label>
        <ul id="OccasionDetails">
          <li>Start Date : {formattedStartTimeFull}</li>
          <li>End Date : {formattedEndTimeFull}</li>
          <li>Location Label: {focusedOccasion.locationLabel}</li>
          <li>Location Address: {focusedOccasion.locationAddress}</li>
          <li>Location City: {focusedOccasion.locationCity}</li>
		    </ul>
		  <hr> 
        <div class="row">
          <Button on:click={openOccasionButton}
            buttonStyle="btn-outline-success btn-block"
            buttonText="Open Occasion"/>
        </div>
        <div class="row">
          <Button
            buttonStyle="btn-outline-danger btn-block"
            buttonText="Delete Occasion"
            dataTarget="#deleteOccasionModal"/>
        </div>
		 
      </div>
    </div>
    

  </Page>

{:else if pageState == 4}  
  <Page 
    pageID='openOccasion'
    headingText={focusedOccasion.label}>
     <div class="row">
      <Button
        buttonStyle='btn-outline-danger btn-block' 
        buttonText="Close Occasion" 
        dataTarget="#closeOccassionModal"/>
    </div>
    <div class="row">
      <Button on:click={showQR} 
        buttonText="Show QR Code" 
        dataTarget="#QRcodeModal"/>
    </div>

    {#if gotEvents == true }
      {#if focusedEvent.episodes[0].cues.length == 0}
        <div class="row">
          <div class="col-md-12">
          <p>Sorry, no cues for this event can be found. We're cue-less.  </p>
          </div>
        </div>
      {:else}
        <div class="row">
          <div class="col-md-12">
            <h5>Cue Details</h5>
            
            {#if focusedEvent != null && focusedEvent !== undefined}
              {#each focusedEvent.episodes[0].cues as cue, index}
                {#if index == cueState}
                  <div id={cue.cueNumber} >
                    <ul>Media Domain:
                      {#if cue.mediaDomain == 0}
                        Sound
                      {:else if cue.mediaDomain == 1}
                        Video
                      {:else if cue.mediaDomain == 2}
                        Text
                      {:else if cue.mediaDomain == 3}
                        Light 
                      {:else if cue.mediaDomain == 4}
                        Haptic
                      {/if}					  
                    </ul>
                    <ul>Cue Number: {cue.cueNumber}</ul>
                    <ul>Cue Action:
                      {#if cue.cueAction == 0}
                        Play (or 'on')
                      {:else if cue.cueAction == 1}
                        Pause
                      {:else if cue.cueAction == 2}
                        Restart
                      {:else if cue.cueAction == 3}
                        Stop (or 'off')
                      {/if}
                    </ul>
                  </div>
                {/if}
              {/each}
            {/if}

          </div>
        </div>
   
        <div class="row">
          <div class="col-12 d-flex justify-content-between">
            <Button on:click={() => changeCueState ("previous")}
              gridStyle = ""
              buttonStyle = 'btn-info'
              buttonText = &nbsp;Previous
              value = previous
              iconLeft = "fas fa-angle-left"
              disabled = {cueState == 0}/>

            <Button on:click={() => changeCueState ("next")}
              gridStyle = ""
              buttonStyle = 'btn-info'
              buttonText = &nbsp;&nbsp;&nbsp;Next&nbsp;
              value = next
              iconRight = "fas fa-angle-right"
              disabled={cueState == focusedEvent.episodes[0].cues.length-1}/>
          </div>
        </div>    

        <Slider _broadcastResults={broadcastResults} _broadcastStatus={broadcastStatus}/>
      {/if}
    {/if} 

  </Page> -->
 
{/if}
<!-- //end of page state logic -->
<!-- <Modal
  modalID = "deleteOccasionModal"
  modalTitle= "Delete Occasion">
  
  <div slot="modalBody">
    {#if gotEvents}
      Are you sure you want to delete {focusedEvent.label} - {formattedStartTime}?
    {/if}
  </div>

  <div class="row" slot="modalFooter">
    <Button
      gridStyle = "mr-1"
      buttonStyle="btn-outline-secondary"
      dataDismiss ="modal"
      buttonText = "Cancel"/>

    <Button on:click={deleteOccasion}
      gridStyle = "mr-1"
      buttonStyle="btn-outline-danger"
      dataDismiss="modal"
      buttonText="Delete Occasion"/>
  </div>
</Modal> -->

<!-- <Modal
  modalID="closeOccassionModal"
  modalTitle="Close Occasion">
  
  <div slot="modalBody">
    {#if gotEvents}
      Are you sure you want to close {focusedEvent.label} - {formattedStartTime}?
    {/if}
  </div>
  <div class="row" slot="modalFooter">
    <Button
      gridStyle = "mr-1"
      buttonStyle="btn-outline-secondary"
      dataDismiss ="modal"
      buttonText = "Cancel"/>

    <Button on:click={closeOccasionButton}
      gridStyle = "mr-1"
      buttonStyle="btn-outline-danger"
      dataDismiss="modal"
      buttonText="Close Occasion"/>
  </div>
</Modal>

<Modal
  modalID="QRcodeModal">
    <div slot="closeButton">
      <Button
          buttonStyle="close"
          dataDismiss="modal"
          ariaLabel="Close"
          iconRight = "fas fa-times"/>
    
    </div>
    
    <div slot="modalBody" class="container-fluid">
      <div id = "QRcodeContainer">
        <!-- QR code populated here -->
      <!-- </div>
    </div>
</Modal> --> 

