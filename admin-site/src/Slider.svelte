<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->

<!-- Slider for triggering cues -->
<script>
import { serverURL } from './ServerURLstore.js';
import { focusedOccasionID } from './UpdateUIstore.js';


export let broadcastStatus;
export let sliderCue;

let broadcastResults;

// cue broadcast
 window.onCueSliderInput = (event) => {
  
  const SliderValue = event.target.value
  if( SliderValue == 100){  
    event.target.disabled == true

    broadcastStatus = "pending"
    try {
      fetch(serverURL + "/occasions/" + focusedOccasionID + "/broadcast", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(sliderCue)
      })
      .then( response => {
        
        if(response.status == 200){
          response.json().then( results => {
            
            event.target.disabled = false
            event.target.value = 0

            const flatResults = results.map( result => result.success)

            const attempts = flatResults.length
            let successes = flatResults.filter( result => result == true).length

            broadcastResults = "Broadcast to " + successes + "/" + attempts + " devices"

            if(attempts == successes){
              // all devices received broadcast
              broadcastStatus = "full-success"
            } else {
              broadcastStatus = "partial-success"
            }
          })
        } else {
          response.text().then( errorMessage => {
            
            event.target.disabled = false
            event.target.value = 0
            
            broadcastResults = errorMessage
            broadcastStatus = "error"
            console.log('error on request: ' + errorMessage)
          })
        }
      }).catch( error => {
        event.target.disabled = false
        event.target.value = 0
        broadcastResults = errorMessage
        broadcastStatus = "error"
        
      })
    } catch (e) {
      event.target.disabled = false
      event.target.value = 0

      broadcastResults = errorMessage
      broadcastStatus = "error"
      console.log(e.message)
    } 
  }
};

</script>


<style>
/* Slider CSS */
label{
  margin: 1rem;
}
#cue-control-go {
  -webkit-appearance: none;
  width: 40%;
  margin: 1rem 5%;
  padding: 0; }

#cue-control-go:focus {
  outline: none; }

#cue-control-go::-webkit-slider-runnable-track {
  width: 100%;
  height: 50px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border-radius: 50px;
  border: 0px solid #010101; }

.slider-container.status-unsent  #cue-control-go::-webkit-slider-runnable-track {
  background: #007bff;
}

.slider-container.status-pending  #cue-control-go::-webkit-slider-runnable-track {
  background: #6db4ff;
}

.slider-container.status-full-success  #cue-control-go::-webkit-slider-runnable-track {
  background: #28a745;
}

.slider-container.status-partial-success  #cue-control-go::-webkit-slider-runnable-track {
  background: #ffc107;
}

.slider-container.status-error  #cue-control-go::-webkit-slider-runnable-track {
  background: #dc3545;
}


.slider-container .alert,
.slider-container.status-unsent .alert {
  display: none;
}

.slider-container.status-full-success .alert-success {
  display: block;
}

.slider-container.status-partial-success .alert-warning {
  display: block;
}

.slider-container.status-error .alert-danger {
  display: block;
}

/* #cue-control-go .cue-sent-response-pending::-webkit-slider-runnable-track {
  background: #5fa36f; }

#cue-control-go .cue-sent-response-success::-webkit-slider-runnable-track {
  background: #28a745; }

#cue-control-go .cue-sent-response-error::-webkit-slider-runnable-track {
  background: #dc3545; } */

#cue-control-go:disabled::-webkit-slider-runnable-track {
  background: #6C8CA8; }

#cue-control-go::-webkit-slider-thumb {
  box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  border: 1px solid #000000;
  height: 50px;
  width: 75px;
  border-radius: 50px;
  background: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: 0px; }

#cue-control-go:focus::-webkit-slider-runnable-track {
  background: #367ebd; }

#cue-control-go::-moz-range-track {
  width: 100%;
  height: 50px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #3071a9;
  border-radius: 0px;
  border: 0px solid #010101; }

#cue-control-go::-moz-range-thumb {
  box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  border: 1px solid #000000;
  height: 50px;
  width: 75px;
  border-radius: 50px;
  background: #ffffff;
  cursor: pointer; }

#cue-control-go::-ms-track {
  width: 100%;
  height: 50px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent; }

#cue-control-go::-ms-fill-lower {
  background: #2a6495;
  border: 0px solid #010101;
  border-radius: 0px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; }

#cue-control-go::-ms-fill-upper {
  background: #3071a9;
  border: 0px solid #010101;
  border-radius: 0px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; }

#cue-control-go::-ms-thumb {
  box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  border: 1px solid #000000;
  width: 75px;
  border-radius: 50px;
  background: #ffffff;
  cursor: pointer;
  height: 50px; }

#cue-control-go:focus::-ms-fill-lower {
  background: #3071a9; }

#cue-control-go:focus::-ms-fill-upper {
  background: #367ebd; }

  /* end of Slider style */

    
    </style>
 
    <div class="row mt-3">
      <div class="col-md-12">
        <div class="slider-container status-{broadcastStatus} text-center">
          <label for="cue-control-go">Drag slider to the right to fire cue</label>
          <input type="range" min="0" max="100" value="0" id="cue-control-go" onchange=onCueSliderInput(event)>
          <div class="alert alert-success text-center">
            {broadcastResults}
          </div>
          <div class="alert alert-warning text-center">
            {broadcastResults}
          </div>
          <div class="alert alert-danger text-center">
            {broadcastResults}
          </div>
        </div>
      </div>
    </div>