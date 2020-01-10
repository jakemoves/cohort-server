<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->

<script>
  import moment from "moment";
  import { onMount } from 'svelte';
  import { createEventDispatcher } from "svelte";
  import { writable } from 'svelte/store';
  import Page from './ParentPage.svelte';
  import Slider from './Slider.svelte';
  import Button from './Button.svelte';
  // import {goBackAPage} from './ButtonActions.svelte'
  import Modal from './Modal.svelte';
  import OccasionsList from './OccasionsList.svelte';
  
  let storedEvents;
  let gotEvents = false;
  //holds a store of events
  $: events = [];

  // // TODO this needs to pickup an environment somehow (dev/staging/prod)
  //serverURL populated with dropdown at login - default is staging.cohort.rocks
  let serverURL;


//grabbing events info from the server
  let GetEvents = async () => {
    let response = await fetch(serverURL + "/events", {
      method: 'GET'
    })

    let grabbedFromServerEvents = await response.json()
    gotEvents = true
    
    storedEvents = writable(grabbedFromServerEvents);
    storedEvents.subscribe(value => {
      events = value;
      console.log(value);
    });

    focusedEvent = events[0]
  }

  // cue broadcast
  window.onCueSliderInput = (event) => {
  const SliderValue = event.target.value
  if( SliderValue == 100){  
    event.target.disabled == true

    broadcastStatus = "pending"
    try {
      fetch(serverURL + "/occasions/" + focusedOccasionID + "/broadcast", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(sliderCue)
      })
      .then( response => {
        console.log(response.status); 
        if(response.status == 200){
          response.json().then( results => {
            console.log(results)
            event.target.disabled = false
            event.target.value = 0

            const flatResults = results.map( result => result.success)

            const attempts = flatResults.length
            let successes = flatResults.filter( result => result == true).length

            broadcastResults = "Broadcast to " + successes + "/" + attempts + " devices"

            if(attempts == successes){
              // all devices received broadcast
              broadcastStatus = "full-success"
            } else {
              broadcastStatus = "partial-success"
            }
          })
        } else {
          response.text().then( errorMessage => {
            
            event.target.disabled = false
            event.target.value = 0
            
            broadcastResults = errorMessage
            broadcastStatus = "error"
            console.log('error on request: ' + errorMessage)
          })
        }
      }).catch( error => {
        event.target.disabled = false
        event.target.value = 0
        broadcastResults = errorMessage
        broadcastStatus = "error"
        
      })
    } catch (e) {
      event.target.disabled = false
      event.target.value = 0

      broadcastResults = errorMessage
      broadcastStatus = "error"
      console.log(e.message)
    } 
  }
};

//for testing
//   let events = [
//     {
//       id: 2,
//       label: "LOT X",
//       //"heroImage": URL-TO-IMG, // optional
//       occasions: [
//         {
//           id: 1,
//           event_id: 1,
//           state: "closed", // can be open or closed; closed events cannot be joined
//           startDateTime: "2019-05-23T17:00:00.000Z", // stored in UTC, browser does conversion
//           doorsOpenDateTime: "2019-05-23T16:30:00.000Z",
//           endDateTime: "2019-05-29T03:50:00.000Z",
//           locationLabel: "Show #5",
//           locationAddress: "125 Emerson Ave, Toronto ON, M6H 3S7",
//           locationCity: "Toronto",
//           publicURL: "https://cohort.rocks/api/v2/events/1/occasions/3", // for making QR code to join the event
//           devices: [
//             {
//               id: 1,
//               guid: "dklfjdklf-dfd-f-df-dfdfdfas-3r3r-fdf3",
//               apnsDeviceToken: null, // not used for now -- this is for push notifications
//               isAdmin: true, // here for now -- the admin site will connect to an occasion as a device
//               tags: ["blue", "1984"]
//             }
//           ]
//         },
//         {
//           id: 2,
//           event_id: 1,
//           state: "closed", // can be open or closed; closed events cannot be joined
//           startDateTime: "2019-06-28T17:00:00.000Z", // stored in UTC, browser does conversion
//           doorsOpenDateTime: "2019-06-28T16:30:00.000Z",
//           endDateTime: "2019-07-10T03:50:00.000Z",
//           locationLabel: "Show #5",
//           locationAddress: "125 Emerson Ave, Toronto ON, M6H 3S7",
//           locationCity: "Toronto",
//           publicURL: "https://cohort.rocks/api/v2/events/1/occasions/3", // for making QR code to join the event
//           devices: [
//             {
//               id: 1,
//               guid: "dklfjdklf-dfd-f-df-dfdfdfas-3r3r-fdf3",
//               apnsDeviceToken: null, // not used for now -- this is for push notifications
//               isAdmin: true, // here for now -- the admin site will connect to an occasion as a device
//               tags: ["blue", "1984"]
//             }
//           ]
//         }
//       ],
//       episodes:[
//         {
//           cues: [
//             {
//           mediaDomain: 0, // enum: audio, video, text, light, haptic
//           cueNumber: 1,
//           cueAction: 0, // enum: play/on, pause, restart, stop/off
//           targetTags: ["all"]
//         },
//         {
//           mediaDomain: 0, // enum: audio, video, text, light, haptic
//           cueNumber: 2,
//           cueAction: 3, // enum: play/on, pause, restart, stop/off
//           targetTags: ["all"]
//         }
//       ]
//     }]
//   }
// ];

  //for new event creation parameters
  let label = "";

  let cueState = 0;
  //Holds event ID in order to display occasions for that event
  let focusedEventLabel = "0";
  let focusedOccasionID = 0;
  let focusedEvent;
  let focusedOccasion = "0";
  let dateSortedOccasions =[];
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
  let broadcastResults;

//password check on login
  let authenticated = false;

//to show/hide dev Tools.
  let devElement = false;

//show/hide modal
  let modalhtml;
  //double check that a delete Occasion has happened
  let deleteOccasionHasHappened = false;

  //hold DOM state
  let pageState = 0;

  // when an event button is hit only open occasions for that event
  function eventButton() {
    
    focusedEventLabel = this.value;
    indexInEvents = events.findIndex(event => event.label === focusedEventLabel);
    focusedEvent = events[indexInEvents];

    ///sorting occasions by date
    let occasionArray = focusedEvent.occasions;
    dateSortedOccasions = occasionArray.sort((a, b) => a.valueOf() - b.valueOf());
    
    //set up slider cue to hold cues in first index (0)
     sliderCue = focusedEvent.episodes[0].cues[0]
     pageState = 2;
  }
  
 function occasionButton(id) {
    focusedOccasionID = id;
    indexInOccasions = focusedEvent.occasions.findIndex(x => x.id == focusedOccasionID);
    focusedOccasion = focusedEvent.occasions[indexInOccasions];

    if(focusedOccasion.state == "closed"){
      pageState = 3;
    } else {
      pageState = 4;
    }

	  formattedStartTimeFull = moment(focusedOccasion.startDateTime)
      .format("LLL");
    formattedEndTimeFull = moment(focusedOccasion.endDateTime)
	    .format("LLL");
	  formattedStartTime = moment(focusedOccasion.startDateTime)
      .format("LL");
    formattedEndTime = moment(focusedOccasion.endDateTime)
      .format("LL");
  }


  function openOccasionButton() {
    try {
      fetch(serverURL + "/occasions/" + focusedOccasionID, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"state":"opened"}) 
      }).then( response => { 
        if(response.status == 200){
          response.json().then( details => {
            pageState = 4;
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

  function goBackAPage(){
    pageState --;
    // not sure this is the right space for this
    broadcastStatus = "unsent"
  }

  function closeOccasionButton(){

    try {
      fetch(serverURL + "/occasions/" + focusedOccasionID, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"state":"closed"}) 
      }).then( response => { 
        if(response.status == 200){
          response.json().then( details => {
            pageState=3;
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
    let value;
    // let eventful = true;
    //updates Events to remove selected occasion.
    focusedEvent.occasions.splice(indexInOccasions, 1);

    //use this at the end of whatever logic is used for delete
    deleteOccasionHasHappened = true;
  
    if (deleteOccasionHasHappened){
      modalhtml = "modal";
      document.getElementById("closedOccasion").style.display = "none";
      document.getElementById("occasionList").style.display = "block";

    } else {
      modalhtml = '';
    }




    // update storedEvents with new events object
    // storedEvents.update(value => {
    //   // if (eventful) value = events; 
    //   value = events;
      
    // });
    // storedEvents.subscribe(value => {
    //   console.log(value);
    // });
    
  
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
  // function backToEvents() {
  //   let id = this.value;
  //   document.getElementById(id).style.display = "none";
  //   document.getElementById("eventsList").style.display = "block";
  // }
  

  // function backToOccasionList() {
  //   let id = this.value;
  //   document.getElementById(id).style.display = "none";
  //   document.getElementById("occasionList").style.display = "block";

  //   broadcastStatus = "unsent"
  // }

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

    // document.getElementById(id).style.display = "none";
    // document.getElementById("QRcode").style.display = "block";
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

  /////for new event generation
  function setTitle(event) {
    label = event.target.value;
  }

  //whichever parameters we want to be able to build for new events from the site would go below
  function createEvent() {
    let newEvent = [
      {
        label: label
      }
    ];
    events = events.concat(newEvent);
  }

  function verifyPassword(){
    // verifying password logic 
    var passwordCheck = document.getElementById('password').value;
    if (passwordCheck == "5555"){
      authenticated = true;
      GetEvents();
      pageState = 1;
      // document.getElementById("eventsList").style.display="block";
      
      
    }
  }
    
    function HideShowDev() {
     let devTools = document.getElementById('devTools');

        if(devTools.style.visibility == "visible"){
          devTools.style.visibility = "hidden";
        } else {
          devTools.style.visibility = "visible"
        }
    }
  
</script>

<style>
  /* #eventsList, */
  /* #closedOccasion,
  #openOccasion,
  #occasionList {
    display: none;
  } */
  #devTools{
    visibility: hidden;

  }

  #createEventInput {
    padding-left: 0;
  }


  h1 {
    font-size: 2rem;
  }

  button > h3, button > p {
    margin-bottom: 0;
  }

  .form-control{
    font-size:0.8rem;
  }


</style>


{#if pageState == 0}
<div id="login">
  {#if !authenticated}
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

      <button type="button" class="btn btn-primary" on:click={verifyPassword}> Log In </button>

      <div class="form-group mt-5">
        <button type="button" class="btn btn-light btn-outline-dark btn-sm mt-4" on:click={HideShowDev}> Show/Hide Developer Tools </button>
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
  {/if}
</div>

<!-- #eventsList allows a list of events to be built and shown -->
{:else if pageState == 1}
<div id="eventsList">
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12 text-center mt-4">
        <h1>Events</h1>
      </div>
    </div>
    <hr />

    {#if events.length === 0}
      <p>That's uneventful. Sorry, no events have been added yet</p>
    {:else}
      {#each events as event}
        <div class="row mt-2">
          <div class="col-6 text-right">
            <h3>{event.label}:</h3>
          </div>
          <div class="col-6">
            <button
              alt="click here for {event.label} occasion list"
              type="button"
              class="btn btn-outline-primary btn-block"
              value={event.label}
              on:click={eventButton}>
              <p>Occasions&nbsp;<span style="font-size: 1.1rem; vertical-align: middle" class="fas fa-angle-right" /></p>
            </button>
          </div>
        </div>
      {/each}
    {/if}

    <hr />
    <!-- event creation -->
    <!-- <div class="input-group mb-auto">
      <input
        type="text"
        id="title"
        class="form-control"
        placeholder="New Event Name"
        value={label}
        on:input={setTitle} />
      <div class="input-group-append">
        <button class="btn btn-primary" on:click={createEvent}>
          Create New Event
        </button>
      </div>
    </div> -->

  </div>
</div>
{:else if pageState == 2}
<!-- //occasions list populated by looping through events of "focused" event ID -->
  <Page
    pageID = "occasionList"
    headerSize={3} 
    headingText="Occasions">
    <div slot="backButton">
       <Button on:click={goBackAPage}
          bsSizePosition=""
          buttonType="btn-outline-primary abs-left"
          iconLeft= "fa fa-angle-left"
          buttonText="Back"/>
    </div>
    
    {#if focusedEvent.occasions.length === 0}
        <p class="text-center">No occasions for this event yet</p>
    {:else}
      {#each dateSortedOccasions as occasion (occasion.id)}
        <Button on:click={() => occasionButton(occasion.id)}
            buttonHtml = '<h3 class="m-0">{occasion.label}  - {occasion.label} </h3> <h5>{occasion.locationCity} - {moment(occasion.startDateTime).format("LL")} - id:{occasion.id}</h5>'
            value = {occasion.id}/>
      {/each}
    {/if}

  </Page>

{:else if pageState == 3} 
<Page 
    pageID='closedOccasion' 
    headerSize={3} 
    headingText={focusedOccasion.label}>
    <div slot="backButton">
       <Button on:click={goBackAPage}
          bsSizePosition=""
          buttonType="btn-outline-primary abs-left"
          iconLeft= "fa fa-angle-left"
          buttonText="Back"/>
    </div>

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
            buttonType="btn-outline-success btn-block"
            buttonText="Open Occasion"/>
        </div>
        <div class="row">
          <Button
            buttonType="btn-outline-danger btn-block"
            buttonText="Delete Occasion"
            dataTarget="#deleteOccassionModal"/>
        </div>
		  
        
      </div>
    </div>
    
</Page>

{:else if pageState == 4}  
  <Page 
    pageID='openOccasion' 
    headerSize={3} 
    headingText={focusedOccasion.label}>
     <div class="row">
      <Button
        buttonType='btn-outline-danger btn-block' 
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
              bsSizePosition = ""
              buttonType = 'btn-info'
              buttonText = &nbsp;Previous
              value = previous
              iconLeft = "fas fa-angle-left"
              disabled = {cueState == 0}/>

            <Button on:click={() => changeCueState ("next")}
              bsSizePosition = ""
              buttonType = 'btn-info'
              buttonText = &nbsp;&nbsp;&nbsp;Next&nbsp;
              value = next
              iconRight = "fas fa-angle-right"
              disabled={cueState == focusedEvent.episodes[0].cues.length-1}/>
          </div>
        </div>    

        <Slider _broadcastResults={broadcastResults} _broadcastStatus={broadcastStatus}/>
      {/if}
    {/if} 

  </Page>

{/if}
<!-- //end of page state logic -->
<div class="modal fade" id="deleteOccassionModal" tabindex="-1" role="dialog" aria-labelledby="deleteOccassionModalLabel" aria-hidden="true">
<div id="confirmDelete">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="deleteOccasionConfirmation">
          Delete Occasion
        </h5>
      </div>

      {#if gotEvents == true}
      <div class="modal-body">
        Are you sure you want to delete {focusedEvent.label} - {formattedStartTime}
        ?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">
          Cancel
        </button>
        <button type="button" 
          class="btn btn-outline-danger" 
          on:click={deleteOccasion} 
          data-dismiss={modalhtml}>
          Delete Occasion
        </button>
      </div>
      {/if}
    </div>
  </div>
</div>
</div>

<Modal
  modalID="closeOccassionModal">
  <h5 slot="modalHeader" class="modal-title">
      Close Occasion
  </h5>
  <div slot="modalBody">
    {#if gotEvents == true}
      Are you sure you want to close {focusedEvent.label} - {formattedStartTime}?
    {/if}
  </div>
  <div class="row" slot="modalFooter">
    <Button
      bsSizePosition = "mr-1"
      buttonType="btn-outline-secondary"
      dataDismiss ="modal"
      buttonText = "Cancel"/>

    <Button on:click={closeOccasionButton}
      bsSizePosition = "mr-1"
      buttonType="btn-outline-danger"
      dataDismiss="modal"
      buttonText="Close Occasion"/>
  </div>
</Modal>

<Modal
  modalID="QRcodeModal">
    <div slot="modalHeader">
    <Button
          buttonType="close"
          dataDismiss="modal"
          ariaLabel="Close"
          iconRight = "fas fa-times"/>
    </div>
    <div slot="modalBody" class="container-fluid">
      <div id = "QRcodeContainer">
        <!-- QR code populated here -->
      </div>
    </div>
</Modal>

