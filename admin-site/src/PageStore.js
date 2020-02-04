import {writable} from 'svelte/store';

export let pageStateInStore = writable(0);
export let focusedEventStore = writable("");
export let indexInEventsStore = writable("");