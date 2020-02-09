<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->
<!-- component to create looped lists -->
<script>
export let arrayName="";
export let emptyArrayMessage="";


</script>



{#if arrayName.length === 0}
  <p class ="text-center">{emptyArrayMessage}</p>
  {:else}
    
      <slot></slot>
    
{/if}