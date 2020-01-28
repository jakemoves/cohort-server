<script>
import moment from "moment";
import Button from "./Button.svelte";
import { events } from './EventsStore.js';
import { pageStateInStore } from './PageStore.js';


import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();
let dateSortedOccasions =[];
let focusedEvent = [];
let focused = {
  "focusedEvent": []
}
let sliderCue;
let focusedOccasion;
let formattedStartTimeFull;
let formattedEndTimeFull;
let formattedStartTime;
let formattedEndTime;

export let listType = "Events";
export let action= "";
export let arrayName =[];
export let emptyArrayMessage = "";

function sendEventsPackage(){
  dispatch('message', {
            // "pageState": pageState,
            "focusedEvent": focus.focusedEvent,
            "dateSortedOccasions": dateSortedOccasions,
            "sliderCue": sliderCue,
		});
}
function sendOccasionsPackage(){
  dispatch('message', {
            // "pageState": pageState,
            "focusedOccasion": focusedOccasion,
            "formattedStartTimeFull": formattedStartTimeFull,
            "formattedEndTimeFull": formattedEndTimeFull,
            "formattedStartTime": formattedStartTime,
            "formattedEndTime": formattedEndTime

		});
}

function eventButton(value) {
    let focusedEventLabel = value;
    let indexInEvents = events.findIndex(event => event.label === focusedEventLabel);
    focus.focusedEvent = events[indexInEvents];

    ///sorting occasions by date
    let occasionArray = focus.focusedEvent.occasions;
    let sortDates = (a, b) => moment(a.startDateTime).format('YYYYMMDD') -moment(b.startDateTime).format('YYYYMMDD');
    dateSortedOccasions = occasionArray.sort(sortDates);

    //set up slider cue to hold cues in first index (0)
    sliderCue = focus.focusedEvent.episodes[0].cues[0]
    // pageState = 2;
    pageStateInStore.update(value => value = 2);
    sendEventsPackage();
  }

  function occasionButton(id) {
    let focusedOccasionID = id;
    let indexInOccasions = focus.focusedEvent.occasions.findIndex(x => x.id == focusedOccasionID);
    focusedOccasion = focus.focusedEvent.occasions[indexInOccasions];

    if(focusedOccasion.state == "closed"){
      pageStateInStore.update(value => value = 3);
      // pageState = 3;
    } else {
      pageStateInStore.update(value => value = 4);
      // pageState = 4;
    }

	  formattedStartTimeFull = moment(focusedOccasion.startDateTime)
      .format("LLL");
    formattedEndTimeFull = moment(focusedOccasion.endDateTime)
	    .format("LLL");
	  formattedStartTime = moment(focusedOccasion.startDateTime)
      .format("LL");
    formattedEndTime = moment(focusedOccasion.endDateTime)
      .format("LL");

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
                gridLayout ="col-6" />
        </div>
      {:else if listType == "Occasions"}
        <Button on:click={() => occasionButton(item.id)}
        buttonHtml = '<h3 class="m-0">{item.label}  - {item.label} </h3> <h5>{item.locationCity} - {moment(item.startDateTime).format("LL")} - id:{item.id}</h5>'
        value = {item.id}/>
      {/if}
    {/each}
{/if}