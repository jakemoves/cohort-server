import {writable} from 'svelte/store';

export let pageStateInStore = writable(0);
export let focusedEventStore = writable("");
export let focusedEvent;
export let dateSortedOccasionsStore = writable(''); 
export let dateSortedOccasions;
export let indexInEventsStore = writable("");
export let indexInEvents;
export let focusedEventLabelStore = writable("");
export let focusedEventLabel;

focusedEventStore.subscribe(value => {
  focusedEvent = value;
});
indexInEventsStore.subscribe(value => indexInEvents = value);
dateSortedOccasionsStore.subscribe(value => dateSortedOccasions = value);
focusedEventLabelStore.subscribe(value => focusedEventLabel = value);