<script>
  import Graph from 'graph-data-structure'
  import Slider from './Slider.svelte'
  import WebsocketConnectionIndicator from './WebsocketConnectionIndicator.svelte'

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
      deviceStates = msg.data
    }
  })

	cohortSession.on('cueReceived', (cue) => {
		console.log('cue received:')
		console.log(cue)

		let cueMatchesTarget = false
		
		console.log(cohortTags)
		for(var i = 0; i < cue.targetTags.length; i++){
			console.log(cue.targetTags[i])
			if(cohortTags.includes(cue.targetTags[i])){
				cueMatchesTarget = true
				break
			}
		}

		if(cueMatchesTarget){
      if(cue.targetTags.includes("stage_manager")){
        console.log("!")
        if(cue.mediaDomain == 3 && cue.cueContent !== undefined){
          const chosenOption = cue.cueContent

          if(reachableNodeIds.includes(chosenOption)){
            selectedOption = chosenOption
          } else {
            throw new Error("Audience choice (" + chosenOption + ") is not valid...")
          }
        }
      }
		}
	})

	cohortSession.init()

  /*
   *   End Cohort
   */

  let nodes = [{
    id: "Start"
  },{
    id: "Wake up"
  },
  // turn 1
  {
    id: "Brush teeth",
    connectOnTurn: 1
  },{
    id: "Eat breakfast",
    connectOnTurn: 1
  },{
    id: "Meditate",
    connectOnTurn: 1
  },{
    id: "Exercise",
    connectOnTurn: 1
  }
  // turn 3
  ,{
    id: "Pray",
    connectOnTurn: 3
  },{
    id: "Play pebbles",
    connectOnTurn: 3
  },{
    id: "Stack stones",
    connectOnTurn: 3
  },{
    id: "Make fire",
    connectOnTurn: 3
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
    id: "Write song",
    connectOnTurn: 5
  }
  // turn 6
  ,{
    id: "Tell",
    connectOnTurn: 6
  }
  // turn 7
  ,{
    id: "Eat lunch",
    connectOnTurn: 7
  }
  // turn 12
  ,{
    id: "Eat dinner",
    connectOnTurn: 12
  }
  // turn 14
  ,{
    id: "Get ready for bed",
    connectOnTurn: 14
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
  let countdown = 60
  let countdownInterval
  let selectedOption = "" // audience member selects an option every turn
  let visitedNodeIds = []
  let deviceStates = []
  $: thisDevice = deviceStates.find( device => {
    console.log(0)
    console.log(device.guid)
    console.log(CohortClientSession.guid)
    return device.guid == CohortClientSession.guid
  })

  let connectionState = "unknown"
  $: {
    console.log(1)
    thisDevice
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

  $: connectedNodes = function(nodeId){
    console.log(graph.adjacent(nodeId))
    return graph.adjacent(nodeId)
  }

  const setupNextTurn = function(){
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

    turn++

    console.log("turn: " + turn)
    console.log("current node: " + currentNode.id)
    console.log("visited nodes: " + visitedNodeIds.join(", "))
    clearInterval(countdownInterval)
    startCountdown()

    const nodesToConnect = nodes.filter( node => {
      if(node.connectOnTurn !== undefined && node.connectOnTurn == turn){
        return node
      }
    })

    const currentReachableNodes = reachableNodeIds

    nodesToConnect.forEach( node => {
      console.log("connecting " + node.id)
      // connect it to the current node
      // graph.addEdge(currentNode.id, node.id)

      // connect it to other nodes being connected this turn
      const otherNodes = nodesToConnect.filter( recursiveNode => recursiveNode.id != node.id)  
      console.log("  sibling nodes: " + otherNodes.map(node => node.id).join(", "))
      otherNodes.forEach( otherNode => {
        graph.addEdge(node.id, otherNode.id)
      })

      console.log("  existing nodes: ")
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
  }

  const onOptionBtn = function(nodeId){
    selectedOption = nodeId
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

<div class="row">
  <div class="container">
    <div class="show-info">
      <p>Connection: <WebsocketConnectionIndicator status={connectionState}/></p>
      <p>Turn: { turn }</p>
      <p>Time remaining in turn: { countdown }</p>
      <p>Audience choice: { selectedOption }</p>
    </div>
  </div>
</div>


<div class="row">
  <div class="container">
    <div class="show-controls">
      <button type="button" class="btn btn-block btn-outline-primary" on:click={setupNextTurn} disabled={selectedOption == null || selectedOption === undefined || selectedOption == ""}>Start Next Turn</button>
      <span>Send Options to Current Player</span>
      <Slider broadcastStatus={sliderBroadcastStatus} sliderCue={ {
        mediaDomain: 3,
        cueNumber: 1,
        cueAction: 0,
        targetTags: ["all"],
        cueContent: reachableNodeIds.join("|")
      }}></Slider>
    </div>
  </div>
</div>

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

  .gray {
    color: gray;
  }
</style>