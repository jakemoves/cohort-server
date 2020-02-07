<!-- Copyright Jacob Niedzwiecki, 2019 -->
<!-- Released under the MIT License (see /LICENSE) -->

<script>
  import { fade } from 'svelte/transition';
  let UIVisible = true;
  const cadence = 60000 // every 60 seconds 
  let timeoutID

  const totalTicks = 24
  let currentTick = 1

  let currentScene = 0
 
  // ">" alone means the button shows up after a certain number of ticks
  // ">TEXT" means the button triggers the next scene when pressed
  // "+" means the button will grow each tick
  const sceneActions = [
    [
      [{ label: ">WAKE UP" }]
    ],
    [
      [{ label: ">GET READY FOR DAY"}]
    ],
    [
      [{ label: "EAT A MEAL" }],
      [{ label: "READ" }],
      [{ label: "PRAY" }],
      [{ label: "MAKE PHONE CALL" }],
      [{ label: "INK A TATTOO" }],
      [{ label: "PLAY TRASHKETBALL" }],
      [{ label: "DANCE" }],
      [{ label: "SING" }],
      [{ label: "DRINK PRISON HOOCH" }],
      [{ label: "WRITE LETTER" }, { label: "MAIL LETTER" }],
      [{ label: "EXERCISE" }],
      [{ label: "TALK TO YOURSELF" }],
      [{ label: "DO YOGA" }],
      [{ label: "COMMUNICATE WITH OTHER PRISONERS" }],
      [{ label: "LOOK AT FAMILY PHOTOS" }],
      [{ label: "MEDITATE" }],
      [{ label: ">" }, { label: ">" }, { label:">TELL+" }]
    ],
    [
      [{ label: "SCENE THREE" }]
    ]
  ]

  let selectedAction = ""

  $: availableActions = sceneActions[currentScene]

  function onActionButtonTap(event) {
    currentTick++
    selectedAction = event.target.innerText
    UIVisible = false

    // update available actions
    // loop through availableActions
    for(var i = 0; i < availableActions.length; i++){
      // actions that appear based on what tick it is need some upkeep
      if(availableActions[i][0].label == ">"){
        availableActions[i].splice(0, 1)
      }

      if(availableActions[i][0].label.replace(/\+/g, "") == selectedAction){
        // this is the button that was tapped

        if(availableActions[i].length == 1){
          // leave a blank space where the button used to be
          availableActions[i][0].label = ""

          // to remove button entirely
          // availableActions.splice(i, 1)

          availableActions = availableActions
          console.log("removed action")
        } else {
          availableActions[i].splice(0, 1)
          availableActions = availableActions
          console.log("removed action phase")
        }

        console.log(selectedAction.substr(0, 1))
        if(selectedAction.substr(0, 1) == ">" && selectedAction.length > 1){
          currentScene++
          console.log(currentScene)
        }
      } 

      // actions that should change visual appearance based on tick need upkeep
      if(availableActions[i][0].label.search(/\+/) != -1){
        availableActions[i][0].label = availableActions[i][0].label + "+"
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
  width: 100%
}

ul > li {
  list-style-type: none;
  height: 4rem;
}

button.btn-outline-success {
  height: 4rem;
  font-weight: bold;
  background-color: #fff;
}

button.btn-outline-success:hover, button.btn-outline-success:active {
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}

#between_ticks, #during_ticks {
  position: absolute;
  left: 1rem;
}

.plus-3 {
  transform: scale3d(1.1, 1.1, 1)
}
.plus-4 {
  transform: scale3d(1.2, 1.2, 1)
}
.plus-5 {
  transform: scale3d(1.5, 1.5, 1)
}
.plus-6, .plus-7, .plus-8, .plus-9, .plus-10, .plus-11, .plus-12, .plus-13, .plus-14, .plus-15 {
  position: relative;
  top: -3rem;
  transform: scale3d(3, 3, 1)
}

</style>

{#if !UIVisible}
  <div class="container" id="during_ticks" transition:fade>
    <div class="row">
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
  </div>
{:else}
  <div class="container" id="between_ticks" transition:fade>
    <div class="row">
      <ul class="d-flex flex-wrap mt-8">
        {#each availableActions as action}
        <li class="col-4 mb-4">
        {#if action[0].label != "" && action[0].label != ">"}
          <button 
            type="button" 
            on:click={onActionButtonTap}
            class="btn btn-outline-success btn-block text-center plus-{ action[0].label.split("+").length - 1 }">
            <!-- {action[0]} -->
            {action[0].label.replace(/\+/g, "")}
          </button>
        {/if}
        </li>
        {/each}
      </ul>
    </div>
  </div>
{/if}