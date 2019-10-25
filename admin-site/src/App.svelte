<script>
	import Login from './Login.svelte';
	import Slider from './Slider.svelte';

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
					}
				],
				"cues": [
					{
					"mediaDomain": 0, // enum: audio, video, text, light, haptic
					"cueNumber": 1,
					"cueAction": 0, // enum: play/on, pause, restart, stop/off
					"targetTags": ["all"]
					}
				]
			}];

//for new event creation parameters
	let label = '';

//Holds event ID in order to display occasions for that event
	let focusedEventID="0";
	let focusedOccasionID="0";
	let focusedEvent="0";
	let focusedOccasion="0";
//only works if id numbers are set in order (currently starting from 1)
	let indexInEvents;
	let indexInOccasions;

// when an event button is hit only open occasions for that event
	function eventButton(){
		document.getElementById("eventsList").style.display = "none";
		document.getElementById("occasionList").style.display = "block";
		focusedEventID = this.value;
		indexInEvents = focusedEventID - 1;
		focusedEvent = events[indexInEvents];
		

	}

	function occasionButton(){
		focusedOccasionID= this.value;
		document.getElementById("occasionList").style.display = "none";
		document.getElementById("closeEvent").style.display = "block";
		
		indexInOccasions = focusedOccasionID - 1;
		focusedOccasion = focusedEvent.occasions[indexInOccasions];
		
	}

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
	}
	function endOccasion(){
		// end occasion code goes here
		document.getElementById("confirmEndOccasion").style.display = "none";
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

/////for new event generation
	function setTitle(event){
		label = event.target.value;
	}

	function createEvent(){
		let newEvent = [{
				label:label
			}];
		events = events.concat(newEvent);
		console.log(events);
	}
////////
</script>

<style>
	#eventsList, #closeEvent,#openEvent, #occasionList, #QRcode, #confirmDelete, #confirmEndOccasion {
		display: none;
	}
	
	
</style>


<!-- Keeping this as a component cause it will likely need switching out -->
<section id = "login">
	<Login />

</section>

<!-- #eventsList allows a list of events to be built and shown -->

<section id = "eventsList">
	<h1>Events</h1>
	<hr>
		{#if events.length === 0}
			<p>No events have been added yet</p>
			{:else}
					{#each events as event}
					
						<button type="button" class= 'btn btn-primary btn-block' value = {event.id} on:click={eventButton} >
							<h3>{event.label}</h3>	
						</button>
					
					{/each}
		{/if}
<!-- event creation -->
		<hr>
		<div>
			<label for="title">New Event Name</label> 
			<input type="text" id="title" value={label} on:input={setTitle}>  
		</div>
		<button class = "btn btn-primary" on:click={createEvent}>Create New Event</button>
</section>


<div id = "occasionList">
	<section>
	<h1>Occasions</h1>
	<hr>
		{#if events.length === 0}
			<p>No events have been added yet</p>
			{:else}
					{#each events as event}
							{#if event.id == focusedEventID && event.occasions != null}
								{#each event.occasions as occasion}	
									<button type="button" class= 'btn btn-primary btn-block' value = {occasion.id} on:click={occasionButton}>
										<h3>{event.label} - {occasion.startDateTime}</h3>	
									</button>
								{/each}
							{/if}
					{/each}
		{/if}
	</section>
</div>



<div id = "openEvent">
	<div class="container-fluid">
			<div class="row">
				<h5> {focusedEvent.label} - {focusedOccasion.startDateTime}</h5>
			</div>

			<div class="row">
				<div class="col-md-12">
					<button type="button" class="btn btn-primary btn-block" value = "openEvent" on:click={backToOccasionList}>Back To Occasion List</button>
				</div>
			</div>
			<hr>

			<div class="row">
				<div class="col-md-12">
					<button type="button" class="btn btn-danger btn-block" on:click={confirmEnd}>End Occasion</button>
				</div>
			</div>

			<div class="row">
				<div class="col-md-12">
					<button type="button" class="btn btn-primary btn-block" value="openEvent" on:click={showQR}><u>Show QR Code</u></button>
				</div>
			</div>

			<div class="row">
				<div class="col-md-12">
					<label for="cueDetails"><h5>Cue Details</h5></label>
					<ul id="cueDetails">
						<li>focusedOccasion.</li>
					</ul>
				</div>
			</div>

			<div class="row">
				<div class="col-md-6">
					<button type="button" class="btn btn-info btn-block">
						<span class="glyphicon glyphicon-chevron-left"></span>
						Previous
					</button>
				</div>
				<div class="col-md-6">
					<button type="button" class="btn btn-info btn-block">
						<span class="glyphicon glyphicon-chevron-right"></span>
						Next
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
				<div class="col-md-12">
        			<h5 class="modal-title">{focusedEvent.label} - {focusedOccasion.startDateTime}.</h5>
				</div>
			</div>
			<div class="row">
				<div class="col-md-12">
					<label for="OccasionDetails"><h4>Occasion Details</h4></label>
					<ul id="OccasionDetails">
						<li>Start Date : {focusedOccasion.startDateTime}</li>
						<li>End Date : {focusedOccasion.endDateTime}</li>
						<li>Location Label: {focusedOccasion.locationLabel} </li>
						<li>Location Address: {focusedOccasion.locationAddress} </li>
						<li>Location City: {focusedOccasion.locationCity} </li>
					</ul> 	
				</div>
			</div>
			<div class="row">
				<div class="col-md-12">
					<button type="button" class="btn btn-danger btn-block" on:click={confirmOccasionDelete}>Delete Occasion</button>
				</div>
			</div>
			<div class="row">
				<div class="col-md-12">
					<button type="button" class="btn btn-success btn-block" on:click={openOccasionButton}>Open Occasion</button>
				</div>
			</div>
			<div class="row">
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
        Are you sure you want to delete {focusedEvent.label} - {focusedOccasion.startDateTime} ?
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
        Are you sure you want to end {focusedEvent.label} - {focusedOccasion.startDateTime} ?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={cancelEnd}>Cancel</button>
        <button type="button" class="btn btn-primary" on:click = {endOccasion}>End Occasion</button>
      </div>
    </div>
  </div>

</div>
