<script>
  import CohortClientSession from "./CHClientSession.js";
  import DemoLogin from './demoLogin.js';
  import {currentUrlProtocol, currentUrlHostname} from './ServerURLstore.js';

  import { onMount } from "svelte";
  import { Howl, Howler } from "howler";
  import queryString from "query-string";
  
  import Page from "./ParentPage.svelte";
  import Button from "./Button.svelte";
  import AudioPlayer, {onBtnPause, onBtnPlay} from "./AudioPlayer.svelte";
  import WebsocketConnectionIndicator from "./WebsocketConnectionIndicator.svelte";
  /*
   *    Prepare Cohort functionality (for live cues)
   */

  function createSocketUrl(protocol, hostname){
    let validProtocols = {
      "https:":"wss:",
      "http:":"ws:"
    };
    if(protocol in validProtocols){
      return `${validProtocols[protocol]}//${hostname}/sockets`
    } else {
      throw new Error("Invalid url protocol.");
    }
  }

  let cohortSocketURL = createSocketUrl(currentUrlProtocol,currentUrlHostname); 


  export let cohortOccasionID;
  let connectedToCohortServer;
  let connectionState = "unknown";

  $: {
    if (connectedToCohortServer === undefined) {
      connectionState = "unknown";
    } else if (connectedToCohortServer == true) {
      connectionState = "active";
    } else if (connectedToCohortServer == false) {
      connectionState = "inactive";
    }
  }

  let cohortTags, cohortSession;

  let pageState = 0;
 
  const norteAudioTrack = new Howl({
    src: ["./audio/ReiswerkZonaNorte.mp3"]
	});
	
  const playSound = () => norteAudioTrack.play();
	const stopSound = () => norteAudioTrack.stop();
	//hacky way of having a user initiated event
  const loadAudio = function() {
    norteAudioTrack.play();
    norteAudioTrack.stop();
    pageState = 1;
	};
	
	let playState = norteAudioTrack.playing()
	$: text = playState ? "Playing!" : "Waiting to receive cue.";
	//for some reason below isn't working, will need to review
	// $: state = norteAudioTrack.playing() ? "Playing!" : "Waiting to receive cue.";

  onMount(() => {
    // then startCohort but modify to pass occasion id?
    startCohort();
  });

  const startCohort = function() {
    // get grouping info (tags) from URL
    // this is used to target cues to specific groupings
    cohortTags = ["all"];
    const parsedQueryString = queryString.parse(location.search);
    const grouping = parsedQueryString.grouping;
    if (grouping != null && grouping !== undefined) {
      cohortTags.push(grouping);
    }

    cohortSession = new CohortClientSession(
      cohortSocketURL,
      cohortOccasionID,
      cohortTags
    );

    cohortSession.on("connected", () => {
      connectedToCohortServer = true;
    });

    cohortSession.on("disconnected", message => {
      connectedToCohortServer = false;
    });

    cohortSession.on("cueReceived", async cue => {
      console.log("cue received:");
      console.log(cue);

      // do stuff based on the cue (eventually this can be automated based on a cuelist, like in Unity)
      // onBtnPlay();

      //this isn't pretty
      if (cue.mediaDomain == 0 && cue.cueNumber == 1 && cue.cueAction == 0) {
				playSound();
				playState = norteAudioTrack.playing();
      }
    });

    cohortSession.init();
  };

  const onReconnect = async function() {
    cohortSession.reconnect();
  };

  let showReconnectButton = false;
  $: (async () => {
    if (cohortSession && cohortSession.connectedOnce == true) {
      if (connectionState == "inactive") {
        showReconnectButton = true;
      } else {
        showReconnectButton = false;
      }
    }
  })();

  const delay = function(time) {
    // time in ms
    return new Promise(resolve => setTimeout(resolve, time));
  };

  /*
   *    End Cohort
   */
</script>

<Page pageID="eventLandingPage" headingText="Event Landing Page" subHeadingText="Occasion Id: {cohortOccasionID}">
  {#if pageState === 0}
    <h4 class ="text-center">
      Do you have your volume unmuted and your sound at a comfortable level?
    </h4>
    <Button on:click={loadAudio} buttonText="Yes!" />
  {:else}
    <div class="container">
      <div class="row">
        <div class="col">
          <WebsocketConnectionIndicator status={connectionState} />
          {#if showReconnectButton}
            <button class="btn btn-sm btn-warning" on:click={onReconnect}>
              Reconnect
            </button>
          {/if}
        </div>
      </div>
    </div>
    <h4 class="text-center">{text}</h4>
    <!-- <AudioPlayer
      audioUrl = './audio/ReiswerkZonaNorte.mp3'
			/> -->
  {/if}
</Page>
