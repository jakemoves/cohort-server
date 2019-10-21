<script>
	import Login from './Login.svelte';
	import Event from './Events.svelte';
	import Button from "./button.svelte";

	let title = '';
	let events =[];

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
	section{
		width:30rem;
		margin:auto;
	}

	label, input, textarea{
		width:100%;
	}

	#eventsList{
		visibility: hidden;
	}
	
</style>

<!-- Display login first, and then logic to switch to #eventslist is in Login.svelte -->
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
				<Event 
					eventTitle={event.title}
				/>
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
		<Button on:click={createEvent}>Create New Event</Button>
	</section>
</div>
