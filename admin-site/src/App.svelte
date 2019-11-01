<script>
	import Login from './Login.svelte';
	import Slider from './Slider.svelte';
	import moment from 'moment';

	
	let events =[{
					"id": 1,
					"label": "LOT X",
				//"heroImage": URL-TO-IMG, // optional
					"occasions": [
						{
						"id": 1,
						"event_id": 1,
						"state": "closed", // can be open or closed; closed events cannot be joined
						"startDateTime": "2019-05-23T17:00:00.000Z", // stored in UTC, browser does conversion
						"doorsOpenDateTime": "2019-05-23T16:30:00.000Z",
						"endDateTime": "2019-05-29T03:50:00.000Z",
						"locationLabel": "Show #5",
						"locationAddress": "125 Emerson Ave, Toronto ON, M6H 3S7",
						"locationCity": "Toronto",
						"publicURL": "https://cohort.rocks/api/v2/events/1/occasions/3", // for making QR code to join the event
						"devices": [
							{
							"id": 1,
							"guid": "dklfjdklf-dfd-f-df-dfdfdfas-3r3r-fdf3",
							"apnsDeviceToken": null, // not used for now -- this is for push notifications
							"isAdmin": true, // here for now -- the admin site will connect to an occasion as a device
							"tags": ["blue", "1984"]
							}
						]
					},
					{
						"id": 2,
						"event_id": 1,
						"state": "closed", // can be open or closed; closed events cannot be joined
						"startDateTime": "2019-05-23T17:00:00.000Z", // stored in UTC, browser does conversion
						"doorsOpenDateTime": "2019-05-23T16:30:00.000Z",
						"endDateTime": "2019-05-29T03:50:00.000Z",
						"locationLabel": "Show #5",
						"locationAddress": "125 Emerson Ave, Toronto ON, M6H 3S7",
						"locationCity": "Toronto",
						"publicURL": "https://cohort.rocks/api/v2/events/1/occasions/3", // for making QR code to join the event
						"devices": [
							{
							"id": 1,
							"guid": "dklfjdklf-dfd-f-df-dfdfdfas-3r3r-fdf3",
							"apnsDeviceToken": null, // not used for now -- this is for push notifications
							"isAdmin": true, // here for now -- the admin site will connect to an occasion as a device
							"tags": ["blue", "1984"]
							}
						]
					}
				],
				"cues": [
					{
					"mediaDomain": 0, // enum: audio, video, text, light, haptic
					"cueNumber": 1,
					"cueAction": 0, // enum: play/on, pause, restart, stop/off
					"targetTags": ["all"]
					},
					{
					"mediaDomain": 0, // enum: audio, video, text, light, haptic
					"cueNumber": 2,
					"cueAction": 0, // enum: play/on, pause, restart, stop/off
					"targetTags": ["all"]
					}
				]
			},];

//for new event creation parameters
	let label = '';

	let cueState = 1;
//Holds event ID in order to display occasions for that event
	let focusedEventID="0";
	let focusedOccasionID="0";
	let focusedEvent=events[0];
	let focusedOccasion="0";
//holdformatted time
	let formattedStartTime = "";
	let formattedEndTime = "";
//only works if id numbers are set in order (currently starting from 1)
	let indexInEvents;
	let indexInOccasions;

// when an event button is hit only open occasions for that event
	function eventButton(){
		document.getElementById("eventsList").style.display = "none";
		document.getElementById("occasionList").style.display = "block";
		focusedEventID = this.value;
		//first event must have id of 1 and then ++
		indexInEvents = focusedEventID - 1;
		focusedEvent = events[indexInEvents];
	}


	function occasionButton(){
		focusedOccasionID= this.value;
		document.getElementById("occasionList").style.display = "none";
		document.getElementById("closeEvent").style.display = "block";
		//first occasion must have id of 1 and then ++
		indexInOccasions = focusedOccasionID - 1;
		focusedOccasion = focusedEvent.occasions[indexInOccasions];
		formattedStartTime = moment(focusedOccasion.startDateTime).add(1, 'day').format('LLL');
		formattedEndTime = moment(focusedOccasion.endDateTime).add(1, 'day').format('LLL');
	}
//these are navigation buttons..not very elegant and partly due to modals not working
	function openOccasionButton(){
		document.getElementById("closeEvent").style.display = "none";
		document.getElementById("openEvent").style.display = "block";
	}

	function confirmOccasionDelete(){
		document.getElementById("closeEvent").style.display = "none";
		document.getElementById("confirmDelete").style.display = "block";
	}
	function cancelDelete(){
		document.getElementById("confirmDelete").style.display = "none";
		document.getElementById("closeEvent").style.display = "block";
	}

	function deleteOccasion(){
		// deletion code goes here
		document.getElementById("confirmDelete").style.display = "none";
		document.getElementById("eventsList").style.display = "block";
		//removes occasion from object and from list
		focusedEvent.occasions.splice(indexInOccasions,1);
		document.getElementById(focusedOccasionID).remove();

	}
	function backToEvents(){
		let id =this.value;
		document.getElementById(id).style.display = "none";
		document.getElementById("eventsList").style.display = "block";
	}
	function cancelEnd(){
		
		document.getElementById("confirmEndOccasion").style.display = "none";
		document.getElementById("openEvent").style.display = "block";
	}
	function confirmEnd(){
		
		document.getElementById("openEvent").style.display = "none";
		document.getElementById("confirmEndOccasion").style.display = "block";
	}

	function backToOccasionList() {
		let id = this.value;
		document.getElementById(id).style.display = "none";
		document.getElementById("occasionList").style.display = "block";
		
	}
	function showQR(){
		let id = this.value;
		document.getElementById(id).style.display = "none";
		document.getElementById("QRcode").style.display = "block";

	}

//this changes which cue details are shown
	function changeCueState(){
		let direction = this.value;
		if(direction == "next" && cueState <= focusedEvent.cues.length-1){
			cueState += 1;
		} else if(direction == "previous" && cueState > 1){
			cueState -= 1;
		} else {
			cueState = 1;
		}	
	}

/////for new event generation
	function setTitle(event){
		label = event.target.value;
	}

//whichever parameters we want to be able to build for new events from the site would go below
	function createEvent(){
		let newEvent = [{
				label:label
			}];
		events = events.concat(newEvent);
	}
////////
</script>

<style>
	#eventsList, #closeEvent,#openEvent, #occasionList, #QRcode, #confirmDelete, #confirmEndOccasion {
		display: none;
	}
	
	.list-item{
		margin-bottom: 0.4rem;
	}
	#createEventInput{
		padding-left:0;
	}
</style>


<!-- Keeping this as a component cause it will likely need switching out -->
<div id = "login">
	<Login />

</div>

<!-- #eventsList allows a list of events to be built and shown -->

<div id = "eventsList">
	<div class="container-fluid">
		<div class="row">
			<div class="col-md-12 text-center">
				<h1>Events</h1>
			</div>
		</div>
	<hr>
	
	{#if events.length === 0}
		<p>No events have been added yet</p>
		{:else}
			{#each events as event}
			<div class="row list-item">
				<div class="col-md-12">
					<button type="button" class= 'btn btn-primary btn-block' value = {event.id} on:click={eventButton} >
						<h3>{event.label}</h3>	
					</button>
				</div>
			</div>
			{/each}
	{/if}
		
	<hr>

		<!-- event creation -->
		<form>
		<div class="form-group row">
			<label class="col-sm-4 col-md-2 col-form-label text-center" style="padding-right:0" for="title"> New Event Name</label> 
			<div class="col-sm-12 col-md-3" id="createEventInput">
				<input type="text" id="title" class="form-control" value={label} on:input={setTitle}>
			</div>
			<div class="col-md-3">
				<button class = "btn btn-primary" on:click={createEvent}>Create New Event</button>
			</div>
		</div>
		
  			
	
			
		</form>
 

	</div>
</div>

<!-- //occasions list populated by looping through events of "focused" event ID -->
<div id = "occasionList">
	<div class="container-fluid">
		<div class="row">
			<div class="col-md-3">
				<button type="button" class="btn btn-primary" value ="occasionList" on:click={backToEvents}>Back To Events List</button>
			</div>
		</div>
		<div class="row">
			<div class="col-md-12 text-center">
				<h1>Occasions</h1>
			</div>
		</div>
		
		<hr>
		{#if events.length === 0}
			<p>No occasions for this event yet</p>
			{:else}
					{#each events as event}
							{#if event.id == focusedEventID && event.occasions != null && event.occasions.length > 0}
								{#each event.occasions as occasion}	
								<div class="row list-item">
									<div class="col-md-12">
									<button type="button" id={occasion.id} class= 'btn btn-primary btn-block' value = {occasion.id} on:click={occasionButton}>
										<h3>{event.label} - Occasion # {occasion.id} </h3>
									</button>
									</div>
								</div>
								{/each}
							{/if}
					{/each}
		{/if}
	</div>
</div>



<div id = "openEvent">
	<div class="container-fluid">
			<div class="row">
				<div class="col-md-3">
					<button type="button" class="btn btn-primary" value = "openEvent" on:click={backToOccasionList}>Back To Occasion List</button>
				</div>
			</div>
			<div class="row">
				<div class="col-md-12 text-center">
					<h5> {focusedEvent.label} - {formattedStartTime}</h5>
				</div>
			</div>
			<hr>

			<div class="row list-item">
				<div class="col-md-12">
					<button type="button" class="btn btn-danger btn-block" on:click={confirmEnd}>End Occasion</button>
				</div>
			</div>

			<div class="row list-item">
				<div class="col-md-12">
					<button type="button" class="btn btn-primary btn-block" value="openEvent" on:click={showQR}><u>Show QR Code</u></button>
				</div>
			</div>

			<div class="row">
				<div class="col-md-12">
					<h5>Cue Details</h5>
					{#if focusedEvent != "undefined"}
						{#each focusedEvent.cues as cue }
							{#if cue.cueNumber == cueState}
								<div id = "{cue.cueNumber}">
									<ul>Media Domain: {cue.mediaDomain}</ul>
									<ul>Cue Number: {cue.cueNumber}</ul>
									<ul>Cue Action: {cue.cueAction}</ul>
								</div>
							{/if}
						{/each}
					{/if}
					
				</div>
			</div>

			<div class="row">
				<div class="col-md-6">
					<button type="button" class="btn btn-info btn-block" value="previous" on:click={changeCueState}>
						<span class="fas fa-angle-left"></span>
						Previous
					</button>
				</div>
				<div class="col-md-6">
					<button type="button" class="btn btn-info btn-block" value="next" on:click={changeCueState}>
						Next
						<span class="fas fa-angle-right"></span>
					</button>
				</div>
			</div> 

			<div class="row">
				<div class="col-md-12">
					<Slider/>
				</div>
			</div>
	</div>
</div>

<div id = "QRcode">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close" value= "QRcode" on:click={backToOccasionList}>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-12 text-center">
							<img src="QrCodes/Event1.png " class="img-fluid" alt="QR Code for">
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<div id = "closeEvent">
	<div class="container-fluid">
			<div class="row">
				<button type='button' class="btn btn-primary" value="closeEvent" on:click={backToOccasionList}>Back To Occasions List</button>
			</div>
			<div class="row">
				<div class="col-md-12 text-center">
        			<h5 class="modal-title">{focusedEvent.label} - {formattedStartTime}.</h5>
				</div>
			</div>
			<div class="row">
				<div class="col-md-12">
					<label for="OccasionDetails"><h4>Occasion Details</h4></label>
					<ul id="OccasionDetails">
						<li>Start Date : {formattedStartTime}</li>
						<li>End Date : {formattedEndTime}</li>
						<li>Location Label: {focusedOccasion.locationLabel} </li>
						<li>Location Address: {focusedOccasion.locationAddress} </li>
						<li>Location City: {focusedOccasion.locationCity} </li>
					</ul> 	
				</div>
			</div>
			<div class="row list-item">
				<div class="col-md-12">
					<button type="button" class="btn btn-danger btn-block" on:click={confirmOccasionDelete}>Delete Occasion</button>
				</div>
			</div>
			<div class="row list-item">
				<div class="col-md-12">
					<button type="button" class="btn btn-success btn-block" on:click={openOccasionButton}>Open Occasion</button>
				</div>
			</div>
			<div class="row list-item">
				<div class="col-md-12">
					<button type="button" class="btn btn-primary btn-block" value ="closeEvent" on:click={showQR}>Get QR Code</button>
				</div>
			</div>
	</div>
</div>

<!-- //modals show/hide not working, so removed below so they can act as a static document 
<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true"></div> -->
<div id ="confirmDelete">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="deleteOccasionConfirmation">Confirmation</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        Are you sure you want to delete {focusedEvent.label} - {formattedStartTime} ?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={cancelDelete}>Cancel</button>
        <button type="button" class="btn btn-primary" on:click = {deleteOccasion}>Delete Occasion</button>
      </div>
    </div>
  </div>
</div>

<div id ="confirmEndOccasion">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="deleteOccasionConfirmation">Confirmation</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        Are you sure you want to end {focusedEvent.label} - {formattedStartTime} ?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={cancelEnd}>Cancel</button>
        <button type="button" class="btn btn-primary" value="confirmEndOccasion" on:click = {backToEvents}>End Occasion</button>
      </div>
    </div>
  </div>

</div>
