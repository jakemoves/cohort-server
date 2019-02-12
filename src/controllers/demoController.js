const moment = require('moment')
const fetch = require('node-fetch')

exports.prepare_demo = (req, res) => {
  let serverURL = req.protocol + '://' + req.get('host')
  
  fetch(serverURL + '/api/v1/events/' + req.params.id + '/open', { 
    method: 'PATCH'   
  }).then( response => {
    if(response.status == 200) {
      console.log('opened event ' + req.params.id + ' for demo')
      response.json().then( dbEvent => {

        let demoEvent = req.app.get('cohort').events.find( event => {
          return (event.id == dbEvent.id && event.label == dbEvent.label)
        })
        demoEvent.flagDemoIsActive = true

        // get the date & time
        let now = moment()
        let oneHourAgo = now.clone().subtract(1, 'hours')
        let oneAndAHalfHoursAgo = oneHourAgo.clone().subtract(0.5, 'hours')
        let oneHourFromNow = now.clone().add(1, 'hours')

        // make a new occasion centered on now
        let occasion = {
          locationLabel: 'Apple Park',
          locationCity: 'Cupertino',
          locationAddress: 'One Infinite Loop',
          doorsOpenDateTime: oneAndAHalfHoursAgo.format(),
          startDateTime: oneHourAgo.format(),
          endDateTime: oneHourFromNow.format()
        }

        console.log('creating demo occasion')
        let url = serverURL + '/api/v1/events/' + req.params.id + '/occasions'
        let payload = JSON.stringify(occasion)
        console.log(url)
        console.log(payload)

        fetch(url, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: payload
        }).then( response2 => {
          console.log(response2.status)
          if(response2.status == 200 || response2.status == 201){
            response2.json().then( occasion => {
              console.log(occasion)
              res.status(200)
              res.write('Created demo occasion for event FluxDelux')
              res.send()
            })
          } else {
            response2.text().then( error => {
              res.status(500)
              res.write(error)
              res.send()
            })
          }
        }).catch( error => {
          console.log(error)
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

// need to have a start-demo and clean-up-after-demo method...