<script>

export let elementID;

export let event;
export let occasion;
export let gotEvents = false;

 let cueState = 0;
 let sliderCue;
 let broadcastStatus = "unsent"
// choose whether we want a back button or not
let showButton = true;
let openOccasion = false;

function changeCueState() {
    let direction = this.value;

    let cuesLength = {event}.episodes[0].cues.length;
    if (direction == "next" && cueState < cuesLength - 1) {
      cueState ++;
    } else if (direction == "previous" && cueState > 0) {
      cueState --;
    } 
    
    //update broadcast message 
    sliderCue = focusedEvent.episodes[0].cues[cueState];

    broadcastStatus = "unsent"
    
  }

   function backToOccasionList() {
    let id = this.value;
    document.getElementById(id).style.display = "none";
    document.getElementById("occasionList").style.display = "block";

    broadcastStatus = "unsent"
  }
</script>
<div id={elementID}>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 mt-2">
      {#if showButton}
        <button
        alt="back to Occasions list"
        type="button"
        class="btn btn-outline-primary abs-left"
        value="{elementID}"
        on:click={backToOccasionList}>
        <span class="fa fa-angle-left" />
        Back
        </button>
      {/if}
       {#if gotEvents == true}
          <h3 class="text-center">{{occasion}.label}</h3>
        {/if}
      </div>
    </div>
     <hr />
    {#if openOccasion == true}
      <div class="row ">
        <div class="col-md-12">
          <button
            type="button"
            class="btn btn-outline-danger btn-block"
            data-toggle="modal" 
            data-target="#closeOccassionModal">
            Close Occasion
          </button>
        </div>
       </div>

       <div class="row">
         <div class="col-md-12">
           <button
             type="button"
             class="btn btn-outline-primary btn-block"
             value="openOccasion"
             data-toggle="modal" 
             data-target="#QRcodeModal"
             on:click={showQR}>
             Show QR Code
          </button>
         </div>
       </div>
      {#if gotEvents == true }
        {#if focusedEvent.episodes[0].cues.length == 0}
          <div class="row">
            <div class="col-md-12">
            <p>Sorry, no cues for this event can be found. We're cue-less.  </p>
            </div>
          </div>
        {:else}
          <div class="row">
            <div class="col-md-12">
              <h5>Cue Details</h5>
              
              {#if focusedEvent != null && focusedEvent !== undefined}
                {#each focusedEvent.episodes[0].cues as cue, index}
                  {#if index == cueState}
                    <div id={cue.cueNumber} >
                      <ul>Media Domain:
                        {#if cue.mediaDomain == 0}
                          Sound
                        {:else if cue.mediaDomain == 1}
                          Video
                        {:else if cue.mediaDomain == 2}
                          Text
                        {:else if cue.mediaDomain == 3}
                          Light 
                        {:else if cue.mediaDomain == 4}
                          Haptic
                        {/if}					  
                      </ul>
                      <ul>Cue Number: {cue.cueNumber}</ul>
                      <ul>Cue Action:
                        {#if cue.cueAction == 0}
                          Play (or 'on')
                        {:else if cue.cueAction == 1}
                          Pause
                        {:else if cue.cueAction == 2}
                          Restart
                        {:else if cue.cueAction == 3}
                          Stop (or 'off')
                        {/if}
                      </ul>
                    </div>
                  {/if}
                {/each}
              {/if}

            </div>
          </div>
          <div class="row">
            <div class="col-12 d-flex justify-content-between">
              <button
                type="button"
                class="btn btn-info"
                value="previous"
                disabled={cueState == 0}
                on:click={changeCueState}><span class="fas fa-angle-left"/>&nbsp;Previous</button>

              <button
                type="button"
                class="btn btn-info"
                value="next"
                disabled={cueState == focusedEvent.episodes[0].cues.length-1}
                on:click={changeCueState}>
              &nbsp;&nbsp;Next&nbsp;<span class="fas fa-angle-right" /> &nbsp;&nbsp;
              </button>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-md-12">
              <div class="slider-container status-{broadcastStatus} text-center">
                <label for="cue-control-go">Drag slider to the right to fire cue</label>
                <input type="range" min="0" max="100" value="0" id="cue-control-go" onchange=onCueSliderInput(event)>
                <div class="alert alert-success text-center">
                  {broadcastResults}
                </div>
                <div class="alert alert-warning text-center">
                  {broadcastResults}
                </div>
                <div class="alert alert-danger text-center">
                  {broadcastResults}
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/if}
      <!-- //end of open Occasion -->
      {:else}
        <div class="row">
      <div class="col-md-12">
        <label for="OccasionDetails">
          <h4>Occasion Details</h4>
        </label>
        <ul id="OccasionDetails">
          <li>Start Date : {formattedStartTimeFull}</li>
          <li>End Date : {formattedEndTimeFull}</li>
          <li>Location Label: {focusedOccasion.locationLabel}</li>
          <li>Location Address: {focusedOccasion.locationAddress}</li>
          <li>Location City: {focusedOccasion.locationCity}</li>
		  <hr>
		  <li>
			<button
				alt="link to QR Code"
				type="button"
				class="btn btn-link"
				value="closedOccasion"
        data-toggle="modal" 
        data-target="#QRcodeModal"
				on:click={showQR}>
				Get QR Code
        	</button>
		  </li>
		  <hr>
        </ul>
      </div>
    </div>
	<div class="row">
      <div class="col-md-12">
        <button
          type="button"
          class="btn btn-outline-success btn-block"
          on:click={openOccasionButton}>
          Open Occasion
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <button
          type="button"
          class="btn btn-outline-danger btn-block"
          data-toggle="modal" 
          data-target="#deleteOccassionModal">
          Delete Occasion
        </button>
      </div>
    </div>

     {/if}
       
  </div>
</div>

