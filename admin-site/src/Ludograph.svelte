<script>
  import { onMount } from 'svelte'
  import {Howl, Howler} from 'howler'
  import { DateTime } from 'luxon'
  import Graph from './graph-data-structure.js'
  import Slider from './Slider.svelte'
  import WebsocketConnectionIndicator from './WebsocketConnectionIndicator.svelte'
  import { serverURL } from './ServerURLstore.js';
  import shortNames from './optionShortNames.js'

  // let endograph = function(){
  //   let id = "exercise"
  //   let eGraph = new Graph()
  //   eGraph.addNode('Exercise A')
  //   eGraph.addNode('Exercise B')
  //   eGraph.addEdge('Exercise A', 'Exercise B')
  //   eGraph.addEdge('Exercise B', 'Exercise A')

  //   let currentEndonode = {id:'Play pebbles'}
    
  //   const nextNode = () => {
  //     currentEndonode.id = eGraph.adjacent(currentEndonode)[0]
  //     console.log('endograph: current node: ' + currentEndonode)
  //   }

  //   let result = {
  //     id,
  //     eGraph,
  //     nextNode,
  //     currentEndonode
  //   }

  //   return result
  // }

  // let exerciseEndograph = endograph()
  // exerciseEndograph.nextNode()
  // exerciseEndograph.nextNode()
  import CohortClientSession from './CHClientSession.js'
	
	/*
	 *    Prepare Cohort functionality (for live cues)
	 */	
	let environment = "prod" // can be local, dev, prod
	let cohortSocketURL

	switch(environment){
		case "local":
			cohortSocketURL = 'ws://localhost:3000/sockets'
			break
		case "dev": 
			cohortSocketURL = 'ws://jakemoves-old.local:3000/sockets'
			break
		case "prod":
			cohortSocketURL = 'wss://otm.cohort.rocks/sockets'
			break
		default:
			throw new Error("invalid 'environment' value")
	}

	let itineraryEvent = {
		eventId: 10,
		episodes: [{
			label: "default",
			description: "",
			number: 1,
			cues: []
		}]
  }
  
	let cohortOccasion = 14
  let connectedToCohortServer = false
  let onMountTime, showReportSendTime // proxies for start and end times...
  
  $: sliderBroadcastStatus = "unsent"
  
	$: latestTextCueContent = ""
	$: splitTextCueContent = latestTextCueContent.split("|")

	let optionButtonLabels
	$: if(splitTextCueContent[0] != ""){
		optionButtonLabels = splitTextCueContent
	} else {
		optionButtonLabels = []
	}

	// set grouping info (tags)
	// this is used to target cues to specific groupings
	let cohortTags = [ "stage_manager" ]
	let cohortSession = new CohortClientSession(cohortSocketURL, cohortOccasion, cohortTags)
  let requestUpdatedDeviceStatesInterval
	cohortSession.on('connected', () => {
    connectedToCohortServer = true
    
    requestUpdatedDeviceStatesInterval = setInterval(() => {
      const payload = {
        action: 'request_device_states',
        occasionId: cohortOccasion
      }
      cohortSession.send(payload)
    }, 5000)

		console.log('connected to cohort server')
	})
	cohortSession.on('disconnected', (message) => {
		connectedToCohortServer = false
		console.log(connectedToCohortServer)
  })
  cohortSession.on('dataReceived', msg => {
    if(msg.dataIdentifier == 'device_states'){
      console.log(msg.data)
      deviceStates = msg.data
    }
  })

	cohortSession.on('cueReceived', (cue) => {
		console.log('cue received:')
		console.log(cue)

		let cueMatchesTarget = false
		
		// console.log(cohortTags)
		for(var i = 0; i < cue.targetTags.length; i++){
			// console.log(cue.targetTags[i])
			if(cohortTags.includes(cue.targetTags[i])){
				cueMatchesTarget = true
				break
			}
		}

		if(cueMatchesTarget){
      if(cue.mediaDomain == 3 && cue.cueContent !== undefined){
        if(cue.cueNumber == 1){

        } else if(cue.cueNumber == 2){
          const chosenOption = cue.cueContent

          if(reachableNodeIds.includes(chosenOption)){
            selectedOption = chosenOption
            alertSound.play()
          } else {
            throw new Error("Audience choice (" + chosenOption + ") is not valid...")
          }
        }
      }
    }
	})

  cohortSession.init()

  let triggerBroadcast = false
  let autoBroadcast = false
  let autoBroadcastTimeout

  $: if(autoBroadcast == false){
    if(autoBroadcastTimeout !== undefined){
      clearTimeout(autoBroadcastTimeout)
    }
  }

  onMount(() => { 
    onMountTime = DateTime.local()
  })

  /*
   *   End Cohort
   */

  let alertSound = new Howl({
    src: './sounds/Wild-Eep.mp3'
  })

  let nodes = [{
    id: "Start"
  },{
    id: "Wake up"
  },
  // turn 1
  {
    id: "Brush teeth",
    connectOnTurn: 1,
    disconnectOnTurn: 3
  },{
    id: "Eat breakfast",
    connectOnTurn: 1,
    disconnectOnTurn: 4
  },{
    id: "Meditate",
    connectOnTurn: 1
  },{
    id: "Exercise",
    connectOnTurn: 1
  },{
    id: "Exercise 2",
    connectOnNodeVisit: "Exercise"
  },{
    id: "Take bird bath",
    connectOnNodeVisit: "Exercise 2"
  },{
    id: "Drink hooch",
    connectOnTurn: 1
  }
  // turn 3
  ,{
    id: "Pray",
    connectOnTurn: 3
  },{
    id: "Pray aloud",
    connectOnNodeVisit: "Pray"
  }
  ,{
    id: "Play trashketball",
    connectOnTurn: 3
  }
  ,{
    id: "Retrieve paper",
    connectOnNodeVisit: "Play trashketball"
  }
  ,{
    id: "Stack stones",
    connectOnTurn: 3
  },{
    id: "Stack stones 2",
    connectOnNodeVisit: "Stack stones"
  },{
    id: "Knock down stones",
    connectOnNodeVisit: "Stack stones 2"
  }
  ,{
    id: "Make fire",
    connectOnTurn: 3
  } ,{
    id: "Put out fire",
    connectOnNodeVisit: "Make fire"
  }
  // turn 5
  ,{
    id: "Dance",
    connectOnTurn: 5
  },{
    id: "Do Yoga",
    connectOnTurn: 5
  },{
    id: "Look at family photos",
    connectOnTurn: 5
  },{
    id: "Read",
    connectOnTurn: 5
  },{
    id: "Write line of song",
    connectOnTurn: 5
  },{
    id: "Write line of song 2",
    connectOnNodeVisit: "Write line of song"
  },{
    id: "Write line of song 3",
    connectOnNodeVisit: "Write line of song 2"
  },{
    id: "Write line of song 4",
    connectOnNodeVisit: "Write line of song 3"
  },{
    id: "Sing verse of song",
    connectOnNodeVisit: "Write line of song 4"
  }
  // turn 6
  ,{
    id: "Tell",
    connectOnTurn: 6
  },{
    id: "Donate organs",
    connectOnNodeVisit: "Tell"
  },{
    id: "Request final meal",
    connectOnNodeVisit: "Tell",
    disconnectOnTurn: 10
  },{
    id: "Eat final meal",
    connectOnNodeVisit: "Request final meal"
  }
  ,{
    id: "Hatch escape plan",
    connectOnNodeVisit: "Tell"
  },{
    id: "Psych yourself up",
    connectOnNodeVisit: "Tell"
  },{
    id: "Make phone call",
    connectOnNodeVisit: "Tell"
  },{
    id: "Write letter",
    connectOnNodeVisit: "Tell"
  },{
    id: "Cast letter into sea",
    connectOnNodeVisit: "Write letter"
  }
  // turn 7
  ,{
    id: "Eat lunch",
    connectOnTurn: 7,
    disconnectOnTurn: 9
  }
  // turn 12
  ,{
    id: "Eat dinner",
    connectOnTurn: 12,
    disconnectOnTurn: 14
  }
  // turn 14
  ,{
    id: "Get ready for bed",
    connectOnTurn: 14,
    disconnectOnTurn: 21
  },{
    id: "Sleep",
    connectOnNodeVisit: "Get ready for bed"
  },{
    id: "Dream",
    connectOnNodeVisit: "Sleep"
  }
  ]
  
  let graph = Graph()
  $: graph

  nodes.forEach( node => {
    graph.addNode(node.id)
  })
  graph.addEdge("Start", "Wake up")

  let currentNode = nodes.find(node => node.id == "Start")
  let turn = 0

  $: currentInWorldTime = formatAs24HourTime(turn + 5)
  $: nextTurnInWorldTime = formatAs24HourTime(turn + 6)
  const formatAs24HourTime = (someInteger) => {
    return ((someInteger % 24) + "00").padStart(4, '0')
  }

  let countdown = 60
  let countdownInterval
  let selectedOption = "" // audience member selects an option every turn
  let blankOptionPlaceholder = ""
  let visitedNodeIds = []
  let deviceStates = []

  let activePlayerIndex = 0
  // let activePlayerConnectionState = { guid: ""}
  // $: if(activePlayerIndex !== undefined && playerConnectionStates.length > 0){
  //   activePlayerConnectionState = playerConnectionStates[activePlayerIndex]
  // }
  $: if(playerConnectionStates.length > 0 && activePlayerIndex >= playerConnectionStates.length){
    console.log("Warning: activePlayerIndex may refer to nonexistent player, fixing inline")
    activePlayerIndex = playerConnectionStates.length - 1
  } 

  let activePlayerGuid
  $: {
    if(playerConnectionStates.length == 0){
      activePlayerGuid = ""
    } else if(playerConnectionStates.length > 0){
      const activePlayer = playerConnectionStates[activePlayerIndex]
      if(activePlayer !== undefined){
        activePlayerGuid = activePlayer.guid
      } else {
        activePlayerGuid = ""
      }
    }
    // console.log("active player guid: " + activePlayerGuid)
  }

  $: playerConnectionStates = deviceStates.filter( device => {
    // don't include this (stage mangager's) device or another client on the same occasion's admin page
    if(device.guid == cohortSession.guid || !device.guid.includes("|")){
      return false
    } else {
      return true
    }
  })
  .map( device => {
    // console.log(device.guid)
    // console.log(device.guid.split("|"))
    const playerHoursOfSleep = parseInt(device.guid.split("|")[1])
    const playerProposedActivity = device.guid.split("|")[2]
    // console.log(playerHoursOfSleep)
    if(!Number.isInteger(playerHoursOfSleep)){
      playerHoursOfSleep = 0
    }

    let result = {
      guid: device.guid,
      playerHoursOfSleep: playerHoursOfSleep,
      proposedActivity: playerProposedActivity
    }

    if(device.connected == true){ result.state = "active" }
    else if(device.connected == false){ result.state = "inactive" }
    else { result.state = "unknown" }

    return result
  })
  .sort(((a, b) => b.playerHoursOfSleep - a.playerHoursOfSleep))

  $: playerHoursOfSleep = deviceStates.map( device => {
    return 
  })

  $: thisDevice = deviceStates.find( device => {
    return device.guid == cohortSession.guid
  })

  let playerActivities
  $: playerActivities = playerConnectionStates.map( playerConnectionState => {
    return playerConnectionState.proposedActivity
  })
  let suppressedActivities = []
  $: approvedPlayerActivities = playerActivities.filter( activity => {
    for(var i = 0; i < suppressedActivities.length; i++){
      if(activity == suppressedActivities[i]){
        return false
      } 
    }
    return true
  })

  let connectionState = "unknown"
  $: {
    if(thisDevice === undefined){ connectionState = "unknown" }
    else if(thisDevice.connected === undefined){connectionState = "unknown"}
    else if(thisDevice.connected == true){ connectionState = "active" }
    else if(thisDevice.connected == false){ connectionState = "inactive"}
  }

  const startCountdown = function(){
    countdown = 60
    countdownInterval = setInterval(function(){
      countdown--
    }, 1000)
  }

  $: currentNode 
  $: adjacentNodeIds = graph.adjacent(currentNode.id)
  $: reachableNodeIds = adjacentNodeIds.filter( adjacentId => !visitedNodeIds.includes(adjacentId))
  
  let sliderLabel = "Show options to players"

  $: connectedNodes = function(nodeId){
    // console.log(graph.adjacent(nodeId))
    return graph.adjacent(nodeId)
  }

  const setupNextTurn = function(){
    // finish previous turn & reset
    blankOptionPlaceholder = ""

    if(turn == 0){alertSound.play()}

    visitedNodeIds.push(currentNode.id)
    visitedNodeIds = visitedNodeIds

    currentNode = nodes.find(node => node.id == selectedOption)
    if(currentNode === undefined){
      throw new Error('selected option (' + selectedOption + ') is not valid')
      return
    }

    // reset options and cue status
    selectedOption = ""
    sliderBroadcastStatus = "unsent"

    // if(currentNode.endograph !== undefined){
    //   currentNode = currentNode.endograph.currentEndonode
    // }

    // setup for next turn
    turn++
    if(playerConnectionStates.length > 1){
      if(activePlayerIndex === undefined){
        activePlayerIndex = 1 // starting on "second turn"
      } else {
        activePlayerIndex = (activePlayerIndex + 1) % playerConnectionStates.length
      }
    }

    console.log("turn: " + turn)
    console.log("current node: " + currentNode.id)
    console.log("visited nodes: " + visitedNodeIds.join(", "))
    clearInterval(countdownInterval)
    startCountdown()
    if(autoBroadcast == true){
      autoBroadcastTimeout = setTimeout( function(){ 
        triggerBroadcast = true 
      }, 30000)
    }

    const nodesToDisconnectThisTurn = nodes.filter( node => {
      return (node.disconnectOnTurn !== undefined && node.disconnectOnTurn == turn)
    })

    nodesToDisconnectThisTurn.forEach( node => {
      console.log("disconnecting option " + node.id + ", which has " + graph.indegree(node.id) + " incoming edges")

      const ancestors = graph.ancestors(node.id)

      ancestors.forEach( ancestorNode => {
        graph.removeEdge(ancestorNode, node.id)
      })

      console.log("disconnected option " + node.id + ", it now has " + graph.indegree(node.id))
    })

    const nodesToConnectThisTurn = nodes.filter( node => {
      let includeNode = false
      if(node.connectOnTurn !== undefined && node.connectOnTurn == turn){
        includeNode = true
      } else if(node.connectOnNodeVisit == currentNode.id){
        includeNode = true
      }
      return includeNode
    })

    const currentReachableNodes = reachableNodeIds

    nodesToConnectThisTurn.forEach( node => {
      // console.log("connecting " + node.id)
      // connect it to the current node
      // graph.addEdge(currentNode.id, node.id)

      // connect it to other nodes being connected this turn
      const otherNodes = nodesToConnectThisTurn.filter( recursiveNode => recursiveNode.id != node.id)  
      // console.log("  sibling nodes: " + otherNodes.map(node => node.id).join(", "))
      otherNodes.forEach( otherNode => {
        graph.addEdge(node.id, otherNode.id)
      })

      // console.log("  existing nodes: ")
      currentReachableNodes.forEach( reachableId => {
        console.log("    " + reachableId)
        // connect currently reachable nodes to it
        graph.addEdge(reachableId, node.id)
        // connect it to currently reachable nodes
        graph.addEdge(node.id, reachableId)
      })
    })

    // console.log(adjacentNodeIds.join(", "))
    // console.log("reachable nodes: " + reachableNodeIds.join(", "))
    // console.log(graph.ancestors(currentNode.id))

    // HAAAAAAAACK
    if(currentNode.id == "Get ready for bed"){
      console.log("removing all options from 'Get ready for bed' except for 'Sleep', there are " + graph.outdegree(currentNode.id) + " outgoing edges total")

      const adjacent = graph.adjacent(currentNode.id)

      adjacent.forEach( adjacentNode => {
        if(adjacentNode != "Sleep"){
          graph.removeEdge(currentNode.id, adjacentNode)
        }
      })

      console.log("disconnected option " + currentNode.id + ", it now has " + graph.outdegree(currentNode.id) + " outgoing edges")

      // connect player activities
      approvedPlayerActivities.forEach( activity => {
        nodes.push({id: activity})
        graph.addNode(activity)
        graph.addEdge('Dream', activity)
      })

      nodes.push({id: 'Go'})
      graph.addNode('Go')
      approvedPlayerActivities.forEach( activity => {
        graph.addEdge(activity, 'Go')
      })

    } else if(currentNode.id == "Sleep"){
      console.log("removing all options from 'Sleep' except for 'Dream', there are " + graph.outdegree(currentNode.id) + " outgoing edges total")

      const adjacent = graph.adjacent(currentNode.id)

      adjacent.forEach( adjacentNode => {
        if(adjacentNode != "Dream"){
          graph.removeEdge(currentNode.id, adjacentNode)
        }
      })

      console.log("disconnected option " + currentNode.id + ", it now has " + graph.outdegree(currentNode.id) + " outgoing edges")
    }
  }

  const onOptionBtn = function(nodeId){
    selectedOption = nodeId
    if(playerConnectionStates.length > 0){
      // trigger a broadcast, needed to clear buttons
    }
  }
  
  const handleSliderMessage = function(event){
    const msg = event.detail
    if(msg.broadcastStatus !== undefined && (msg.broadcastStatus == "full-success" || msg.broadcastStatus == "partial-success")){
      triggerBroadcast = false
      blankOptionPlaceholder = "..."
    }
  }

  let showReportSentSuccessfully = false
  const onSendShowReport = function(){
    let today = DateTime.local()
    showReportSendTime = today

    const emailRecipient = 'aliceferreyra@yahoo.com'
    // const emailRecipient = 'luckyjakemoves@gmail.com'
    const emailSubject = 'Show report: the Itinerary - ' + today.toLocaleString('dd-MM-yyyy')
    
    let emailBody = 
`This is a Cohort show report for The Itinerary on ${today.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}.

The Cohort Control Panel was opened at ${onMountTime.toLocaleString(DateTime.TIME_SIMPLE)}.
This report is being sent at ${showReportSendTime.toLocaleString(DateTime.TIME_SIMPLE)}.

Sequence of player choices:
${visitedNodeIds.join(', ')}

Let your Cohort operator (who am I kidding, it's Jake here) know if there's other information that would be useful to include in this report.`

    fetch(serverURL + "/services/mail", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({emailBody: emailBody, emailSubject: emailSubject, emailRecipient: emailRecipient})
    }).then( response => {
      console.log(response)
      showReportSentSuccessfully = true
    }).catch( error => {
      console.log(error)
    })
  }

  // import * as d3 from 'd3'

  // $: d3nodes = graph.serialize().nodes
  // $: d3links = graph.serialize().links

  // var simulation, svg
  // onMount(() => {
  //   simulation = d3.forceSimulation(d3nodes)
  //     .force("link", d3.forceLink(d3links).id(d => d.id))
  //     .force("charge", d3.forceManyBody().strength(-400))
  //     .force("x", d3.forceX())
  //     .force("y", d3.forceY())

  //   svg = d3
  //     .select(".diagram")
  //     .append("svg")
  //     .attr("height", 480)
  //     .attr("width", 480)
  //     .attr("viewBox", [-240, -240, 480, 480])
  //     .style("font", "12px sans-serif")

  //   svg.append("defs")
  //     .append("marker")
  //       .attr("id", d => 'arrow')
  //       .attr("viewBox", "0 -5 10 10")
  //       .attr("refX", 15)
  //       .attr("refY", -0.5)
  //       .attr("markerWidth", 6)
  //       .attr("markerHeight", 6)
  //       .attr("orient", "auto")
  //     .append("path")
  //       .attr("fill", 'red')
  //       .attr("d", "M0,-5L10,0L0,5")

  //   setupInitialGraph()
  // })

  // const setupInitialGraph = function(){
  //   const link = svg.append("g")
  //       .attr("fill", "none")
  //       .attr("stroke-width", 1.5)
  //     .selectAll("path")
  //     .data(d3links)
  //     .join("path")
  //       .attr("stroke", "red")
  //       .attr("marker-end", d => `url(${new URL(`#arrow`, location)})`)

  //   const node = svg.append("g")
  //       .attr("fill", "currentColor")
  //       .attr("stroke-linecap", "round")
  //       .attr("stroke-linejoin", "round")
  //     .selectAll("g")
  //     .data(d3nodes)
  //     .join("g")
  //       // .call(drag(simulation));

  //   node.append("circle")
  //       .attr("stroke", "white")
  //       .attr("stroke-width", 1.5)
  //       .attr("r", 4)

  //   node.append("text")
  //       .attr("x", 8)
  //       .attr("y", "0.31em")
  //       .text(d => d.id)
  //     .clone(true).lower()
  //       .attr("fill", "none")
  //       .attr("stroke", "white")
  //       .attr("stroke-width", 3)

  //   simulation.on("tick", () => {
  //     link.attr("d", linkArc)
  //     node.attr("transform", d => `translate(${d.x},${d.y})`)
  //   })
  // }
  
  // function linkArc(d) {
  //   console.log(d)
  //   const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y)
  //   return `
  //     M${d.source.x},${d.source.y}
  //     A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  //   `
  // }
  
  // const updateLinks = function(){
  //   simulation.stop()

  //   //   // Make a shallow copy to protect against mutation, while
  //   //   // recycling old nodes to preserve position and velocity.
  //   //   // const old = new Map(svg.node().data().map(d => [d.id, d]));
  //   //   // nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
  //   //   // nodes = 
  //   //   // links = links.map(d => Object.assign({}, d));
  //     console.log(d3links)
  //     const link = svg.append("g")
  //       .attr("fill", "none")
  //       .attr("stroke-width", 1.5)
  //     .selectAll("path")
  //     .data(d3links)
  //     .join("path")
  //       .attr("stroke", "red")
  //       .attr("marker-end", d => `url(${new URL(`#arrow`, location)})`)

  //   // const node = svg.append("g")
  //   //     .attr("fill", "currentColor")
  //   //     .attr("stroke-linecap", "round")
  //   //     .attr("stroke-linejoin", "round")
  //   //   .selectAll("g")
  //   //   .data(nodes)
  //   //   .join("g")
  //   //     // .call(drag(simulation));

  //   // node.append("circle")
  //   //     .attr("stroke", "white")
  //   //     .attr("stroke-width", 1.5)
  //   //     .attr("r", 4)

  //   // node.append("text")
  //   //     .attr("x", 8)
  //   //     .attr("y", "0.31em")
  //   //     .text(d => d.id)
  //   //   .clone(true).lower()
  //   //     .attr("fill", "none")
  //   //     .attr("stroke", "white")
  //   //     .attr("stroke-width", 3)

  //   //     simulation.nodes(nodes);
  //     simulation.force("link", d3.forceLink(d3links).id(d => d.id))
  //     simulation.alpha(1).restart();
  // }
  
</script>

<div class="container">
  
  <div class="row">
    <div class="col-4">
      <p>Connection: <WebsocketConnectionIndicator status={connectionState}/></p>
    </div>
    <div class="col-8">
      <p>Turn: { turn }, Time: { currentInWorldTime }, Time remaining in turn: <strong>{ countdown }</strong></p>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <p>Chosen activity: 
        {#if selectedOption != ""}
          {selectedOption} (<strong>{ shortNames[selectedOption] }</strong>) for time <strong>{nextTurnInWorldTime}</strong>
        {:else}
          <strong>{blankOptionPlaceholder}</strong> for time <strong>{nextTurnInWorldTime}</strong>
        {/if}  
      </p>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <p>Players:</p>
      <ul id="player_list" class="list-group mb-4">
        {#each playerConnectionStates as playerConnectionState}
          <li class="list-group-item" class:active={activePlayerGuid == playerConnectionState.guid}>
            <WebsocketConnectionIndicator status={playerConnectionState.state} label={playerConnectionState.guid.split("|")[0] + "(" + playerConnectionState.guid.split("|")[1] + "hrs sleep)"}/>
            <!-- {/if} -->
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <p class="mb-4">Player-submitted activities: 
        {#each approvedPlayerActivities as activity}
          <span>{activity} <button class="btn btn-link btn-link-inline" on:click={ e => {
            suppressedActivities.push(activity)
            suppressedActivities = suppressedActivities // for svelte
          }}>[X]</button>,&nbsp;</span>
        {/each}
      </p>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <div class="show-controls">
        <form>
          <div class="form-group">
            <button type="button" class="btn btn-block btn-outline-primary" on:click={setupNextTurn} disabled={selectedOption == null || selectedOption === undefined || selectedOption == ""}>Start Next Turn</button>
          </div>
          <div class="form-group">
            <p><strong>{sliderLabel}</strong></p>
            <input bind:checked={autoBroadcast} class="form-check-input" type="checkbox" value="" id="auto_broadcast">
            <label class="form-check-label" for="auto_broadcast">
              Auto-broadcast
            </label>
            <Slider broadcastStatus={sliderBroadcastStatus} disabled={autoBroadcast} broadcastNow={triggerBroadcast} sliderCue={{
              mediaDomain: 3,
              cueNumber: 1,
              cueAction: 0,
              targetTags: ["all"],
              cueContent: reachableNodeIds.join("|")
            }} on:message={handleSliderMessage}></Slider>
          </div>
        </form>      
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <details>
        <summary>Probably useless extra info</summary>
        <div class="interface">
          {#each reachableNodeIds as option}
            <button type="button" disabled>{option}</button>
          {/each}
        </div>

        <div class="diagram">
          {#each nodes as node, index}
            <div class="node" 
              class:current={currentNode.id == node.id} 
              class:visited={visitedNodeIds.includes(node.id)} 
              class:reachable={ reachableNodeIds.includes(node.id)}
            >
              {#if reachableNodeIds.includes(node.id)}
                <!-- <span>{node.id}</span> <span class="small gray"> [→ {connectedNodes(node.id)}]</span> -->
                <button type="button" class="btn-link" on:click={e => onOptionBtn(node.id)}>{node.id}</button> <span class="small gray"> [→ {connectedNodes(node.id)}]</span>
              {:else}
                <span>{node.id}</span> <span class="small gray"> [→ {connectedNodes(node.id)}]</span>
              {/if}
            </div>
          {/each}
        </div>
      </details>   
    </div>
  </div>

  <div class="row">
    <div class="col">
      <button class="btn btn-outline-primary mt-4" on:click={onSendShowReport}>Send show report</button>
      {#if showReportSentSuccessfully}
        &nbsp;Done!
      {/if}
    </div>
  </div>

</div>

<!-- <svg class="diagram" width="480" height="480" viewBox="0 0 480 480">
  {#each nodes as node, index}
      <circle cx="{index * 50}" cy="{index * 50}" r="5" stroke="black" fill="black"></circle>
      <text x="{index * 50}" y="{index * 50}">{node.id}</text>
    </g>
  {/each}
</svg> -->

<style>
  .interface {
    margin-bottom: 2rem;
  }

  button.btn-link {
    padding: 0;
    border: 0 none;
    margin: 0;
    background: none;
    text-decoration: underline;
    color: inherit;
  }

  .node {
    color: gray;
  }

  .node.current {
    color: black;
  }

  .node.visited {
    color: darkred;
  }
  
  .node.reachable{
    color: blue;
  }

  .small {
    font-size: 0.6rem;
  }

  .large {
    font-size: 1.6rem;
  }

  .gray {
    color: gray;
  }

  #player_list {
    flex-direction: row;
    flex-wrap: wrap;
  }
</style>