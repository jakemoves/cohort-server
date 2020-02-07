import {writable} from 'svelte/store';

export let urlStore = writable("http://localhost:3000/api/v2");
export let serverURL;

urlStore.subscribe(value => {
  serverURL = value;
})