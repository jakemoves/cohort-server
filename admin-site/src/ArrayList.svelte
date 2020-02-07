<script>
export let arrayName="";
export let emptyArrayMessage="";
export let arrayHtml = "";

</script>



{#if arrayName.length === 0}
  <p class ="text-center">{emptyArrayMessage}</p>
  {:else}
    
      <slot></slot>
    
{/if}