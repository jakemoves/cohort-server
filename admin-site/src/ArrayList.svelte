<script>
import moment from "moment";
import Button from "./Button.svelte";
import { events, storedEvents } from './EventsStore.js';
import { pageStateInStore } from './PageStore.js';
import { createEventDispatcher } from 'svelte';
import { occasionOpen } from './OccasionState.js';

const dispatch = createEventDispatcher();
let dateSortedOccasions =[];
let focusedOccasionID;
let sliderCue;
let focusedOccasion;
let formattedStartTimeFull; 
let formattedEndTimeFull;
let formattedStartTime;
let formattedEndTime;
let isOccasionOpen;
let indexInOccasions;

let focusedEvent;
let indexInEvents;
let focusedEventLabel;
let focusedOccasionState;

export let listType = "Events";
export let action= "";
export let arrayName =[];
export let emptyArrayMessage = "";


function sendEventsPackage(){
  dispatch('message', {
            // "pageState": pageState,
            "focusedEvent": window.focusedEvent,
            "dateSortedOccasions": dateSortedOccasions,
            "sliderCue": sliderCue,
		});
}
function sendOccasionsPackage(){
  dispatch('message', {
            // "pageState": pageState,
            "focusedOccasion": focusedOccasion,
            "focusedOccasionID": focusedOccasionID,
            "indexInOccasions":indexInOccasions,
            "isOccasionOpen": isOccasionOpen

		});
}

function eventButton(value) { 
    focusedEventLabel = value;
    window.indexInEvents = events.findIndex(event => event.label === focusedEventLabel);
    window.focusedEvent = events[window.indexInEvents];
    
    
    ///sorting occasions by date
    let occasionArray = window.focusedEvent.occasions;
    let sortDates = (a, b) => moment(a.startDateTime).format('YYYYMMDD') -moment(b.startDateTime).format('YYYYMMDD');
    dateSortedOccasions = occasionArray.sort(sortDates);

    //set up slider cue to hold cues in first index (0)
    sliderCue = window.focusedEvent.episodes[0].cues[0]
    // pageState = 2;
    pageStateInStore.update(value => value = 2);
    sendEventsPackage();
  }

  function occasionButton(id) {
    
    focusedOccasionID = id;
    indexInOccasions = window.focusedEvent.occasions.findIndex(x => x.id == focusedOccasionID);

    focusedOccasion = window.focusedEvent.occasions[indexInOccasions];
    
    pageStateInStore.update(value => value = 3);

    storedEvents.subscribe(value => focusedOccasionState = value[window.indexInEvents].occasions[indexInOccasions].state);
   
    if (focusedOccasionState == "closed"){
      occasionOpen.update(value => value = false);
    } else{
      occasionOpen.update(value => value = true);
    }
      

      sendOccasionsPackage();
  }
</script>
{#if arrayName.length === 0}
  <p class ="text-center">{emptyArrayMessage}</p>
  {:else}
    {#each arrayName as item (item.id)}
      {#if listType == "Events"}
        <div class="row mt-2">
            <div class="col-6 text-right">
                <h3>{item.label}:</h3>
            </div>
            <Button on:click={()=> eventButton(item.label)}
                buttonHtml='<p class="mb-0">Occasions&nbsp;<span style="font-size: 1.1rem; vertical-align: middle" class="fas fa-angle-right" /></p>'
                gridStyle ="col-6" />
        </div>
      {:else if listType == "Occasions"}
        <Button on:click={() => occasionButton(item.id)}
        buttonHtml = '<h3 class="m-0">{item.label}  - {item.label} </h3> <h5>{item.locationCity} - {moment(item.startDateTime).format("LL")} - id:{item.id}</h5>'
        value = {item.id}/>
      {/if}
    {/each}
{/if}

