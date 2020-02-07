<!-- Copyright Jacob Niedzwiecki, 2019 -->
<!-- Released under the MIT License (see /LICENSE) -->

<script>
  import { fade } from 'svelte/transition';
  let UIVisible = true;
  const cadence = 60000 // every 60 seconds 
  let timeoutID

  const totalTicks = 24
  let currentTick = 1
  
  let selectedAction = ""
 
  const participantActions = [
    ["EAT A MEAL"],
    ["READ"],
    ["PRAY"],
    ["MAKE PHONE CALL"],
    ["INK A TATTOO"],
    ["PLAY TRASHKETBALL"],
    ["DANCE"],
    ["SING"],
    ["DRINK PRISON HOOCH"],
    ["WRITE LETTER", "MAIL LETTER"],
    ["EXERCISE"],
    ["TALK TO YOURSELF"],
    ["DO YOGA"],
    ["COMMUNICATE WITH OTHER PRISONERS"],
    ["LOOK AT FAMILY PHOTOS"],
    ["MEDITATE"]
  ]

  let availableActions = participantActions

  function onActionButtonTap(event) {
    console.log(event)
    selectedAction = event.target.innerText
    UIVisible = false

    // update available actions
    // loop through availableActions
    for(var i = 0; i < availableActions.length; i++){
      // let actionSeries = availableActions[i]
      if(availableActions[i][0] == selectedAction){
        console.log("found match")
        if(availableActions[i].length == 1){
          availableActions.splice(i, 1)
          availableActions = availableActions
          console.log("removed action")
        } else {
          availableActions[i].splice(0, 1)
          availableActions = availableActions
          console.log("removed action phase")
        }
      } 
    }

    timeoutID = setTimeout(() => {
      UIVisible = true
    }, cadence)
  }

  function onAdvanceButtonTap(event) {
    clearTimeout(timeoutID)
    UIVisible = true
  }
</script>

<style>
ul {
  margin-top: 2rem;
  padding-left: 0;
}

ul > li {
  list-style-type: none;
  height: 4rem;
}

button {
  height: 4rem;
  font-weight: bold;
}

</style>

<div class="container">
  {#if !UIVisible}
    <div class="row" transition:fade>
      <div class="col-12">
        <button class="btn btn-outline-warning text-center float-right"
          on:click={onAdvanceButtonTap}>
          Advance
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col-12 text-center">
        <h1>{selectedAction}</h1>
      </div>
    </div>
  {:else}
    <div class="row" transition:fade>
      <ul class="d-flex flex-wrap mt-8">
        {#each availableActions as action}
        <li class="col-4 mb-4">
          <button 
            type="button" 
            on:click={onActionButtonTap}
            class="btn btn-outline-success btn-block text-center">
            {action[0]}
          </button>
        </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>