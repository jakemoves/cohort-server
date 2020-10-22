<script>
import Cookies from 'js-cookie'
import { onMount } from 'svelte'

export let audioUrl
let isPaused = true
let isLoaded
let audioPlayer
let audioPreloadSetting = "auto"
let audioDuration, audioCurrentTime
let cookieInterval
let canResume = false, didResume = false, lastPosition

$: state = isPaused ? "paused" : "playing"
$: isLoaded = (audioDuration !== undefined && !isNaN(audioDuration)) ? true : false
$: showResumeControls = canResume && !didResume


const onBtnPlay = function() {
	isPaused = false
	cookieInterval = setInterval(function(){
		// console.log('currentTime: ' + audioCurrentTime)
		Cookies.set('cohortAudioPosition', audioCurrentTime)
	}, 5000)
}

const onBtnPause = function() {
	isPaused = true
	clearInterval(cookieInterval)
}

const onBtnResume = function(){
	didResume = true
	audioCurrentTime = lastPosition
	onBtnPlay()
}

onMount( () => {
	lastPosition = Cookies.get('cohortAudioPosition')
	// console.log(lastPosition)
	if(lastPosition !== undefined && lastPosition != 0){
		canResume = true
	} else {
		cookieInterval = Cookies.set('cohortAudioPosition', 0, { expires: 0.25 /* quarter of a day */})
	}
})

</script>

{#if isPaused}
	{#if showResumeControls}
		<button 
			type="button" 
			on:click={onBtnResume} 
			class="btn btn-outline btn-outline-success btn-block">
			Resume
		</button>
	{/if}
	<button 
		type="button" 
		on:click={onBtnPlay} 
		class="btn btn-outline btn-block"
    class:btn-outline-success={!showResumeControls}
    class:btn-outline-secondary={showResumeControls} >
		Play{#if showResumeControls}&nbsp;from beginning{/if}
	</button>
	
{:else}
	<button 
		type="button" 
		on:click={onBtnPause} 
		class="btn btn-outline btn-outline-warning btn-block">
		{#if isLoaded}Pause{:else}Loading{/if}
	</button>
{/if}

<audio 
  id="audio_player" 
  src={audioUrl}
  preload={audioPreloadSetting}
  bind:paused={isPaused}
  bind:this={audioPlayer}
  bind:duration={audioDuration}
	bind:currentTime={audioCurrentTime}
></audio>

<p class="small">This site uses a temporary cookie to save your progress.</p>
