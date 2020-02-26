
//  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
//  Released under the MIT License (see /LICENSE)

//grabbing events info from server and placing in a store
import {writable} from 'svelte/store';
import { serverURL } from './ServerURLstore.js';
import { focusedEventLabel, focusedEvent, focusedEventStore, focusedOccasionStore, focusedOccasionIDStore } from './UpdateUIstore.js';

// let serverURL;

let grabbedFromServerEvents;
let focusedEventUpdate;


export let events;
export let storedEvents = writable(0);

export let getEventsAndStore = async () => {

  let response = await fetch(serverURL + "/events", {
    method: 'GET'
  })

  grabbedFromServerEvents = await response.json();
  storedEvents.update(value => 
      value = grabbedFromServerEvents
  );

  storedEvents.subscribe(value => {
    events = value;
    let indexInEvents = events.findIndex(event => event.label === focusedEventLabel);
    focusedEventUpdate = events[indexInEvents];
    
    focusedEventStore.update(x => x = focusedEventUpdate);

    let focusedOccasionID;
    focusedOccasionIDStore.subscribe(value =>{
      focusedOccasionID = value
    });
    
    if(focusedEvent != undefined){
      let indexInOccasions = focusedEvent.occasions.findIndex(x => x.id == focusedOccasionID);
      let focusedOccasion = focusedEvent.occasions[indexInOccasions];

      focusedOccasionStore.set(focusedOccasion);
    }
     
   
  });
  
}




