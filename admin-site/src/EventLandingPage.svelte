<script>
import Page from './ParentPage.svelte';
import {Howl, Howler} from 'howler';
import Button from './Button.svelte';



var norteAudioTrack = new Howl({
  src: ['./audio/ReiswerkZonaNorte.mp3']
  });
var speckAudioTrack = new Howl({
  src: ['./audio/speck_-_It_Takes_Perspective_1.mp3']
  });

const playSound = () => (norteAudioTrack.play());

const stopSound = () => (norteAudioTrack.stop());

</script>

  <Page
    pageID="eventLandingPage"
    headingText="Event Landing Page"
  >
    <Button 
      on:click={playSound}
      buttonText= "Play Sound"
    />
     <Button 
      on:click={stopSound}
      buttonText= "Stop Sound"
    />
  </Page>


