<script>
import Page from './ParentPage.svelte';
import { onMount } from 'svelte';
import { pageStateInStore } from './PageStore.js';
import { urlStore } from './ServerURLstore.js';
import { focusedItems } from './EventsStore.js';
import Button from './Button.svelte';
import moment from "moment";
import Slider from './Slider.svelte';

let pageState;
let serverURL;
  urlStore.subscribe(value => {
        serverURL = value;
    })

export let focusedEvent;
export let focusedOccasion;
export let focusedOccasionID;
// focusedItems.subscribe(value => focusedOccasion = value.focusedOccasion);

let formattedStartTimeFull;
let formattedEndTimeFull;
let formattedStartTime;
let formattedEndTime;

let occasionIsOpen = false;

let cueState = 0;

let sliderCue;
let broadcastStatus = "unsent";
let broadcastResults;

onMount(async () => {
     pageStateInStore.subscribe(value => {
    pageState = value;
  })
     formattedStartTimeFull = moment(focusedOccasion.startDateTime)
      .format("LLL");
    formattedEndTimeFull = moment(focusedOccasion.endDateTime)
	    .format("LLL");
	  formattedStartTime = moment(focusedOccasion.startDateTime)
      .format("LL");
    formattedEndTime = moment(focusedOccasion.endDateTime)
      .format("LL");
});
//not working
  function openOccasionButton() {
    try {
      fetch(serverURL + "/occasions/" + focusedOccasionID, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"state":"opened"}) 
      }).then( response => { 
        if(response.status == 200){
          response.json().then( details => {
            occasionIsOpen = true;
            
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
  };


 function showQR() {
    //grab QR code for that occasion and update
    // for testing "/occasions/3/qrcode"
    let QrResponse = async () => { 
      let response = await fetch(serverURL + "/occasions/" + focusedOccasionID + "/qrcode", {
          method: 'GET'
      });
      let qrcode = await response.text()
      let qrContainer = document.getElementById("QRcodeContainer")
      qrContainer.innerHTML = qrcode
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


</script>


{#if focusedOccasion.state == "closed"}

    <Page on:message={broadcastStatusFromBackButton}
        pageID="closedOccasion"
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
{:else}
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

        <Slider _broadcastResults={broadcastResults} _broadcastStatus={broadcastStatus}/>
      {/if}
    <!-- {/if}  -->

  </Page>
{/if}
