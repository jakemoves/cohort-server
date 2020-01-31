<script>
import Button from "./Button.svelte"
import { pageStateInStore } from "./PageStore.js";
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();
let broadcastStatus="";

function sendBackButtonPackage(){
  dispatch('goBackAPage', {
            "broadcastStatus": broadcastStatus 
		});
}

function goBackAPage(){
    pageStateInStore.update(value => value - 1);
    // not sure this is the right space for this
    broadcastStatus = "unsent"
    
  }

</script>

 <Button on:click={goBackAPage}
          gridStyle=""
          buttonStyle="btn-outline-primary abs-left"
          iconLeft= "backButton fa fa-angle-left"
          buttonText="Back"/>
