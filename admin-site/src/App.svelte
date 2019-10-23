<script>
	import Login from './Login.svelte';
	import Event from './Events.svelte';
	import Slider from './Slider.svelte';


	const LotX =  {
       "EventName": "LotX",
       "EventDetails": "Two performances of Heidi Strauss' LotX",
       "EventQrCode": "./QrCodes/Event1.png",
       "OccasionDates": [ 
			"October 20th, 2019",
        	"October 21st, 2019"
       ],
    	"cue1":{
             "cueName": "Star Wars Sound Go",
             "cueDetails": "Cue Star Wars theme when the Jedi enter stage left",
             "mediaDomain": 0,
             "cueNumber": 1,
             "cueAction": 0,
             "targetTags": [
                "all"
             ]
          },
          "cue2":{
             "cueName": "Star Wars Sound Stop",
             "cueDetails": "Stop Star Wars theme when the Jedi exits stage right",
             "mediaDomain": 0,
             "cueNumber": 1,
             "cueAction": 3,
             "targetTags": [
                "all"
			 ]
		  }  
    };
	
	
	
	
	let title = '';
	
	
	const SoundCue = {
		title: "Lotx - October 24th, 2019",
	}
	
	let events =[LotX];

	function setTitle(event){
		title = event.target.value;
	}

	function createEvent(){
		const newEvent = {
			title:title, 
		};
		events = events.concat(newEvent);
	}
</script>

<style>
	/* #eventsList{
		visibility: hidden;
	} */
	
</style>

<!-- Display login first, and then logic to switch to #eventslist is in Login.svelte -->
<!-- Keeping this as a component cause it will likely need switching out -->
<section id = "login">
	<Login />

</section>

<!-- #eventsList allows a list of events to be built and shown -->
<div id = "eventsList">
	<section>
	<hr>
	<h1>Occasions</h1>
		{#if events.length === 0}
			<p>No events have been added yet</p>
			{:else}
			{#each events as event}
				<!-- <Event 
					eventTitle={event.title}
				/> -->
				{#if event.OccasionDates.length > 0}
					{#each event.OccasionDates as occasion}
				<button type="button" class= 'btn btn-primary btn-block' >
        			<h3>{event.EventName} - {occasion}</h3> 
    			</button>
					{/each}
				{/if}
			{/each}
		{/if}
	</section>

<!-- event creation -->
	<section>
	<hr>
		<div>
			<label for="title">New Occasion Name</label> 
			<input type="text" id="title" value={title} on:input={setTitle}>  
		</div>
		<button class = "btn btn-primary" on:click={createEvent}>Create New Occasion</button>
	</section>
</div>

<!-- Not yet ready to self populate if more events are added -->
<div id = "openEvent">
	<!-- <div class="modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"> -->
  		<div class="modal-dialog modal-lg">
    		<div class="modal-content">
				<div class="modal-header">
        			<h5 class="modal-title">{events[0].EventName} - {events[0].cue1.cueName}</h5>
        				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
          					<span aria-hidden="true">&times;</span>
        				</button>
      			</div>

				<div class="modal-body">
					<div class="container-fluid">
						<div class="row">
							<div class="col-md-12">
								<button type="button" class="btn btn-danger btn-block">Close Event</button>
							</div>
						</div>
						<div class="row">
							<div class="col-md-12">
								<button type="button" class="btn btn-primary btn-block"><u>Show QR Code</u></button>
							</div>
						</div>
						<div class="row">
							<div class="col-md-12">
								<label for="cueDetails"><h5>Cue Details</h5></label>
								<p id="cueDetails">{LotX.cue1.cueDetails}
								</p>
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

                		<Slider/>
              		</div>
					  <!-- end of body -->
      			</div>
				<!-- end of content -->
    		</div>

  		</div>			
	</div>

	<div id = "QRcode">
		<div class="modal-dialog modal-lg">
    		<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-label="Close">
          				<span aria-hidden="true">&times;</span>
        			</button>
				</div>
				<div class="modal-body">
					<div class="container-fluid">
						<div class="row">
							<div class="col-md-12 text-center">
								<img src="QrCodes/Event1.png " class="img-fluid" alt="QR Code for {events[0].EventName}">
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

<!-- Not yet ready to self populate if more events are added -->
	<div id = "closeEvent">
		<div class="modal-dialog modal-lg">
    		<div class="modal-content">
				<div class="modal-header">
        			<h5 class="modal-title">{events[0].EventName}</h5>
      			</div>

				<div class="modal-body">
					<div class="container-fluid">
						<div class="row">
							<div class="col-md-12">
								<label for="OccasionDetails"><h4>Event Details</h4></label>
								<p id="OccasionDetails"> {events[0].EventDetails}
								</p>
							</div>
						</div>
						<div class="row">
							<div class="col-md-12">
								<button type="button" class="btn btn-danger btn-block">Delete Event</button>
							</div>
						</div>
						<div class="row">
							<div class="col-md-12">
								<button type="button" class="btn btn-success btn-block">Open Event</button>
							</div>
						</div>
						<div class="row">
							<div class="col-md-12">
								<button type="button" class="btn btn-primary btn-block">Get QR Code</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>
