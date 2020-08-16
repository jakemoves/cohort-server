<!-- Copyright Jacob Niedzwiecki, 2019 -->
<!-- Released under the MIT License (see /LICENSE) -->

<script>
  import { fade } from 'svelte/transition';
  import {Howl, Howler} from 'howler';


  let UIVisible = true;
  const cadence = 60000 // every 60 seconds 
  let timeoutID

  const totalTicks = 24
  let currentTick = 1

  let currentScene = 0
  let soundURL = "otmAudio/WakeUp.mp3"
 
  // ">" alone means the button shows up after a certain number of ticks
  // ">TEXT" means the button triggers the next scene when pressed
  // "+" means the button will grow each tick
  const sceneActions = [
    [
      [{ label: "WAKE UP", soundURL: "otmAudio/WakeUp.mp3" }, { label: ">GET READY FOR DAY", soundURL: "otmAudio/GetReadyForDay.mp3"}]
    ],
    [
      [{ label: "EAT A MEAL", soundURL: "otmAudio/EataMeal.mp3" }],
      [{ label: "READ", soundURL: "otmAudio/Read.mp3" }],
      [{ label: "PRAY", soundURL: "otmAudio/Pray.mp3" }],
      [{ label: "MAKE PHONE CALL", soundURL: "otmAudio/MakePhoneCall.mp3" }],
      [{ label: "INK A TATTOO", soundURL: "otmAudio/InkaTattoo.mp3" }],
      [{ label: "PLAY TRASHKETBALL", soundURL: "otmAudio/PlayTrashketball.mp3" }],
      [{ label: "DANCE", soundURL: "otmAudio/Dance.mp3" }],
      [{ label: "SING", soundURL: "otmAudio/Sing.mp3" }],
      [{ label: "DRINK PRISON HOOCH", soundURL: "otmAudio/DrinkPrisonHooch.mp3" }],
      [{ label: "WRITE LETTER", soundURL: "otmAudio/WriteLetter.mp3" }, { label: "MAIL LETTER", soundURL: "otmAudio/MailLetter.mp3" }],
      [{ label: "EXERCISE", soundURL: "otmAudio/Exercise.mp3" }],
      [{ label: "TALK TO YOURSELF", soundURL: "otmAudio/TalktoYourself.mp3" }],
      [{ label: "DO YOGA", soundURL: "otmAudio/DoYoga.mp3" }],
      [{ label: "COMMUNICATE WITH OTHER PRISONERS", soundURL: "otmAudio/CommunicatewithotherPrisoners.mp3" }],
      [{ label: "LOOK AT FAMILY PHOTOS", soundURL: "otmAudio/LookatFamilyPhotos.mp3" }],
      [{ label: "MEDITATE", soundURL: "otmAudio/Meditate.mp3" }],
      [{ label: ">" }, { label: ">" }, { label:">TELL+", soundURL:"otmAudio/Tell-TheresNewsforYou.mp3" }],
    ],
    [
      [{ label: "CALL LAWYER", soundURL: "otmAudio/CallLawyer.mp3" }],
      [{ label: "CHOOSE LAST MEAL", soundURL: "otmAudio/ChooseLastMeal.mp3" }],
      [{ label: "DONATE ORGANS", soundURL: "otmAudio/DonateOrgans.mp3" }],
      [{ label: "GET AFFAIRS IN ORDER", soundURL: "otmAudio/GetAffairsinOrder.mp3" }],
      [{ label: "HATCH ESCAPE PLAN", soundURL: "otmAudio/HatchEscapePlan.mp3" }],
      [{ label: "PSYCH YOURSELF UP", soundURL: "otmAudio/PsychYourselfUp.mp3" }],
      [{ label: ">" }, { label: ">" }, { label: ">" }, { label: ">" }, { label: ">" }, { label: ">" }, { label: ">" }, { label: ">" }, { label: ">" }, { label: ">" }, { label: ">" }],
      [
        { label: ">" }, { label: ">" }, { label: ">" }, { label: ">" }, { label: ">" },
        { label: "GET READY FOR BED", soundURL: "otmAudio/GetReadyforBed.mp3"},
        { label: "SLEEP", soundURL: "otmAudio/Sleep.mp3"},
        { label: "DREAM", soundURL: "otmAudio/Dream.mp3"},
      ]
    ]
  ]

  let selectedAction = ""
  let actionLabel = "LOADING..."
  let audioError = ""
  
  $: availableActions = sceneActions[currentScene]  

  // set up sound for first button
  let soundPlayer = new Howl({
    src: [sceneActions[0][0][0].soundURL]
    ,
    // onload: function(){

    // },
    onloaderror: function(id, error){
      console.log(error)
      audioError = "Error loading audio: " + error
    },
    onplay: function(id){
      selectedAction = "WAKE UP"
    },
    onplayerror: function(id, error){
      console.log(error)
      audioError = "Error playing audio: " + error
    }
  })

  // Howler.autoUnlock = false  

  function onActionButtonTap(event) {
    
    currentTick++
    selectedAction = event.target.innerText
    actionLabel = "LOADING..." 
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
        let soundName = event.target.innerText

        // play sound for this button
        soundPlayer = new Howl({
          src: [availableActions[i][0].soundURL],
          // onload: function(){

          // },
          onloaderror: function(id, error){
            console.log(error)
            audioError = "Error loading audio: " + error
          },
          onplay: function(id){
            actionLabel = selectedAction
          },
          onplayerror: function(id, error){
            console.log(error)
            audioError = "Error playing audio: " + error
          }
        })
        soundPlayer.play()

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
.plus-6, .plus-7, .plus-8, .plus-9, .plus-10, .plus-11, .plus-12, .plus-13, .plus-14, .plus-15, .plus-16, .plus-17, .plus-18 {
  position: relative;
  top: -3rem;
  transform: scale3d(3, 3, 1)
}

</style>

<!-- {#if !UIVisible}
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
        <h1 class="{ actionLabel == "LOADING..." ? "text-secondary" : "" }">{actionLabel}</h1>
      </div>
    </div>
    {#if audioError != ""}
      <div class="row justify-content-center">
        <div class="alert alert-danger col-6 mt-4">
          {audioError}
        </div>
      </div>
    {/if}
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
            {action[0].label.replace(/\+/g, "")}
          </button>
        {/if}
        </li>
        {/each}
      </ul>
    </div>
  </div>
{/if} -->