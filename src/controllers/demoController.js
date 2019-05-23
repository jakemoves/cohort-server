const moment = require('moment')
const fetch = require('node-fetch')

// for fluxdelux app only!!
exports.prepare_demo = (req, res) => {
  let serverURL = 'http://localhost:3000' // is this best? I don't know 

  fetch(serverURL + '/api/v1/events/' + req.params.id + '/open', { 
    method: 'PATCH'   
  }).then( response => {
    if(response.status == 200) {
      console.log('opened event ' + req.params.id + ' for demo')
      response.json().then( dbEvent => {

        let demoEvent = req.app.get('cohort').events.find( event => {
          return (event.id == dbEvent.id && event.label == dbEvent.label)
        })

        fetch(serverURL + '/api/v1/occasions', { method: 'GET' })
        .then( occasionsResponse => {
          occasionsResponse.json().then( occasions => {
            
            let demoOccasion = occasions.find( occasion => occasion.locationLabel == 'Demo for Apple' )
            
            if(demoOccasion === undefined){
              demoEvent.flagDemoIsActive = true

              // get the date & time
              let now = moment()
              let oneHourAgo = now.clone().subtract(1, 'hours')
              let oneAndAHalfHoursAgo = oneHourAgo.clone().subtract(0.5, 'hours')
              let oneHourFromNow = now.clone().add(1, 'hours')

              // make a new occasion centered on now
              let occasion = {
                locationLabel: 'Demo for Apple',
                locationCity: 'Cupertino',
                locationAddress: 'One Infinite Loop',
                doorsOpenDateTime: oneAndAHalfHoursAgo.format(),
                startDateTime: oneHourAgo.format(),
                endDateTime: oneHourFromNow.format()
              }

              let url = serverURL + '/api/v1/events/' + req.params.id + '/occasions'
              let payload = JSON.stringify(occasion)

              fetch(url, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: payload
              }).then( response2 => {
                if(response2.status == 200 || response2.status == 201){
                  response2.json().then( occasion => {
                    res.status(200)
                    res.write('Created demo occasion for event FluxDelux')
                    res.send()
                    return
                  })
                } else {
                  response2.text().then( error => {
                    res.status(500)
                    res.write(error)
                    res.send()
                    return
                  })
                }
              }).catch( error => {
                console.log(error)
              })
            } else {
              res.status(200)
              res.write('Demo occasion for event FluxDelux already exists')
              res.send()
            }
          })
        })
        
      })
    } else {
      response.text().then( error => {
        res.status(500)
        res.write(error)
        res.send()
      })
    }
  }).catch( error => {
    console.log(error)
  })
}

exports.prepare_lotx_demo = (req, res) => {
  // prep and send a notification with a cohort cue (sound 1 play)
  const payload = {
    text: "hello world",
    bundleId: "rocks.cohort.lotx",
    sound: "default.caf",
    cohortMessage: {
    	targetTags: ["all"],
    	mediaDomain: 0,
    	cueNumber: 1,
    	cueAction: 0
    }
  }

  const url = 'http://localhost:3000/api/v1/events/2/occasions/3/broadcast-push-notification'

  const payloadJson = JSON.stringify(payload)
  console.log()
  fetch(url, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: payloadJson
  }).then( response => {
    if(response.status == 200){
      response.text().then( responseText => {
        console.log(responseText)
        res.status(200)
        res.write('Sent cue to device')
        res.send()
        return
      })
    } else {
      response.text().then( error => {
        res.status(500)
        res.write(error)
        res.send()
        return
      })
    }
  }).catch( error => {
    console.log(error)
  })
}
// need to have a start-demo and clean-up-after-demo method...
