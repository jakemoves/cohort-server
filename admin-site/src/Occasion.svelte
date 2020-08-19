<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->

<!-- Component for open and closed occasions -->
<script>
  import Page from './ParentPage.svelte';
  import { onMount } from 'svelte';
  import { pageStateInStore, focusedEvent, focusedOccasionStore, focusedOccasionID } from './UpdateUIstore.js';
  import { serverURL } from './ServerURLstore.js';
  import { getEventsAndStore } from './EventsStore.js';
  import Button from './Button.svelte';
  import moment from "moment";
  import Slider from './Slider.svelte';
  import Modal from './Modal.svelte';
  import OTMItinerary from './OTMItinerary.svelte'
  import Ludograph from './Ludograph.svelte'
 
  export let broadcastStatus;

  let focusedOccasion;
  focusedOccasionStore.subscribe(value => {
    focusedOccasion = value
  });
 
  let sliderCue = focusedEvent.episodes[0].cues[0];
  let formattedStartTimeFull;
  let formattedEndTimeFull;
  let formattedStartTime;
  let formattedEndTime;

  let cueState = 0;

  let occasionDetails= [];
  let showOccasionDetailsTitle = true;

  const mediaDomainEnum = {
    0:"Sound",
    1:"Video",
    2:"Image",
    3:"Text",
    4:"Light",
    5:"Haptic",
  };

  const cueActionEnum = {
    0: "Play (or 'on')",
    1: "Pause",
    2: "Restart",
    3: "Stop (or 'off')"
  }

  function freezeEnums(){
    //if browser supports Object.freeze, freeze enums so that they are only readable
    if(Object.freeze){
      Object.freeze(mediaDomainEnum);
      Object.freeze(cueActionEnum);
    }
  }
  freezeEnums();

  onMount(async () => {
    formattedStartTimeFull = moment(focusedOccasion.startDateTime)
      .format("LLL");
    formattedEndTimeFull = moment(focusedOccasion.endDateTime)
      .format("LLL");
    formattedStartTime = moment(focusedOccasion.startDateTime)
      .format("LL");
    formattedEndTime = moment(focusedOccasion.endDateTime)
      .format("LL");

     occasionDetails = [
      {label:"Start Date: ", value:formattedStartTimeFull},
      {label:"End Date: ", value:formattedEndTimeFull},
      {label:"Location Label: ", value:focusedOccasion.locationLabel},
      {label:"Location Address: ", value:focusedOccasion.locationAddress},
      {label:"Location City: ", value:focusedOccasion.locationCity}
     ]

     hideOccasionTitleIfDetailsAreEmpty();

  });

  function hideOccasionTitleIfDetailsAreEmpty(){
    //creating a little truth table to check if all the occasion details are invalid/null
    let numFalse = 0;
      occasionDetails.forEach(element => {
        if (element.value === null || element.value === "Invalid date"){
          numFalse++
        } 
    });
    
    if(numFalse == occasionDetails.length){
      showOccasionDetailsTitle = false;
    } else {
      showOccasionDetailsTitle = true;
    }
  }
  
 

  function updateOccasionStateOnServer(state){
    try {
      fetch(serverURL + "/occasions/" + focusedOccasionID, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"state": state}) 
      }).then( response => { 
        if(response.status == 200){
            // make sure store updates from server
            getEventsAndStore();
        } else {
          response.text().then( errorMessage => {
            console.log(`Error on ${state} request: ${errorMessage}`)
          })
        }
      }).catch( error => {
        console.log(`Catch error on ${state} request`)
      })
    } catch (e) {
      console.log(e.message)
    }
  }

  function openOccasionButton() {
    updateOccasionStateOnServer("opened"); 
    
  };

  function closeOccasionButton(){
    updateOccasionStateOnServer("closed");  
  };


  function deleteOccasion() {
     //Server will throw an error if we try to delete an open occasion, but we only show the Delete Occasion button when an occasion is closed, 
     //so we don't need to handle showing that error to users.
    try {
      return fetch(serverURL + "/occasions/" + focusedOccasionID, {
        method: 'DELETE'
      }).then( response => {
        console.log(response.status); 
        if(response.status == 204){
            getEventsAndStore();
            pageStateInStore.set(2);
          
        }
      }).catch( error => {
        console.log("Error on occasion delete!")
      })
      } catch (e) {
          console.log(e.message)
    }

  }
    

  function showQR() {
  //grab QR code for that occasion and update
  // for testing "/occasions/3/qrcode"
    let QrResponse = async () => { 
      let response = await fetch(serverURL + "/occasions/" + focusedOccasionID + "/qrcode", {
      method: 'GET'
      });
      let qrCode = await response.text().then( x => {
        let qrContainer = document.getElementsByClassName("QRcodeContainer");
      
        for (let i = 0; i < qrContainer.length; i++){
          qrContainer[i].innerHTML = x;
        }
      });
      
    }
    
    QrResponse();

  }


  function broadcastStatusFromBackButton(value){
    broadcastStatus = value.detail.broadcastStatus;
  }

      //this changes which cue details are shown
  function changeCueState(direction) {
    let cuesLength = focusedEvent.episodes[0].cues.length;
    if (direction == "next" && cueState < cuesLength - 1) {
      cueState ++;
    } else if (direction == "previous" && cueState > 0) {
      cueState --;
    } 
        //update broadcast message 
    sliderCue = focusedEvent.episodes[0].cues[cueState];

    broadcastStatus = "unsent"

  }

  function printQR(){
    window.print();
  }

</script>

<style>
  @media print {
    @page {
    size: A4;
    margin: 0;
    }
    .printThis {
        position: fixed;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        font-size: 3em;
        min-width: 1000px;  
    }
    .dontPrintThis{
      display:none;
    }
  }

  ul{
    list-style: none;
  }
  
</style>



<!-- update UI based on state of occasion -->
{#if focusedOccasion.state == "closed"}
  <Page on:message={broadcastStatusFromBackButton}
    pageID="closedOccasion"
    headingText={focusedOccasion.label}
    includeBackButton=true>

      <Button on:click={showQR}
        buttonText="Get QR Code" 
        dataTarget="#QRcodeModalClosed"/>
   
    <div class="row">
      <div class="col-md-12">
      {#if showOccasionDetailsTitle}
          <label for="OccasionDetails">
            <h4>Occasion Details</h4>
          </label>
      {/if}
          <ul id="OccasionDetails">
            {#each occasionDetails as { label, value }, i}
             <!-- svelte doesn't seem to allow compound conditionals -->
              {#if value === "Invalid date"}
              <!-- uncomment below to show value is invalid/not set to user -->
                <!-- <li>{label}Not set yet.</li> -->
              {:else if value == null}
                <!-- <li>{label}Not set yet.</li> -->
              {:else}
               <li>{label}{value}</li>
              {/if}
            {/each}
          </ul>
          <hr> 
          
          <Button on:click={openOccasionButton}
            buttonStyle="btn-outline-success btn-block"
            buttonText="Open Occasion"/>
        
          <Button
            buttonStyle="btn-outline-danger btn-block"
            buttonText="Delete {focusedOccasion.label}"
            dataTarget="#deleteOccasionModal"/>
               
      </div>
    </div>
  </Page>

{:else if focusedOccasion.state == "opened"}
  <Page 
    pageID='openOccasion'
    headingText={focusedOccasion.label}
    includeBackButton=true
    subHeadingText={formattedStartTimeFull}>
    
    <!-- {#if focusedEvent.label != "The Itinerary"} -->
   
    <Button
      buttonStyle='btn-outline-danger btn-block' 
      buttonText="Close Occasion" 
      dataTarget="#closeOccassionModal"/>
  
    <Button on:click={showQR} 
      buttonText="Show QR Code" 
      dataTarget="#QRcodeModal"/>
   
      {#if focusedEvent.label == "The Itinerary Kick and Push"}
        <Ludograph></Ludograph>
      {:else}
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
                      <ul>Media Domain: {mediaDomainEnum[cue.mediaDomain]}</ul>
                      <ul>Cue Number: {cue.cueNumber}</ul>
                      <ul>Cue Action: {cueActionEnum[cue.cueAction]}</ul>
                    </div>
                  {/if}
                {/each}
              {/if}

            </div>
          </div>
    
          <div class="row">
            <div class="col-12 d-flex justify-content-between">
              <Button on:click={() => changeCueState ("previous")}
                gridStyle=""
                buttonStyle='btn-info'
                buttonText=&nbsp;Previous
                value=previous
                iconLeft="fas fa-angle-left"
                disabled={cueState == 0}/>

              <Button on:click={() => changeCueState ("next")}
                gridStyle=""
                buttonStyle='btn-info'
                buttonText=&nbsp;&nbsp;&nbsp;Next&nbsp;
                value=next
                iconRight="fas fa-angle-right"
                disabled={cueState == focusedEvent.episodes[0].cues.length-1}/>
            </div>
          </div>    

          <Slider 
          broadcastStatus={broadcastStatus}
          sliderCue={sliderCue}/>
        {/if}
      {/if} 

  </Page>
{/if}

<Modal
  modalID="closeOccassionModal"
  modalTitle="Close Occasion">
  
  <div slot="modalBody">
      Are you sure you want to close {focusedEvent.label} - {formattedStartTime}?
  </div>
  <div class="row" slot="modalFooter">
    <Button
      gridStyle="mr-1"
      buttonStyle="btn-outline-secondary"
      dataDismiss="modal"
      buttonText="Cancel"/>

    <Button on:click={closeOccasionButton}
      gridStyle="mr-1"
      buttonStyle="btn-outline-danger"
      dataDismiss="modal"
      buttonText="Close Occasion"/>
  </div>
</Modal>

<Modal
  modalID="deleteOccasionModal"
  modalTitle="Delete Occasion">
  
  <div slot="modalBody">
      Are you sure you want to delete {focusedEvent.label} - {formattedStartTime}?
  </div>

  <div class="row" slot="modalFooter">
    <Button
      gridStyle="mr-1"
      buttonStyle="btn-outline-secondary"
      dataDismiss="modal"
      buttonText="Cancel"/>

    <Button on:click={deleteOccasion}
      gridStyle="mr-1"
      buttonStyle="btn-outline-danger"
      dataDismiss="modal"
      buttonText="Delete Occasion"/>
  </div>
</Modal>

<Modal
  modalID="QRcodeModalClosed"
  showCloseButton=true>
  
    <div slot="header">
      <div class="row">

        <div class="col-12">
          <p>Print this QR code to allow mobile devices to connect to your occasion.<br> <strong>Note: </strong>an occasion must be open to receive connections. </p>
        </div>

      </div> 
    </div>
    
    <div slot="modalBody" class="printThis container-fluid">
      <div class="QRcodeContainer">
        <!-- QR code populated here --->
      </div>
      <p class="text-center">{focusedEvent.label} - {focusedOccasion.label}</p>
      {#if formattedStartTimeFull !== "Invalid date"}
        <p class="text-center">{formattedStartTimeFull}</p>
      {/if}
    </div>
    
    <div class='dontPrintThis' slot="modalFooter">
       <Button on:click={printQR}
          buttonText="Print"
          buttonStyle="btn-outline-primary"
          gridStyle="col-12"
          iconLeft="fa fa-print"/>
    </div>

</Modal>

<Modal
  modalID="QRcodeModal"
  showCloseButton=true>
    <div slot="modalBody" class="container-fluid">
      <div class="QRcodeContainer">
        <!-- QR code populated here -->
      </div>
       <p class="text-center">{focusedEvent.label} - {focusedOccasion.label}</p>
    </div>
</Modal>
