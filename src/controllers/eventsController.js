// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const knex = require('../knex/knex.js')
const WebSocket = require('ws')
const fetch = require('node-fetch')
const apn = require('apn')

const eventsTable = require('../knex/queries/event-queries')
const cohortMessagesTable = require('../knex/queries/cohort-message-queries')
// const CHDevice = require('../models/CHDevice')
const CHEvent = require('../models/CHEvent')

handleError = (httpStatusCode, error, res) => {
  console.log(res)
  console.log(error)

  if(error.message !== undefined){
    error = error.message
  }

  res.status(httpStatusCode)
  res.write(error)
  res.send()
}

exports.events = (req, res) => {
  eventsTable.getAll()
  .then( events => {
    res.status(200).json(events)
  })
  .catch( error => {
    handleError(500, error, res)
  })
}

exports.events_id = (req, res) => {
  eventsTable.getOneByID(req.params.id)
  .then( event => {
    if(event){
      res.status(200).json(event)
    } else {
      handleError(404, "Error: event with id:" + req.params.id + " not found", res)
    }
  })
  .catch( error => {
    handleError(500, error, res)
  })
}

exports.events_create = (req, res) => {
  if(req.body.label == null || req.body.label === undefined || req.body.label == ""){
    handleError(500, "Error: request must include an event label (e.g., title of a show)", res)
    return
  }
    
  eventsTable.addOne({ label: req.body.label })
  .then( event => {
    res.status(201)
    res.location('/api/v2/events/' + event.id)
    res.json(event)
  })
  .catch( error => {
    handleError(500, error, res)
  })
}

exports.events_delete = (req, res) => {
  // keeping this for rewriting -- it will need to check for open occasions on an event

  // if(req.app.get("cohort").events.length > 0 &&
  //   req.app.get("cohort").events.find( event => event.id == req.params.id) !== undefined){
  //   res.status(403)
  //   res.write("Error: this event must be closed before it can be deleted")
  //   res.send()
  // } else {
    
    return eventsTable.deleteOne(req.params.id)
    .then( (deletedIds) => {
      if(deletedIds.length == 1) {
        res.sendStatus(204)
      } else {
        handleError(404, "Error: more than one event was deleted?!", res)
      }
    })
    .catch( error => {
      handleError(500, error, res)
    })  
  // }
}

// exports.events_checkIn = (req, res) => {
//   //  req has mandatory params: eventId, occasionId

//   //  req has optional POST fields:
//   //    apnsDeviceToken (string, generated on iOS devices for push notifications)
//   //    tags (array of strings, used to segment / group devices)
//   //
    
//   // if the event is open, we need to add the device to it in memory
//   let event = req.app.get("cohort").events.find( event => event.id == req.params.eventId)
//   if( event !== undefined ){
//     // verify event is open, return error if not

//     // make sure the occasion is processed and tracked?
//     if(req.params.occasionId != null && req.params.occasionId !== undefined){
//       var occasion_id = parseInt(req.params.occasionId)
//     }

//     // check if this device already exists in memory in this event

//     //yes it's in memory
//       // send a response
    
//     // no it's not
//       // do the check-in
//         // create device here in memory from request
//         // check in
//       // send a response

    
//   } else {
//     // event does not exist
//     // send error
//   }
// }

// exports.events_open = (req, res) => {
//   eventsTable.getOneByIDWithDevices(req.params.id)
//   .then( dbEvent => {
//     // update db
//     eventsTable.open(req.params.id)
//     .then( dbOpenedEvent => { // dbOpenedEvent does not have devices along with it
//       if(req.app.get('cohort').events.find( event => event.id == dbOpenedEvent.id) === undefined){
//         let event =  CHEvent.fromDatabaseRow(dbEvent)
//         req.app.get('cohort').addListenersForEvent(event)
//         event.open()
//         // need to add listeners here for device add/remove... and then figure out how to DRY that up (repeated in app.js)
//       } else {
//         console.log("Error: failed to open event, inconsistency between db and memory")
//       }

//       res.status(200)
//       res.json(dbOpenedEvent)
//       res.send()
//     })
//     .catch( error => {
//       console.log(error)
//     })
//   })
// }

// exports.events_close = (req, res) => {
//   let event = req.app.get('cohort').events.find( event => event.id == req.params.id)
//   if( event !== undefined ){ 
//     event.close()
//   }
//   // update db
//   eventsTable.close(req.params.id)
//   .then( event => {
//     res.status(200)
//     res.json(event)
//     res.send()
//   })
// }

// exports.events_devices = (req, res) => {
//   // should always have occasionId as well
//   // is event open?
//     // send devices from memory
//   // else
//     // send error
// }

// exports.events_broadcast = (req, res) => {
//   let event =  req.app.get("cohort").events
//   .find( event => event.id == req.params.id)

//   let connectedSockets = event.devices
//     .filter( device => device.isConnected())
//     .map( device => device.socket)

//   if(connectedSockets.length < 1){
//     res.status(403)
//     res.write("Warning: No devices are connected via WebSockets, broadcast was not sent")
//     res.send()
// 		return
//   } else {
//     console.log("connectedSockets: " + connectedSockets.length)
//   }

//   // per https://github.com/websockets/ws/issues/617#issuecomment-393396339
// 	let data = Buffer.from(JSON.stringify(req.body)) // no binary
// 	let frames = WebSocket.Sender.frame(data, {
// 		fin: true,
// 		rsv1: false,
// 		opcode: 1,
// 		mask: false,
// 		readOnly: false
// 	})

// 	let sends = connectedSockets.map( (socket) => {

// 		// skip this client if it's not open
// 		if(socket.readyState != WebSocket.OPEN) {
// 			console.log("skipped a socket due to readyState")
// 			return Promise.resolve()
// 		}

// 		return new Promise( (fulfill, reject) => {
// 			socket._sender.sendFrame(frames, (error) => {
// 				if(error){
// 					// catch async socket write errors
// 					console.log(error)
// 					return reject(error)
// 				}
// 				fulfill()
// 			})
// 		})
// 	})

// 	Promise.all(sends).then(() => {
// 		res.status(200)
// 		res.write('Successfully broadcast to ' + connectedSockets.length + ' clients')
// 		res.send()
// 	})
// }

// exports.events_broadcast_push_notification = (req, res) => {
//   if(req.params.eventId == null || req.params.eventId === undefined){
//     res.status(400)
//     res.write("Error: request must include 'eventId' field")
//     res.send()
//   }

//   eventsTable.getOneByID(req.params.eventId).then( event => {
//     // DRY this up
//     if(event == null){
//       res.status(404)
//       res.write("Event with id:" + req.params.eventId + " not found")
//       res.send()
//       return
//     }
    
//     let devices = eventsTable.getDevicesForEvent(req.params.eventId).then( devices => {
//       // handle errors!

//       if(req.query.tag !== undefined){
//         devices = devices.filter( device => {
//           console.log(device)
//           if(device.tags == null) { return false }
//           if(!Array.isArray(device.tags)){ 
//             return new Error("Error: tags for device id:" + device.id + " are not an array")
//           }
//           return device.tags.includes(req.query.tag)
//         })
//       } // duped to devicesController, DRY it up

//       broadcastPushNotification(devices, req, res) // do NOT send the req / res to the service when this gets refactored
//     })
//   })
// }

// exports.events_occasions_broadcast_push_notification = (req, res) => {
//   if(req.params.eventId === undefined || req.params.eventId == null){
//     res.status(400)
//     res.write("Error: request must include 'eventId' field")
//     res.send()
//     return
//   }

//   if(req.params.occasionId === undefined || req.params.occasionId == null){
//     res.status(400)
//     res.write("Error: request must include 'occasionId' field")
//     res.send()
//     return
//   }

//   eventsTable.getOneByID(req.params.eventId).then( event => {
//     if(event == null){
//       res.status(404)
//       res.write("Event with id:" + req.params.eventId + " not found")
//       res.send()
//       return
//     }

//     let devices = eventsTable.getDevicesForEventOccasion(req.params.eventId, req.params.occasionId).then( devices => {
      
//       if(req.query.tag !== undefined){
//         devices = devices.filter( device => {
//           if(device.tags == null) { return false }
//           return device.tags.includes(req.query.tag)
//         })
//       } // duped to devicesController, DRY it up

//       broadcastPushNotification(devices, req, res) // do NOT send the req / res to the service when this gets refactored
//     })
//   })
// }

// // this feels Service-y
// function broadcastPushNotification(devices, req, res) {
// 	if(req.body != null 
// 		&& req.body.text != null && req.body.text != "" 
// 		&& req.body.bundleId != null && req.body.bundleId != ""){
		
// 		let note = new apn.Notification()
		
// 		note.expiry = Math.floor(Date.now() / 1000) + 3600 // 1 hr
// 		note.badge = 0
		
// 		if(req.body.sound == null || 
// 			typeof(req.body.sound) == undefined ||
// 			req.body.sound == ""){
// 			note.sound = "ping.aiff"
// 		} else {
// 			note.sound = req.body.sound
// 		}

// 		if(req.body.mediaURL) {
// 			note.mutableContent = 1
// 			note.payload.mediaURL = req.body.mediaURL
// 		}

// 		if(req.body.cohortMessage) {
//       note.payload.cohortMessage = req.body.cohortMessage
//       console.log('saving cohort message on server')
//       cohortMessagesTable
//       .addOne(req.body.cohortMessage, req.params.eventId)
//       .catch( error => {
//         console.log(error)
//       })
// 		} else {
//       // we save the text of notifications as cohort text cues. this is useful when an app wakes up and wants to display the most recent notification within its own UI
//       let tags
//       if(req.query.tag === undefined){
//         tags = ["all"]
//       } else {
//         tags = ["" + req.query.tag]
//       }
//       cohortMessage = {
//         targetTags: tags,
//         mediaDomain: 2,
//         cueNumber: 0,
//         cueAction: 0,
//         cueContent: req.body.text
//       }
//       console.log('saving cohort text cue on server for notification')
//       console.log(cohortMessage)
//       cohortMessagesTable
//       .addOne(cohortMessage, req.params.eventId)
//       .catch( error => {
//         console.log(error)
//       })
//     }

// 		note.body = req.body.text
// 		note.payload.messageFrom = 'Cohort Server'
// 		note.topic = req.body.bundleId
		
// 		devices = devices.filter((device) => {
// 			return device.apnsDeviceToken != null
// 		})

// 		if(devices.length == 0) {
// 			res.statusCode = 200
// 			res.write("Warning: No devices are registered to receive notifications")
// 			res.send()
// 			console.log("Error: broadcast attempted but no devices registered")
// 			return
// 		} 

// 		const apnProvider = req.app.get('apnProvider')

// 		var results = Promise.all(
// 			devices.map((device) => {
// 				const token = device.apnsDeviceToken
// 				if(process.env.NODE_ENV == "test"){
// 					if(req.body.simulate != null && typeof req.body.simulate != undefined) {
// 						switch(req.body.simulate){
// 							case "failure":
// 								break;
// 							case "success":
// 								return Promise.resolve({ sent: [token], failed: [] })
// 								break;
// 							case "partial success":
// 								break;
// 							default:
// 							// TODO return a fail, need a simulate setting
// 								break;
// 						}
// 					} else {
// 						// TODO return a fail, need a simulate setting
// 					}
// 				} else {
// 					return apnProvider.send(note, token)
// 				}
// 			})
// 		).then((results) => {

// 			let failures = results.filter((result) => { 
// 				return result.failed.length > 0			
// 			})

// 			if(failures.length == devices.length){
// 				// total failure
// 				res.statusCode = 502
// 				res.json({ 
// 					error: "Error: failed to send notification to any devices",
// 					results: failures
// 				})
// 				res.send()
// 			} else if(failures.length > 0 && failures.length < devices.length){
// 				// partial success 
// 				// TODO manually test
// 				res.statusCode = 200 // TODO should this really be 200?
// 				res.json({
// 					error: "Error: failed to send notification to " + failures.length + "/" + devices.length + " registered devices",
// 					results: failures
// 				})
// 				res.send()
// 			}  else if(failures.length == 0){
// 				// no failures...
// 				// TODO manually test
// 				let successes = results.filter((result) => { 
// 					return result.sent.length > 0 
// 				})
// 				if (successes.length == devices.length){
// 					// ... total success!
// 					res.statusCode = 200
// 					res.write("Sent notifications to " + successes.length + "/" + devices.length + " registered devices")
// 					res.send()
// 				}
// 			}
// 		})
// 	} else {
// 		res.statusCode = 400
// 		if(req.body.text == null || req.body.text == ""){
// 			res.write("Error: request must include a 'text' object")
// 		} else if(req.body.bundleId == null || req.body.bundleId == ""){
// 			res.write("Error: request must include a 'bundleId' object, corresponding to the target app's bundle identifier")
// 		}
// 		res.send()
// 		console.log("failed to send notification")
// 	}
// }

// exports.events_lastCohortMessage = (req, res) => {
//   if(req.query.tag === undefined){
//     cohortMessagesTable.getLatestByEvent(req.params.eventId)
//     .then( msg => {
//       if(msg !== undefined && msg != null){
//         res.status(200).json(msg)
//       } else {
//         res.sendStatus(404)
//       }
//     })
//     .catch( error => {
//       console.log(error)
//       res.status(500)
//       res.write(error)
//       res.send()
//     })
//   } else {
//     cohortMessagesTable.getLatestByEventForTag(req.params.eventId, req.query.tag)
//     .then( msg => {
//       if(msg !== undefined && msg != null){
//         res.status(200).json(msg)
//       } else {
//         res.sendStatus(404)
//       }
//     })
//     .catch( error => {
//       console.log(error)
//       res.status(500)
//       res.write(error)
//       res.send()
//     })
//   }
// }

// SUPER HACKY
// exports.events_getLotXARTweaks = (req, res) => {
//   if(req.params.id == 2){
//     res.status(200)
//   const tweaks = {
//       "scale": [20.012526, 11.866646],
//       "position" :[0.0635, 2.2667, 0.0]
//     }
//     res.json(tweaks)
//   } else {
//     res.sendStatus(404)
//   }
// }


// for later
// if(event.flagDemoIsActive != null && event.flagDemoIsActive == true){
    //   console.log('demo flag is active...')
    //   // demo mode allows one check-in, then deletes the occasion
    //   let serverURL = 'http://localhost:3000'
    //   fetch(serverURL + '/api/v1/occasions', {
    //     method: 'GET'
    //   }).then( response => {
    //     if(response.status == 200) {
    //       response.json().then( occasions => {
    //         let demoOccasion = occasions.find( occasion => occasion.locationLabel == 'Demo for Apple')

    //         if(demoOccasion === undefined) {
    //           let error = 'Error: demo occasion does not exist'
    //           console.log(error)
    //           res.status(500)
    //           res.write(error)
    //           res.send()
    //         }

    //         // start an episode in 5 seconds
    //         console.log('   ...starting episode 1 in five seconds')
    //         setTimeout(() => {
    //           console.log('starting episode 1 for demo')
    //           let message = {
    //             targetTags: ["all"],
    //             mediaDomain: "episode",
    //             cueNumber: 1,
    //             cueAction: "go"
    //           }
    //           fetch(serverURL + '/api/v1/events/' + event.id + '/broadcast',{ 
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json'},
    //             body: JSON.stringify(message)
    //           })
    //         }, 5000)

    //         fetch(serverURL + '/api/v1/occasions/' + demoOccasion.id, {
    //           method: 'DELETE'
    //         }).then( response => {
    //           if(response.status == 204){
    //             console.log('deleted demo occasion')
    //             event.flagDemoIsActive = null
    //           } else {
    //             console.log('Warning: failed to delete demo occasion')
    //           }
    //         })
    //       })
    //     } else {
    //       console.log('Error: could not get occasions to process demo check-in')
    //     }
    //   })
    // }