
//grabbing events info from server and placing in a store
import {writable} from 'svelte/store';


let grabbedFromServerEvents;
export let events;
export let storedEvents = writable(0);


let GetEvents = async () => {
    let response = await fetch("http://localhost:3000/api/v2/events", {
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
GetEvents();


