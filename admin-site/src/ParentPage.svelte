<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->
<!-- Component for building ui pages -->
<script>
 import Button from './Button.svelte';
 import BackButton from './BackButton.svelte';
 export let headerSize = 3;
 export let headingText = "";
 export let pageID = "";
 export let includeBackButton = false;
 export let underHeading = ""

</script>
<style>


</style>
<div id={pageID} class="page">
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 mt-2">
        {#if includeBackButton}
          <BackButton/>
        {/if}

        {#if headerSize == 1}
          <h1 class="text-center">
              {headingText}
          </h1>
        {:else if headerSize == 2}
          <h2 class="text-center">
              {headingText}
          </h2>
        {:else if headerSize == 3}
          <h3 class="text-center">
              {headingText}
          </h3>
        {/if}

      </div>
    </div>
    <div class="row">
      <div class = "col-12">
        <p class = "text-center">{underHeading}</p>
      </div>
    </div>
    <hr/>
    <slot></slot>
  </div>
</div>