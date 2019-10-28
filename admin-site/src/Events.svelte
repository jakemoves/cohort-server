<!-- This the component for the Event buttons -->

<script>
    export let eventTitle;

    function openEvent(){
        document.getElementById("eventsList").style.visibility="hidden";
    }

</script>

<style>
 
</style>


<div>
<!-- Event button used to populate event list-->
    <button type="button" class= 'btn-primary btn-block' on:click={openEvent} >
        <h1>{eventTitle}</h1> 
    </button>
   
</div>