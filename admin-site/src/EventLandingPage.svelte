<script>

import {Howl, Howler} from 'howler';
import Button from './Button.svelte';





// Play the sound.
function playSound(){
  var sound = new Howl({
  src: ['./ReiswerkZonaNorte.mp3']
  });
  sound.play();
}

</script>

<Button on:click={playSound}
buttonText = "Play sound."></Button>