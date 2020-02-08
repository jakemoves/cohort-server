<script>
  import { createEventDispatcher } from 'svelte';
  import moment from 'moment';
  import Array from './ArrayList.svelte';
  import Button from './Button.svelte';
  import { storedEvents } from './EventsStore.js';
  import { pageStateInStore, focusedEventStore, indexInEventsStore, focusedEventLabelStore} from './PageStore.js';

  const dispatch = createEventDispatcher();

  let indexInEvents;
  let focusedEvent;
  let focusedEventLabel;
  
  let events;
  let sliderCue;

  storedEvents.subscribe(value => {
    events = value;
  })



  function sendEventsPackage(){
    dispatch('message', {
      "sliderCue": sliderCue,
      "focusedEventLabel": focusedEventLabel
    });
  }


  //focusedevent store updated when evenst store changes
  function eventButton(value){ 
    focusedEventLabel = value;
    focusedEventLabelStore.set(focusedEventLabel);
    indexInEvents = events.findIndex(event => event.label === focusedEventLabel);
    focusedEvent = events[indexInEvents];
    
    // ///sorting occasions by date
    // let occasionArray = focusedEvent.occasions;
    // let sortDates = (a, b) => moment(a.startDateTime).format('YYYYMMDD') -moment(b.startDateTime).format('YYYYMMDD');
    // dateSortedOccasions = occasionArray.sort(sortDates);

    //set up slider cue to hold cues in first index (0)
    sliderCue = focusedEvent.episodes[0].cues[0]
    //update stores
    pageStateInStore.set(2);
    focusedEventStore.update(value => value = focusedEvent);
    indexInEventsStore.update(value => value = indexInEvents);
    sendEventsPackage();
  }


</script>

<Array
      arrayName = {events} 
      emptyArrayMessage = "This happens on occasion. No occasions for this event yet.">
        {#each events as item (item.id)}
          <div class="row mt-2">
            <div class="col-6 text-right">
                <h3>{item.label}:</h3>
            </div>
            <Button on:click={()=> eventButton(item.label)}
              buttonHtml='<p class="mb-0">Occasions&nbsp;<span style="font-size: 1.1rem; vertical-align: middle" class="fas fa-angle-right" /></p>'
              gridStyle ="col-6" />
          </div>
        {/each}
</Array>