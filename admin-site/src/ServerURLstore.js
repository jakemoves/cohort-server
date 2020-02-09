
//Copyright Luke Garwood & Jacob Niedzwiecki, 2019
//Released under the MIT License (see /LICENSE)

// Store holds state of server address

import {writable} from 'svelte/store';

export let urlStore = writable("https://staging.cohort.rocks/api/v2");
export let serverURL;

urlStore.subscribe(value => {
  serverURL = value;
})
