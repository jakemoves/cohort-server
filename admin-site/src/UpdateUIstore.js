
 // Copyright Luke Garwood & Jacob Niedzwiecki, 2019
 // Released under the MIT License (see /LICENSE)

 //Store holds page state for UI updates
 
import {writable} from 'svelte/store';
// import { component_subscribe } from 'svelte/internal';

export let pageStateInStore = writable(0);

export let focusedEventStore = writable("");
export let focusedEvent;

export let dateSortedOccasionsStore = writable(''); 
export let dateSortedOccasions;

export let indexInEventsStore = writable("");
export let indexInEvents;

export let focusedEventLabelStore = writable("");
export let focusedEventLabel;

export let focusedOccasionIDStore = writable("");
export let focusedOccasionID;
export let focusedOccasionStore = writable("");
export let focusedOccasion;

//For times when a component doesn't need to update the value within a store during 
// the life cycle of a component, the below updates the values so a new subscribe
// doesn't need to be called within that component
focusedEventStore.subscribe(value => focusedEvent = value);
indexInEventsStore.subscribe(value => indexInEvents = value);
dateSortedOccasionsStore.subscribe(value => dateSortedOccasions = value);
focusedEventLabelStore.subscribe(value => focusedEventLabel = value);
focusedOccasionStore.subscribe(value => focusedOccasion = value);
focusedOccasionIDStore.subscribe(value => focusedOccasionID = value);
