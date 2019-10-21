<!-- This the component for the Event buttons -->
<svelte:head>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
</svelte:head>

<script>
    export let eventTitle;
    
</script>

<style>
  div{
      margin: 1rem;
      box-shadow: 0px 2px 8px rgba(0,0,0,0.26);
      padding: 0.1rem;
      border-radius: 1px;
      background-color: white;
  }

  h1{
      font-size:2rem;
      margin: 0,25rem 0;
      color: white;
  }
</style>


<div>
<!-- Event button used to populate event list-->
    <button type="button" class= 'btn-warning btn-block' >
        <h1>{eventTitle}</h1> 
    </button>
   
</div>