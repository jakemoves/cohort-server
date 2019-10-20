<script>
    import Button from "./button.svelte";
    export let eventTitle;
</script>



<style>
  div{
      margin: 1rem;
      box-shadow: 0px 2px 8px rgba(0,0,0,0.26);
      padding: 1rem;
      border-radius: 5px;
      background-color: white;
  }

  h1{
      font-size:1.25rem;
      margin: 0,25rem 0;
      color: #4b4b4b;
  }
</style>


<div>
<!-- Event button used to populate event list-->
    <h1>{eventTitle}</h1>

</div>