
<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->

<!-- Component for open and closed occasions -->
<script>
  import Page from './ParentPage.svelte';
  import { onMount } from 'svelte';
  import { pageStateInStore, focusedEvent, focusedOccasionStore, focusedOccasionID } from './PageStore.js';
  import { serverURL } from './ServerURLstore.js';
  import { getEventsAndStore } from './EventsStore.js';
  import Button from './Button.svelte';
  import moment from "moment";
  import Slider from './Slider.svelte';
  import Modal from './Modal.svelte';
 

  
  let focusedOccasion;
  focusedOccasionStore.subscribe(value => {
    focusedOccasion = value
  });
 
  export let sliderCue;
  export let broadcastStatus;

  let grabbedFromServerEvents;

  let formattedStartTimeFull;
  let formattedEndTimeFull;
  let formattedStartTime;
  let formattedEndTime;

  //double check that a delete Occasion has happened
  let deleteOccasionHasHappened = false;

  let cueState = 0;




  onMount(async () => {
    formattedStartTimeFull = moment(focusedOccasion.startDateTime)
      .format("LLL");
    formattedEndTimeFull = moment(focusedOccasion.endDateTime)
      .format("LLL");
    formattedStartTime = moment(focusedOccasion.startDateTime)
      .format("LL");
    formattedEndTime = moment(focusedOccasion.endDateTime)
      .format("LL");
  });


  function openOccasionButton() {
    try {
      fetch(serverURL + "/occasions/" + focusedOccasionID, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"state":"opened"}) 
      }).then( response => { 
        if(response.status == 200){
          response.json().then( details => {
            
            // make sure store updates from server
            getEventsAndStore();
          })
        } else {
          response.text().then( errorMessage => {
            console.log('occasion open error on request: ' + errorMessage)
          })
        }
      }).catch( error => {
        console.log("Error occasion open")
      })
    } catch (e) {
      console.log(e.message)
    } 
    //storedEvents.subscribe(value => console.log(value)) 
    
  };

  function closeOccasionButton(){
    try {
      fetch(serverURL + "/occasions/" + focusedOccasionID, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"state":"closed"}) 
      }).then( response => { 
        if(response.status == 200){
          response.json().then( details => {
            
            // make sure store updates from server
            getEventsAndStore();
          })
        } else {
          response.text().then( errorMessage => {
            console.log('occasion close error on request: ' + errorMessage)
          })
        }
      }).catch( error => {
        console.log("Error occasion close")
      })
    } catch (e) {
      console.log(e.message)
    }
      
  }


  function deleteOccasion() {
    try {
      return fetch(serverURL + "/occasions/" + focusedOccasionID, {
        method: 'DELETE'
      }).then( response => { 
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
      let qrCode = await response.text()
      let qrContainer = document.getElementsByClassName("QRcodeContainer");
      // qrContainer.forEach(element => {
      //   qrContainer[element].innerHTML = qrCode;
      // });
      for (let i = 0; i < qrContainer.length; i++){
        qrContainer[i].innerHTML = qrCode
      }  
    };
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

  function serverUpdate(methodType, openOrClosedState){
    try {
      fetch(serverURL + "/occasions/" + focusedOccasionID, {
        method: methodType,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"state":openOrClosedState}) 
      }).then( response => { 
        if(response.status == 200){
          response.json().then( details => {
            //update state of occasion
            // occasionOpen.set(false);
            // make sure store updates from server
            getEventsAndStore();
          })
        } else {
          response.text().then( errorMessage => {
            console.log('occasion' + openOrClosedState + 'error on request: ' + errorMessage)
          })
        }
      }).catch( error => {
        console.log("Error occasion " + openOrClosedState)
      })
    } catch (e) {
      console.log(e.message)
    }
      

  }

</script>

<style>
  @media print {
    #printable {
        height: 100%;
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        font-size: 3em;
    }
    .notPrintable{
      display:none;
    }
  }
</style>



<!-- update UI based on state of occasion -->
{#if focusedOccasion.state == "closed"}
  <Page on:message={broadcastStatusFromBackButton}
    pageID="closedOccasion"
    headingText={focusedOccasion.label}
    includeBackButton = true>

    <div class="row">
      <Button on:click={showQR}
        buttonText="Get QR code" 
        dataTarget="#QRcodeModalClosed"/>
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
              buttonText="Open occasion"/>
          </div>
          <div class="row">
            <Button
              buttonStyle="btn-outline-danger btn-block"
              buttonText="Delete occasion"
              dataTarget="#deleteOccasionModal"/>
          </div>
          
      </div>
    </div>
  </Page>

{:else if focusedOccasion.state == "opened"}
  <Page 
    pageID='openOccasion'
    headingText={focusedOccasion.label}
    includeBackButton = true
    underHeading = {formattedStartTimeFull}>
   
    <div class="row">
      <Button
        buttonStyle='btn-outline-danger btn-block' 
        buttonText="Close occasion" 
        dataTarget="#closeOccassionModal"/>
    </div>
    <div class="row">
      <Button on:click={showQR} 
        buttonText="Show QR code" 
        dataTarget="#QRcodeModal"/>
    </div>
    
    <!-- {#if gotEvents == true } -->
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

        <Slider 
        broadcastStatus={broadcastStatus}
        sliderCue = {sliderCue}
        focusedOccasionID = {focusedOccasionID}/>
      {/if}
    <!-- {/if}  -->

  </Page>
{/if}
<Modal
  modalID="closeOccassionModal"
  modalTitle="Close occasion">
  
  <div slot="modalBody">
      Are you sure you want to close {focusedEvent.label} - {formattedStartTime}?
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
      buttonText="Close occasion"/>
  </div>
</Modal>

<Modal
  modalID = "deleteOccasionModal"
  modalTitle= "Delete Occasion">
  
  <div slot="modalBody">
    <!-- {#if gotEvents} -->
      Are you sure you want to delete {focusedEvent.label} - {formattedStartTime}?
    <!-- {/if} -->
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
      buttonText="Delete occasion"/>
  </div>
</Modal>

<Modal
  modalID="QRcodeModalClosed"
  showCloseButton = true>
    <div slot="header">
      <div class ="row">

        <div class="col-12">
          <p>Print this QR code to allow mobile devices to connect to your occasion.<br> <strong>Note: </strong>an occasion must be open to receive connections. </p>
        </div>

      </div> 
    </div>
    
    <div id="printable" slot="modalBody" class="container-fluid">
      <div class = "QRcodeContainer">
        <!-- QR code populated here --->
      </div>
      <p class="text-center">{formattedStartTimeFull}</p>
    </div>
    
    <div class='notPrintable' slot="modalFooter">
       <Button on:click={printQR}
          buttonText = "Print"
          buttonStyle = "btn-outline-primary"
          gridStyle = "col-12"
          iconLeft  = "fa fa-print"
        />
    </div>
   
</Modal>

<Modal
  modalID="QRcodeModal"
  showCloseButton = true>
    
    
    <div slot="modalBody" class="container-fluid">
      <div class = "QRcodeContainer">
        <!-- QR code populated here -->
      </div>
    </div>
</Modal>