import {writable} from 'svelte/store';

export let urlStore = writable("http://jakemoves-old.local:3000/api/v2");
export let serverURL;

urlStore.subscribe(value => {
  serverURL = value;
})