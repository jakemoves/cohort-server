<!-- This the component for the Event buttons -->

<script>
    export let eventTitle;

    function openEvent(){
        document.getElementById("eventsList").style.visibility="hidden";
    }

</script>

<style>
  h1{
      font-size:2rem;
      margin: 0,25rem 0;
      color: white;
  }
</style>


<div>
<!-- Event button used to populate event list-->
    <button type="button" class= 'btn-primary btn-block' on:click={openEvent} >
        <h1>{eventTitle}</h1> 
    </button>
   
</div>