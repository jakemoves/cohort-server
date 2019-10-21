<script>
	import Login from './Login.svelte';
	import Event from './Events.svelte';
	

	let title = '';
	const SoundCue = {
		title: "Sound Cue",
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
	#eventsList{
		visibility: hidden;
	}
	
</style>

<!-- Display login first, and then logic to switch to #eventslist is in Login.svelte -->
<!-- Keeping this as a component cause it will likely need switching out -->
<section id = "login">
	<Login />

</section>

<!-- #eventsList allows a list of events to be built and shown -->
<div id = "eventsList">
	<section>
		{#if events.length === 0}
			<p>No events have been added yet</p>
			{:else}
			{#each events as event}
				<!-- <Event 
					eventTitle={event.title}
				/> -->
				<button type="button" class= 'btn-primary btn-block' >
        			<h1>{event.title}</h1> 
    			</button>
			{/each}
		{/if}
	</section>

<!-- event creation -->
	<section>
	<hr>
		<div>
			<label for="title">Event Name</label> 
			<input type="text" id="title" value={title} on:input={setTitle}>  
		</div>
		<button class = "btn-primary" on:click={createEvent}>Create New Event</button>
	</section>
</div>

<!-- <div id = "openEvent">
	<section>
		<form class = "form-inline">

			

		
		</form>
	
	</section>

</div> -->