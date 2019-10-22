<script>
	import Login from './Login.svelte';
	import Event from './Events.svelte';
	import Slider from './Slider.svelte';

	let title = '';

	const SoundCue = {
		title: "Lotx - October 24th, 2019",
	}
	
	let events =[SoundCue];

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
				<button type="button" class= 'btn btn-primary btn-block' >
        			<h3>{event.title}</h3> 
    			</button>
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

<div id = "openEvent">
	<!-- <div class="modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"> -->
  		<div class="modal-dialog modal-lg">
    		<div class="modal-content">
				<div class="modal-header">
        			<h5 class="modal-title">{events[0].title}</h5>
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
								<p id="cueDetails">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ipsum nunc aliquet bibendum enim facilisis gravida neque convallis. Egestas congue quisque egestas diam in. Sed viverra ipsum nunc aliquet. Facilisi morbi tempus iaculis urna id volutpat lacus laoreet non. In pellentesque massa placerat duis. Nisl purus in mollis nunc sed id semper. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci a. Sit amet est placerat in egestas erat imperdiet. Urna cursus eget nunc scelerisque viverra mauris in aliquam sem. At auctor urna nunc id cursus. Nulla posuere sollicitudin aliquam ultrices. Neque volutpat ac tincidunt vitae semper quis lectus. A cras semper auctor neque. Odio eu feugiat pretium nibh ipsum. Malesuada proin libero nunc consequat. Vitae congue mauris rhoncus aenean vel.
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
							<div class="col-md-12">
								<img src="./QrCodes/Event1.png" class="img-fluid" alt="QR Code for {events[0].title}">
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div id = "closeEvent">
		<div class="modal-dialog modal-lg">
    		<div class="modal-content">
				<div class="modal-header">
        			<h5 class="modal-title">{events[0].title}</h5>
      			</div>

				<div class="modal-body">
					<div class="container-fluid">
						<div class="row">
							<div class="col-md-12">
								<label for="OccasionDetails"><h4>Occasion Details</h4></label>
								<p id="OccasionDetails">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ipsum nunc aliquet bibendum enim facilisis gravida neque convallis. Egestas congue quisque egestas diam in. Sed viverra ipsum nunc aliquet. Facilisi morbi tempus iaculis urna id volutpat lacus laoreet non. In pellentesque massa placerat duis. Nisl purus in mollis nunc sed id semper. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci a. Sit amet est placerat in egestas erat imperdiet. Urna cursus eget nunc scelerisque viverra mauris in aliquam sem. At auctor urna nunc id cursus. Nulla posuere sollicitudin aliquam ultrices. Neque volutpat ac tincidunt vitae semper quis lectus. A cras semper auctor neque. Odio eu feugiat pretium nibh ipsum. Malesuada proin libero nunc consequat. Vitae congue mauris rhoncus aenean vel.
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
