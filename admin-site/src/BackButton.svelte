<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->
<!-- Component for adding back buttons -->
<script>
import Button from "./Button.svelte"
import { pageStateInStore } from "./PageStore.js";
import { createEventDispatcher } from 'svelte';

export let occasionFormIsOpen;

const dispatch = createEventDispatcher();
let broadcastStatus="";

function sendBackButtonPackage(){
  dispatch('goBack', {
            "broadcastStatus": broadcastStatus,
            "openOccasionCreation": false
	});
}
  
function goBackAPage(){
  
  if(!occasionFormIsOpen){
    pageStateInStore.update(value => value - 1);
  }
  // not sure this is the right space for this
  broadcastStatus = "unsent"
  sendBackButtonPackage();
}

</script>

 <Button on:click={goBackAPage}
    gridStyle=""
    buttonStyle="btn-outline-primary abs-left"
    iconLeft= "backButton fa fa-angle-left"
    buttonText="Back"/>
