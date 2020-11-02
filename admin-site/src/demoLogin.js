import {serverURL} from './ServerURLstore.js';
import { getEventsAndStore } from './EventsStore.js';
import { demoEventPackage } from './demoEvent.js';
import { storedEvents } from './EventsStore.js';


let events;
let indexInEvents;
let focusedEvent;
let demoEventName = "Demo Sound Event"


  storedEvents.subscribe(value => {
    events = value;
    if(events != 0){
      indexInEvents = events.findIndex(event => event.label === demoEventName);
      focusedEvent = events[indexInEvents];
    }
  })

const init = function(){
  return new Promise( async (resolve, reject) => {
    try {
      // try to login in using demo credentials, as per registrationform.svelte 
      const payload = { username: "demouser", password: "demodemo" }
      
      let response = await fetch(serverURL + '/login', {
        method: 'POST',
        headers: { 'Content-Type':  'application/json' },
        body: JSON.stringify(payload) 
      })
      if(response.status != 200){
        let errorMessage = await response.text()
        throw new Error(errorMessage)
      }
  
       try{
         //now try to get events for that demouser, if not create the event (that contains an occasion and cues).
          await eventsCheckAndCreation();  

       } catch (error) {
        return reject(new Error(`Error populating demo event. ${error}`))
       }
        
    } catch(error) {
      return reject(new Error(`Error trying to verify demouser because of ${error}`))
    }


    // return reject(new Error('legible error message'))
    
    // another try catch
      // return reject on error
    
    // another try catch
      // return reject
    
    // return resolve(response)
  
    // try to login in using demo credentials, as per registrationform.svelte 
      // success: you now have a secure cookie and can make secure requests
      // fail: probably the account doesn't exist in this environement

    
    // get a list of events, as per eventsStore
    // look for the demo event by name
      // if it's not there, create it as per EventCreationForm
    // look for the demo occasion by name
      // if it's not there, create it
      // if it's not open, display a note to the user telling them they have to open it manually via the admin site?
    // add demo cues to demo event
      // cue endpoint: /events/:id/episodes
      // [{ 
      //   "episodeNumber": 1,
      //   "label": "default",
      //   "cues": [{
      //     "mediaDomain": 3,
      //     "cueNumber": 1,
      //     "cueAction": 0,
      //     "targetTags": ["all"]
      //   }]
      // }]
  })
}

  let eventsCheckAndCreation = async() => {
    //check for existing "Demo Sound Event"
    let demoEventExists = false;
    for (let i=0; i<events.length; i++){
      if (events[i].label === demoEventName){
        demoEventExists = true;
      }
    }
    
    if (!demoEventExists){
      fetch(serverURL + "/events", {
        method: 'POST',
        headers: { 'Content-Type':  'application/json' },
        body: JSON.stringify(demoEventPackage) 
      }).then( response => { 
        if(response.status == 201){
            // make sure store updates from server
            getEventsAndStore().then(() => { addOccasion() });
        } else {
          response.text().then( errorMessage => {
            console.log(`Error on ${state} request: ${errorMessage}`)
          })
        }
      }).catch( error => {
        console.log(`Catch error on ${state} request`)
      })
    }
  }

  const addOccasion = () => {
    fetch(serverURL + "/occasions/", {
      method: 'POST',
      headers: { 'Content-Type':  'application/json' },
      body: JSON.stringify({
                            "label": "Cohort Rehearsal",
                            "eventId": focusedEvent.id,
                            "state": 'closed',
                            "doorsOpenDateTime": '2020-11-01 13:30:00+05:00',
                            "startDateTime": '2020-11-01 14:00:00+05:00',
                            "endDateTime": '2020-11-01 15:30:00+05:00',
                            "locationLabel": "The Demo Theatre",
                            "locationAddress": '125 Demo Ave.',
                            "locationCity": 'ToronDemo'
                          })  
      }).then (response => { 
        if(response.status == 201){
          getEventsAndStore();
        } else {
          response.text().then( errorMessage => {
            console.log(`Error on ${state} request: ${errorMessage}`)
          })
        }
      }).catch( error => {
        console.log(`Catch error on ${state} request`)
      })
  }

  

export default init

