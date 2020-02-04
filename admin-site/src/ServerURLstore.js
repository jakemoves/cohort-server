import {writable} from 'svelte/store';

export let urlStore = writable("http://localhost:3000/api/v2");

// //checking for local dev ...needs testing on staging site
// function checkLocalUrl () {
//     let page = window.location.href;
//     let splitURL = page.split('/');
//     let splitLocal = splitURL[2].split(":")
//     if(splitLocal[0] == "localhost"){
//       urlStore.update(value => value = "http://localhost:3000/api/v2");
//     //   document.getElementById("password").value = "5555";
//     }
//   }
// checkLocalUrl();