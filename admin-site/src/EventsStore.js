
//grabbing events info from server and placing in a store
import {writable} from 'svelte/store';
import { urlStore } from './ServerURLstore.js';
import { focusedEventLabel, focusedEventStore } from './PageStore.js';

let serverURL;

let grabbedFromServerEvents;


export let events;
export let storedEvents = writable(0);
let focusedEvent;


export let getEventsAndStore = async () => {
  urlStore.subscribe(value => {
    serverURL = value;
  })

  let response = await fetch(serverURL + "/events", {
    method: 'GET'
  })

  grabbedFromServerEvents = await response.json();
  grabbedFromServerEvents = grabbedFromServerEvents;
  storedEvents.update(value => 
      value = grabbedFromServerEvents
  );

  storedEvents.subscribe(value => {
    events = value;
    let indexInEvents = events.findIndex(event => event.label === focusedEventLabel);
    focusedEvent = events[indexInEvents];
    focusedEventStore.update(x => x = focusedEvent);
   
  });
  
}
getEventsAndStore();



