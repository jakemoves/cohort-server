<script>
  import { onMount } from 'svelte'
  import Graph from 'graph-data-structure'

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
  },{
    id: "Exercise 2"
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
  ]
  
  let graph = Graph()
  $: graph

  nodes.forEach( node => {
    graph.addNode(node.id)
  })
  graph.addEdge("Start", "Wake up")
  graph.addEdge("Exercise", "Exercise 2")

  let currentNode = nodes.find(node => node.id == "Start")
  let turn = 0
  let visitedNodeIds = []

  $: currentNode 
  $: adjacentNodeIds = graph.adjacent(currentNode.id)
  $: reachableNodeIds = adjacentNodeIds.filter( adjacentId => !visitedNodeIds.includes(adjacentId))

  $: connectedNodes = function(nodeId){
    console.log(graph.adjacent(nodeId))
    return graph.adjacent(nodeId)
  }

  const setupNextTurn = function(){
    console.log("turn: " + turn)
    console.log("current node: " + currentNode.id)
    console.log("visited nodes: " + visitedNodeIds.join(", "))

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

  const onOptionBtn = function(event){
    visitedNodeIds.push(currentNode.id)
    visitedNodeIds = visitedNodeIds
    console.log(event.target.innerHTML)
    currentNode = nodes.find(node => node.id == event.target.innerHTML)
    turn++
    setupNextTurn()
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

<div class="interface">
  {#each reachableNodeIds as option}
    <button type="button">{option}</button>
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
        <button type="button" class="btn-link" on:click={onOptionBtn}>{node.id}</button> <span class="small gray"> [→ {connectedNodes(node.id)}]</span>
      {:else}
        <span>{node.id}</span> <span class="small gray"> [→ {connectedNodes(node.id)}]</span>
      {/if}
    </div>
  {/each}
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

  .gray {
    color: gray;
  }
</style>