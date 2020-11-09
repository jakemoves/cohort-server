
//Copyright Luke Garwood & Jacob Niedzwiecki, 2019
//Released under the MIT License (see /LICENSE)

// Store holds state of server address

import {writable} from 'svelte/store';
//server url is current url with /admin removed
export const currentUrlHostname = window.location.host; 
export const currentUrlProtocol = window.location.protocol;
export let urlStore = writable(`${currentUrlProtocol}//${currentUrlHostname}/api/v2`);
export let serverURL;

urlStore.subscribe(value => {
  serverURL = value;
})

