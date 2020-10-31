const init = function(){
  return new Promise( async (resolve, reject) => {
    try {
      await something.do() // can return a JS error, like one does with `throw new Error(message)`
    } catch(error) {
      
      return reject(new Error('legible error message'))
    }

    return reject(new Error('legible error message'))
    
    // another try catch
      // return reject on error
    
    // another try catch
      // return reject

    return resolve(response)

    // try to login in using demo credentials, as per registrationform.svelte 
      // success: you now have a secure cookie and can make secure requests
      // fail: probably the account doesn't exist in this environement

    
    // get a list of events, as per eventsStore
    // look for the demo event by name
      // if it's not there, create it as per EventCreationForm
    // look for the demo occasion by name
      // if it's not there, create it
      // if it's not open, display a note to the user telling them they have to open it manually via the admin site?
    // add demo cues to demo event
      // cue endpoint: /events/:id/episodes
      // [{ 
      //   "episodeNumber": 1,
      //   "label": "default",
      //   "cues": [{
      //     "mediaDomain": 3,
      //     "cueNumber": 1,
      //     "cueAction": 0,
      //     "targetTags": ["all"]
      //   }]
      // }]
  })
}

export default init