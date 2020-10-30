
//Copyright Luke Garwood & Jacob Niedzwiecki, 2019
//Released under the MIT License (see /LICENSE)

// Store holds state of server address

import {writable} from 'svelte/store';
//server url is current url with /admin removed
export let urlStore = writable(`${window.location.protocol}//${window.location.host}/api/v2`);
export let serverURL;

urlStore.subscribe(value => {
  serverURL = value;
})

