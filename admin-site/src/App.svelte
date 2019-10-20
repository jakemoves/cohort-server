<script>
	import FormContent from './Login.svelte';
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
	
</style>

<section>
	<FormContent />
	
</section>

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


<section>
	<div>
		<label for="title">Event Name</label> 
		<input type="text" id="title" value={title} on:input={setTitle}>  
	</div>
	<Button on:click={createEvent}>Create Event</Button>
</section>
