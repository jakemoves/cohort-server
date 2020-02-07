import {writable} from 'svelte/store';

export let urlStore = writable("https://staging.cohort.rocks/api/v2");
export let serverURL;

urlStore.subscribe(value => {
  serverURL = value;
})