
//grabbing events info from server and placing in a store
import {writable} from 'svelte/store';
import { urlStore } from './ServerURLstore.js';

let serverURL;

let grabbedFromServerEvents;
export let events;
export let storedEvents = writable(0);


export let getEventsAndStore = async () => {
  urlStore.subscribe(value => {
    serverURL = value;
  })

  let response = await fetch(serverURL + "/events", {
    method: 'GET'
  })

  grabbedFromServerEvents = await response.json();

  storedEvents.update(value => 
      value = grabbedFromServerEvents
  );

  storedEvents.subscribe(value => {
    events = value;
  });
    
}
getEventsAndStore();


