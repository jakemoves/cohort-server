<script>
import Page from './ParentPage.svelte';
import {Howl, Howler} from 'howler';
import Button from './Button.svelte';





// Play the sound.
function playSound(){
  var sound = new Howl({
  src: ['./audio/ReiswerkZonaNorte.mp3']
  });
  sound.play();
}

</script>

  <Page
    pageID="eventLandingPage"
    headingText="Event Landing Page"
  >
    <Button 
      on:click={playSound}
      buttonText= "Play Sound"
    />
  </Page>


