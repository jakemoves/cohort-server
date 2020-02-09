
  //Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  //Released under the MIT License (see /LICENSE)
  
// Store holds state of whether occasion is open or closed
import {writable} from 'svelte/store';

export let occasionOpen = writable(false);