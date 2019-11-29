<script>
  import Login from "./Login.svelte";
  import Slider from "./Slider.svelte";
  import moment from "moment";
  import { onMount } from 'svelte';
  import { createEventDispatcher } from "svelte";

  let events = []
  let gotEvents = false

  // // TODO this needs to pickup an environment somehow (dev/staging/prod)
  // // let serverURL = "http://staging.cohort.rocks/api/v2"
  let serverURL = "http://localhost:3000/api/v2";

  onMount( async () => {
    let response = await fetch(serverURL + "/events", {
      method: 'GET'
    })

    events = await response.json()
    gotEvents = true
    focusedEvent = events[0]
  })

  // let events = [
  //   {
  //     id: 1,
  //     label: "LOT X",
  //     //"heroImage": URL-TO-IMG, // optional
  //     occasions: [
  //       {
  //         id: 1,
  //         event_id: 1,
  //         state: "closed", // can be open or closed; closed events cannot be joined
  //         startDateTime: "2019-05-23T17:00:00.000Z", // stored in UTC, browser does conversion
  //         doorsOpenDateTime: "2019-05-23T16:30:00.000Z",
  //         endDateTime: "2019-05-29T03:50:00.000Z",
  //         locationLabel: "Show #5",
  //         locationAddress: "125 Emerson Ave, Toronto ON, M6H 3S7",
  //         locationCity: "Toronto",
  //         publicURL: "https://cohort.rocks/api/v2/events/1/occasions/3", // for making QR code to join the event
  //         devices: [
  //           {
  //             id: 1,
  //             guid: "dklfjdklf-dfd-f-df-dfdfdfas-3r3r-fdf3",
  //             apnsDeviceToken: null, // not used for now -- this is for push notifications
  //             isAdmin: true, // here for now -- the admin site will connect to an occasion as a device
  //             tags: ["blue", "1984"]
  //           }
  //         ]
  //       },
  //       {
  //         id: 2,
  //         event_id: 1,
  //         state: "closed", // can be open or closed; closed events cannot be joined
  //         startDateTime: "2019-06-28T17:00:00.000Z", // stored in UTC, browser does conversion
  //         doorsOpenDateTime: "2019-06-28T16:30:00.000Z",
  //         endDateTime: "2019-07-10T03:50:00.000Z",
  //         locationLabel: "Show #5",
  //         locationAddress: "125 Emerson Ave, Toronto ON, M6H 3S7",
  //         locationCity: "Toronto",
  //         publicURL: "https://cohort.rocks/api/v2/events/1/occasions/3", // for making QR code to join the event
  //         devices: [
  //           {
  //             id: 1,
  //             guid: "dklfjdklf-dfd-f-df-dfdfdfas-3r3r-fdf3",
  //             apnsDeviceToken: null, // not used for now -- this is for push notifications
  //             isAdmin: true, // here for now -- the admin site will connect to an occasion as a device
  //             tags: ["blue", "1984"]
  //           }
  //         ]
  //       }
  //     ],
  //     cues: [
  //       {
  //         mediaDomain: 0, // enum: audio, video, text, light, haptic
  //         cueNumber: 1,
  //         cueAction: 0, // enum: play/on, pause, restart, stop/off
  //         targetTags: ["all"]
  //       },
  //       {
  //         mediaDomain: 0, // enum: audio, video, text, light, haptic
  //         cueNumber: 2,
  //         cueAction: 3, // enum: play/on, pause, restart, stop/off
  //         targetTags: ["all"]
  //       }
  //     ]
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

  // when an event button is hit only open occasions for that event
  function eventButton() {
    document.getElementById("eventsList").style.display = "none";
    document.getElementById("occasionList").style.display = "block";
    focusedEventLabel = this.value;
    indexInEvents = events.findIndex(event => event.label === focusedEventLabel);
    focusedEvent = events[indexInEvents];
  }
  
  function occasionButton() {
    document.getElementById("occasionList").style.display = "none";
    document.getElementById("closeOccasion").style.display = "block";
    focusedOccasionID = this.value;
    indexInOccasions = focusedEvent.occasions.findIndex(x => x.id == focusedOccasionID);
    focusedOccasion = focusedEvent.occasions[indexInOccasions];

	  formattedStartTimeFull = moment(focusedOccasion.startDateTime)
	    .add(1, "day")
      .format("LLL");
    formattedEndTimeFull = moment(focusedOccasion.endDateTime)
      .add(1, "day")
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
  function showQR() {
    let id = this.value;
    //grab QR code for that occasion and update
    //  let QrResponse = async () => { 
    //   await fetch(serverURL + "/" + focusedOccasion + "/" + focusedOccasionID + "/qrcode", {
    //   method: 'GET'
    //   });
    //   let qrcode = await QrResponse.text()
    //   let qrContainer = document.getElementById("QRcodeContainer")
    //   qrContainer.innerHTML = qrcode
    // };

    let QrResponse = async () => { 
      await fetch(serverURL + "/occasions/3/qrcode", {
      method: 'GET'
      });
      let qrcode = await QrResponse.text()
      let qrContainer = document.getElementById("QRcodeContainer")
      qrContainer.innerHTML = qrcode
    };

    document.getElementById(id).style.display = "none";
    document.getElementById("QRcode").style.display = "block";
  }

  //this changes which cue details are shown
  function changeCueState() {
    let direction = this.value;
    if (direction == "next" && cueState <= focusedEvent.cues.length - 1) {
      cueState += 1;
    } else if (direction == "previous" && cueState > 1) {
      cueState -= 1;
    } else {
      cueState = 1;
    }
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
  ////////
  
  // function changeTime(date){
  //   formattedTime = moment(date).format("LL");
	//   console.log(formattedTime);
  // };

  
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

</style>

<!-- Keeping this as a component cause it will likely need switching out -->
<div id="login">
  <Login />

</div>

<!-- #eventsList allows a list of events to be built and shown -->

<div id="eventsList">
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12 text-center mt-2">
        <h1>Events</h1>
      </div>
    </div>
    <hr />

    {#if events.length === 0}
      <p>No events have been added yet</p>
    {:else}
      {#each events as event}
        <div class="row mt-2">
          <div class="col text-center">
            <h3>{event.label}:</h3>
          </div>
          <div class="col">
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
    <div class="input-group mb-auto">
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
    </div>

  </div>
</div>

<!-- //occasions list populated by looping through events of "focused" event ID -->
<div id="occasionList">
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <button
		      alt="back to events list"
          type="button"
          class="btn btn-outline-primary float-left mr-2"
          value="occasionList"
          on:click={backToEvents}>
		  <!-- <span class="fa fa-angle-double-left" /> -->
          Back
        </button>
        <h1>Occasions</h1>
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
                      <h3 class="m-0">{event.label} - Occasion # {occasion.id}</h3>
                      <h5>{occasion.locationCity} - {moment(occasion.startDateTime).format("LL")}</h5>	
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
      <div class="col-4">
        <button
		  alt="back to occasions list"
          type="button"
          class="btn btn-outline-primary"
          value="openOccasion"
          on:click={backToOccasionList}>
		  <span class="fa fa-angle-double-left" />
          Back
        </button>
      </div>
    <!-- </div>
    <div class="row"> -->
      {#if gotEvents == true}
        <div class="col-12 col-md-4 text-center">
          <h3>{focusedEvent.label} - {formattedStartTime}</h3>
        </div>
      {/if}
	  <div class="col-4 text-center">
        
      </div>
    </div>
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

    <div class="row">
      <div class="col-md-12">
        <h5>Cue Details</h5>
        <p>{focusedEvent}</p>
        {#if focusedEvent != null && focusedEvent !== undefined}
          {#each focusedEvent.cues as cue}
           
            {#if cue.cueNumber == cueState}
              <div id={cue.cueNumber}>
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
          Next<span class="fas fa-angle-right" />
        </button>
      </div>
      <!-- </div> -->
    </div>

    <div class="row mt-3">
      <div class="col-md-12">
        <Slider />
      </div>
    </div>
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
	  <div class="col-4 col-md-4">
	    <button
			alt="back to Occasions list"
			type="button"
			class="btn btn-outline-primary"
			value="closeOccasion"
			on:click={backToOccasionList}>
			<span class="fa fa-angle-double-left" />
			Back
	    </button>
	  </div>
	<!-- </div>
    <div class="row"> -->

      {#if gotEvents == true}
        <div class="col-12 col-md-4 text-center">
          <h3>
            {focusedEvent.label} - {formattedStartTime}.
          </h3>
        </div>
      {/if}
	  <div class="col-4 text-center">
        
      </div>
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
