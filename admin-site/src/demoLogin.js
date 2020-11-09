import { serverURL } from './ServerURLstore.js';
import { getEventsAndStore } from './EventsStore.js';
import { demoEventPackage } from './demoEvent.js';
import { storedEvents } from './EventsStore.js';


let events;
let indexInEvents;
let focusedEvent;
let demoEventName = "Demo Sound Event";
const payload = { username: "demouser", password: "demodemo" };

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
      // try to login in using demo credentials
      await loginDemoUser();
        
    } catch(error) {
      if(error != 'Error: Username not found: "demouser"'){
        reject(error)
      } else {
      //if demo user doesn't exist, register it and loop back through init
        registerDemoUser()
      }
    }
    try {
      //now try to get events for that demouser, if not create the event (that contains an occasion and cues).
      await eventsCheckAndCreation();  
    } catch (error) {
      return reject(new Error(`Error populating demo event. ${error}`))
    }

    return resolve()
  })
}

async function loginDemoUser(){
  let response = await fetch(serverURL + '/login', {
    method: 'POST',
    headers: { 'Content-Type':  'application/json' },
    body: JSON.stringify(payload) 
  })

  if(response.status != 200){
    let errorMessage = await response.text()
    throw new Error(errorMessage) 
  } 
}

async function registerDemoUser(){
  let response = await fetch(serverURL + '/users', {
    method: 'POST',
    headers: { 'Content-Type':  'application/json' },
    body: JSON.stringify(payload) 
  })

  if(response.status != 201){
    let errorMessage = await response.text()
    throw new Error(errorMessage)
  } else {
    // let userdata = await response.json()
    // console.log(userdata)
    // return true
  }
  init();
}
  

let eventsCheckAndCreation = async() => {
  //check for existing "Demo Sound Event"
  let demoEventExists = false;
  try {
    await getEventsAndStore();
  } catch(error){
    console.log(error)
    return
  }

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

