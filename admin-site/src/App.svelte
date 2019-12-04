
<script>
  // import Login from "./Login.svelte";
  // import Slider from "./Slider.svelte";
  import moment from "moment";
  import { onMount } from 'svelte';
  import { createEventDispatcher } from "svelte";


  

  let events = []
  let gotEvents = false;

  // // TODO this needs to pickup an environment somehow (dev/staging/prod)
  // // let serverURL = "https://staging.cohort.rocks/api/v2"
  
  // let serverURL = "http://localhost:3000/api/v2";
  let serverURL;


//grabbing events info from the server
  let GetEvents = async () => {
    let response = await fetch(serverURL + "/events", {
      method: 'GET'
    })

    events = await response.json()
    gotEvents = true
    console.log(serverURL)
    focusedEvent = events[0]
  }

  
  window.onCueSliderInput = (event) => {
  const SliderValue = event.target.value
  if( SliderValue == 100){  
// user dragged slider all the way across — emit 'activated' event
  try {
      fetch(serverURL + "/occasions/3/broadcast", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ 
              "mediaDomain": sliderCue.mediaDomain,
              "cueNumber": sliderCue.cueNumber,
              "cueAction": sliderCue.cueAction,
              "targetTags": sliderCue.targetTags
              	// "mediaDomain": 0,
	              // "cueNumber": 1,
	              // "cueAction": 0,
	              // "targetTags": ["all"]
            })
          })
          .then( response => {
            console.log(response.status); 
            if(response.status == 200){
              response.json().then( details => {
                console.log(details)
                // vm.errorOnGo = false
                event.target.disabled = false
                event.target.value = 0
                event.target.classList.add('cue-sent-response-success')
                event.target.classList.remove('cue-sent-response-pending')
              })
            } else {
              response.text().then( errorMessage => {
                console.log('error on request: ' + errorMessage)
                // vm.errorOnGo = true
                // vm.goResults = body.error
                event.target.disabled = false
                event.target.value = 0
                event.target.classList.add('cue-sent-response-error')
                event.target.classList.remove('cue-sent-response-pending')
              })
            }
          }).catch( error => {
            console.log("Error on push notification broadcast!")
          })
    } catch (e) {
      console.log(e.message)
      // vm.errorOnGo = true
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

  let cueState = 1;
  //Holds event ID in order to display occasions for that event
  let focusedEventLabel = "0";
  let focusedOccasionID = 0;
  let focusedEvent;
  let focusedOccasion = "0";
  //hold formatted time
  let formattedStartTime = "";
  let formattedEndTime = "";
  let formattedEndTimeFull ="";
  let formattedStartTimeFull ="";
  let formattedTime ="";
  
  let indexInEvents;
  let indexInOccasions;

  let sliderCue;
//password check on login
  let authenticated = false;

//to show/hide dev Tools.
  let devElement = false;

  // when an event button is hit only open occasions for that event
  function eventButton() {
    document.getElementById("eventsList").style.display = "none";
    document.getElementById("occasionList").style.display = "block";
    focusedEventLabel = this.value;
    indexInEvents = events.findIndex(event => event.label === focusedEventLabel);
    focusedEvent = events[indexInEvents];

     
    //set up slider cue to hold cues in first index (0)
     sliderCue = focusedEvent.episodes[0].cues[0]
  }
  
  function occasionButton() {
    document.getElementById("occasionList").style.display = "none";
    document.getElementById("closeOccasion").style.display = "block";
    focusedOccasionID = this.value;
    indexInOccasions = focusedEvent.occasions.findIndex(x => x.id == focusedOccasionID);
    focusedOccasion = focusedEvent.occasions[indexInOccasions];

	  formattedStartTimeFull = moment(focusedOccasion.startDateTime)
      .format("LLL");
    formattedEndTimeFull = moment(focusedOccasion.endDateTime)
	    .format("LLL");
	  formattedStartTime = moment(focusedOccasion.startDateTime)
      .format("LL");
    formattedEndTime = moment(focusedOccasion.endDateTime)
      .format("LL");
  }
  //these are navigation buttons..not very elegant and partly due to modals not working
  function openOccasionButton() {
    document.getElementById("closeOccasion").style.display = "none";
    document.getElementById("openOccasion").style.display = "block";
  }

  function confirmOccasionDelete() {
    document.getElementById("closeOccasion").style.display = "none";
    document.getElementById("confirmDelete").style.display = "block";
  }
  function cancelDelete() {
    document.getElementById("confirmDelete").style.display = "none";
    document.getElementById("closeOccasion").style.display = "block";
  }

  function deleteOccasion() {
    // deletion code goes here
    document.getElementById("confirmDelete").style.display = "none";
    document.getElementById("eventsList").style.display = "block";
    //removes occasion from object and from list
    // Jake TODO: review store & one-way data flow
    focusedEvent.occasions.splice(indexInOccasions, 1);
    document.getElementById(focusedOccasionID).remove();
  }
  function backToEvents() {
    let id = this.value;
    document.getElementById(id).style.display = "none";
    document.getElementById("eventsList").style.display = "block";
  }
  function cancelEnd() {
    document.getElementById("confirmEndOccasion").style.display = "none";
    document.getElementById("openOccasion").style.display = "block";
  }
  function confirmEnd() {
    document.getElementById("openOccasion").style.display = "none";
    document.getElementById("confirmEndOccasion").style.display = "block";
  }

  function backToOccasionList() {
    let id = this.value;
    document.getElementById(id).style.display = "none";
    document.getElementById("occasionList").style.display = "block";
  }

  function backToCloseOccasion() {
    let id = this.value;
    document.getElementById(id).style.display = "none";
    document.getElementById("closeOccasion").style.display = "block";
  }

  
  function showQR() {
    let id = this.value;
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

    document.getElementById(id).style.display = "none";
    document.getElementById("QRcode").style.display = "block";
  }

  //this changes which cue details are shown
  function changeCueState() {
    let direction = this.value;
    if (direction == "next" && cueState <= focusedEvent.episodes[0].cues.length - 1) {
      cueState += 1;
    } else if (direction == "previous" && cueState > 1) {
      cueState -= 1;
    } else {
      cueState = 1;
    }

    //update broadcast message 
    sliderCue = focusedEvent.episodes[0].cues[cueState-1];
    
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
        document.getElementById("eventsList").style.display="block";
        
        GetEvents();
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
  #eventsList,
  #closeOccasion,
  #openOccasion,
  #occasionList,
  #QRcode,
  #confirmDelete,
  #confirmEndOccasion {
    display: none;
  }
  #devTools{
    visibility: hidden;

  }

  #createEventInput {
    padding-left: 0;
  }

  button {
	  margin-bottom:0.5rem;
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


/* Slider style */
label{
    margin: 1rem;
}
/* Slider CSS */
#cue-control-go {
  -webkit-appearance: none;
  width: 40%;
  margin: 1rem 5%;
padding: 0; }

#cue-control-go:focus {
  outline: none; }

#cue-control-go::-webkit-slider-runnable-track {
  width: 100%;
  height: 50px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #3071a9;
  border-radius: 50px;
  border: 0px solid #010101; }

#cue-control-go .cue-sent-response-pending::-webkit-slider-runnable-track {
  background: #5fa36f; }

#cue-control-go .cue-sent-response-success::-webkit-slider-runnable-track {
  background: #28a745; }

#cue-control-go .cue-sent-response-error::-webkit-slider-runnable-track {
  background: #dc3545; }

#cue-control-go:disabled::-webkit-slider-runnable-track {
  background: #6C8CA8; }

#cue-control-go::-webkit-slider-thumb {
  box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  border: 1px solid #000000;
  height: 50px;
  width: 75px;
  border-radius: 50px;
  background: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: 0px; }

#cue-control-go:focus::-webkit-slider-runnable-track {
  background: #367ebd; }

#cue-control-go::-moz-range-track {
  width: 100%;
  height: 50px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #3071a9;
  border-radius: 0px;
  border: 0px solid #010101; }

#cue-control-go::-moz-range-thumb {
  box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  border: 1px solid #000000;
  height: 50px;
  width: 75px;
  border-radius: 50px;
  background: #ffffff;
  cursor: pointer; }

#cue-control-go::-ms-track {
  width: 100%;
  height: 50px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent; }

#cue-control-go::-ms-fill-lower {
  background: #2a6495;
  border: 0px solid #010101;
  border-radius: 0px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; }

#cue-control-go::-ms-fill-upper {
  background: #3071a9;
  border: 0px solid #010101;
  border-radius: 0px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; }

#cue-control-go::-ms-thumb {
  box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  border: 1px solid #000000;
  width: 75px;
  border-radius: 50px;
  background: #ffffff;
  cursor: pointer;
  height: 50px; }

#cue-control-go:focus::-ms-fill-lower {
  background: #3071a9; }

#cue-control-go:focus::-ms-fill-upper {
  background: #367ebd; }

  /* end of Slider style */
</style>

<!-- Keeping this as a component cause it will likely need switching out -->
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
        <label for="urlSelect">Select Dev Mode</label>
        <select bind:value={serverURL} size= "1" class="form-control" id="urlSelect" name="selector">
          <option value="https://staging.cohort.rocks/api/v2">Production</option>
          <option value="http://localhost:3000/api/v2">Development</option>
        </select>
      </div>
      
    </form>
  </div>
  {/if}
</div>

<!-- #eventsList allows a list of events to be built and shown -->

<div id="eventsList">
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12 text-center mt-4">
        <h1>Events</h1>
      </div>
    </div>
    <hr />

    {#if events.length === 0}
      <p> That's uneventful. Sorry, no events have been added yet</p>
    {:else}
      {#each events as event}
        <div class="row mt-2">
          <div class="col-6 text-center">
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

<!-- //occasions list populated by looping through events of "focused" event ID -->
<div id="occasionList">
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 mt-2">
        <button
		      alt="back to events list"
          type="button"
          class="btn btn-outline-primary float-left mr-2"
          value="occasionList"
          on:click={backToEvents}>
		  <span class="fa fa-angle-left" />
          Back
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col-12 text-center">
        <h3>Occasions</h3>
      </div>
    </div>

    <hr />
    {#if focusedEvent != undefined}
      {#if focusedEvent.occasions.length === 0}
        <p>No occasions for this event yet</p>
      {:else}
        {#each events as event}
          {#if event.label == focusedEventLabel && event.occasions != null && event.occasions.length > 0}
            {#each event.occasions as occasion (occasion.id)}
                <div class="row">
                  <div class="col">
                    <button
                      alt="click here for details"
                      type="button"
                      id={occasion.id}
                      class="btn btn-outline-primary btn-block"
                      value={occasion.id}
                      on:click={occasionButton}>
                      <h3 class="m-0">{event.label}  - {occasion.label} </h3>
                      <h5>{occasion.locationCity} - {moment(occasion.startDateTime).format("LL")} - id:{occasion.id}</h5>	
                    </button>
                  </div>
                </div>
            {/each}

          {/if}

        {/each}
      {/if}
    {/if}
  </div>
</div>

<div id="openOccasion">
  <div class="container-fluid">
    <div class="row">
      <div class="col-4 mt-2">
        <button
		  alt="back to occasions list"
          type="button"
          class="btn btn-outline-primary"
          value="openOccasion"
          on:click={backToCloseOccasion}>
		  <span class="fa fa-angle-left" />
          Back
        </button>
      </div>
    </div>
    <!-- </div> -->
    
      {#if gotEvents == true}
      <div class="row">
        <div class="col-12 text-center">
          <h3>{focusedEvent.label} - {formattedStartTime}</h3>
        </div>
      </div>
      {/if}
   
    <hr />

    <div class="row ">
      <div class="col-md-12">
        <button
          type="button"
          class="btn btn-outline-danger btn-block"
          on:click={confirmEnd}>
          End Occasion
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <button
          type="button"
          class="btn btn-outline-primary btn-block"
          value="openOccasion"
          on:click={showQR}>
          <u>Show QR Code</u>
        </button>
      </div>
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
          {#each focusedEvent.episodes[0].cues as cue}
           
            {#if cue.cueNumber == cueState}
            
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
      <!-- <div class="col-4 col-md-3"> -->
      <div class="col-12 d-flex justify-content-between">
        <button
          type="button"
          class="btn btn-info"
          value="previous"
          on:click={changeCueState}><span class="fas fa-angle-left"/>&nbsp;Previous</button>
      <!-- </div> -->
      <!-- <div class="col-4 col-md-3"> -->
        <button
          type="button"
          class="btn btn-info"
          value="next"
          on:click={changeCueState}>
         &nbsp;&nbsp;Next&nbsp;<span class="fas fa-angle-right" /> &nbsp;&nbsp;
        </button>
      </div>
      <!-- </div> -->
    </div>

    <div class="row mt-3">
      <div class="col-md-12">
         <div class="text-center">
        <label for="cue-control-go">Drag slider to the right to fire cue</label>
        <input class="cue-controls__cue-controls-go" type="range" min="0" max="100" value="0" id="cue-control-go" onchange=onCueSliderInput(event) v-bind:disabled="selectedOccasion == null">
    </div>
      </div>
    </div>
     {/if}
  {/if} 
  </div>
</div>

<div id="QRcode">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <button
          type="button"
          class="close"
          data-dismiss="modal"
          aria-label="Close"
          value="QRcode"
          on:click={backToOccasionList}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-12 text-center">
              <div id = "QRcodeContainer">
                <!-- QR code populated here -->

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="closeOccasion">
  <div class="container-fluid">
    <div class="row">
      <div class="col-4 col-md-4 mt-2">
        <button
        alt="back to Occasions list"
        type="button"
        class="btn btn-outline-primary"
        value="closeOccasion"
        on:click={backToOccasionList}>
        <span class="fa fa-angle-left" />
        Back
        </button>
      </div>
    </div>
      <div class="row">

        {#if gotEvents == true}
          <div class="col-12 text-center">
            <h3>
              {focusedEvent.label} - {formattedStartTime}.
            </h3>
          </div>
        
        {/if}
    </div>
    <hr>
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
		  <hr>
		  <li>
			<button
				alt="link to QR Code"
				type="button"
				class="btn btn-link"
				value="closeOccasion"
				on:click={showQR}>
				Get QR Code
        	</button>
		  </li>
		  <hr>
        </ul>
      </div>
    </div>
	<div class="row">
      <div class="col-md-12">
        <button
          type="button"
          class="btn btn-outline-success btn-block"
          on:click={openOccasionButton}>
          Open Occasion
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <button
          type="button"
          class="btn btn-outline-danger btn-block"
          on:click={confirmOccasionDelete}>
          Delete Occasion
        </button>
      </div>
    </div>
  </div>
</div>

<!-- //modals show/hide not working, so removed below so they can act as a static document 
<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true"></div> -->
<div id="confirmDelete">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="deleteOccasionConfirmation">
          Delete Occasion
        </h5>
        <button
          type="button"
          class="close"
          data-dismiss="modal"
          aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      {#if gotEvents == true}
      <div class="modal-body">
        Are you sure you want to delete {focusedEvent.label} - {formattedStartTime}
        ?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" on:click={cancelDelete}>
          Cancel
        </button>
        <button type="button" class="btn btn-outline-danger" on:click={deleteOccasion}>
          Delete Occasion
        </button>
      </div>
      {/if}
    </div>
  </div>
</div>

<div id="confirmEndOccasion">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="deleteOccasionConfirmation">
          End Occasion
        </h5>
      </div>

      {#if gotEvents == true}
      <div class="modal-body">
        Are you sure you want to end {focusedEvent.label} - {formattedStartTime}
        ?
      </div>
      <div class="modal-footer">
        <button 
		  type="button" 
		  class="btn btn-outline-secondary" 
		  on:click={cancelEnd}>
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-outline-danger"
          value="confirmEndOccasion"
          on:click={backToEvents}>
          End Occasion
        </button>
      </div>
      {/if}
    </div>
  </div>

</div>
