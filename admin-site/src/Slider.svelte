
<script>
let requestURL = "http://localhost:3000/api/v2/occasions/3/broadcast"
window.onCueSliderInput = (event) => {
  const SliderValue = event.target.value
  if( SliderValue == 100){  
// user dragged slider all the way across — emit 'activated' event
  try {
      fetch(requestURL, {
            method: 'POST',
            //for local testing//
            mode: 'no-cors',
            // //
            headers: { 'Content-Type': 'application/json'},
            body: { 
              "mediaDomain": 0,
              "cueNumber": 1,
              "cueAction": 0,
              "targetTags": ["all"]
            }
          })
          
          .then( response => {
            if(response.status == 200){
              response.text().then( text => {
                console.log(text)
                // vm.errorOnGo = false
                event.target.disabled = false
                event.target.value = 0
                event.target.classList.add('cue-sent-response-success')
                event.target.classList.remove('cue-sent-response-pending')
              })
            } else {
              response.json().then( body => {
                console.log('error on request: ' + body.error)
                // vm.errorOnGo = true
                // vm.goResults = body.error
                event.target.disabled = false
                event.target.value = 0
                event.target.classList.add('cue-sent-response-error')
                event.target.classList.remove('cue-sent-response-pending')
              })
            }
          }).catch( error => {
            console.log("Error on push notification broadcast!")
          })
    } catch (e) {
      console.log(e.message)
      // vm.errorOnGo = true
      } 
  }
};

</script>


<style>
label{
    margin: 1rem;
}
/* Slider CSS */
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
  background: #3071a9;
  border-radius: 50px;
  border: 0px solid #010101; }

#cue-control-go .cue-sent-response-pending::-webkit-slider-runnable-track {
  background: #5fa36f; }

#cue-control-go .cue-sent-response-success::-webkit-slider-runnable-track {
  background: #28a745; }

#cue-control-go .cue-sent-response-error::-webkit-slider-runnable-track {
  background: #dc3545; }

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

    
    </style>

   <div class="text-center">
        <label for="cue-control-go">Drag slider to the right to fire cue</label>
        <input class="cue-controls__cue-controls-go" type="range" min="0" max="100" value="0" id="cue-control-go" onchange=onCueSliderInput(event) v-bind:disabled="selectedOccasion == null">
    </div>