<!-- This component is for button styling, and for practice -->
<svelte:head>
 <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
</svelte:head>

<style>
    button{
        margin:0.2rem 0rem;
    }

</style>

<button type="button" class="btn-warning" on:click>
<slot />
</button>