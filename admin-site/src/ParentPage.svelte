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
 export let subHeadingText = ""
 export let occasionCreationFormIsOpen;

</script>
<style>
  .subHeadingClass{
    font-size: 1.2em;
    font-weight: 425;
  }

</style>
<div id={pageID} class="page">
  <div class="container-fluid">
    <div class="row">
        {#if includeBackButton}
          <div class="col-3 mt-2">
            <BackButton on:goBack
              occasionCreationFormIsOpen = {occasionCreationFormIsOpen}/>
          </div>
        {:else}
          <div class="col-3 mt-2"></div>
        {/if}

        <div class="col-6 mt-2">
          {#if headerSize == 1}
            <h1 class="text-center">{headingText}</h1>
          {:else if headerSize == 2}
            <h2 class="text-center">{headingText}</h2>
          {:else if headerSize == 3}
            <h3 class="text-center">{headingText}</h3>
          {/if} 
        </div>

      <!-- //empty spacer div to keep text centered if event name runs long -->
      <div class="col-3 mt-2"></div>
    </div>
    {#if subHeadingText == ""}
      <!-- don't display if subheading is empty -->
    {:else if subHeadingText == "Invalid date"}
     <!-- don't display subheading if it has invald date/time -->
     {:else}
      <div class="row">
        <div class="col-12">
          <p class="text-center subHeadingClass">{subHeadingText}</p>
        </div>
      </div>

    {/if}
    <hr/>
    <slot></slot>
  </div>
</div>