<script>
  import { onMount } from 'svelte'
  import Graph from 'graph-data-structure'

  let nodes = [{
    id: "Start"
  },{
    id: "Wake up"
  },{
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
  }]
  
  let graph = Graph()

  nodes.forEach( node => {
    graph.addNode(node.id)
  })
  graph.addEdge("Start", "Wake up")
  graph.addEdge("Wake up", "Stack stones")

  let currentNode = nodes.find(node => node.id == "Start")
  let turn = 0
  let visitedNodeIds = []

  $: adjacentNodeIds = graph.adjacent(currentNode.id)
  $: reachableNodeIds = adjacentNodeIds.filter( adjacentId => !visitedNodeIds.includes(adjacentId))

  const setupNextTurn = function(){
    console.log("turn: " + turn)
    console.log("current node: " + currentNode.id)
    console.log("visited nodes: " + visitedNodeIds.join(", "))

    const nodesToConnect = nodes.filter( node => {
      if(node.connectOnTurn !== undefined && node.connectOnTurn == turn){
        return node
      }
    })
    nodesToConnect.forEach( node => {
      // connect it to the current node
      graph.addEdge(currentNode.id, node.id)

      // connect it to other nodes being connected this turn
      const otherNodes = nodesToConnect.filter( recursiveNode => recursiveNode.id != node.id)  
      otherNodes.forEach( otherNode => {
        graph.addEdge(node.id, otherNode.id)
      })

      // reachableNodeIds.forEach( reachableId => {
      //   // connect currently reachable nodes to it
      //   graph.addEdge(reachableId, node.id)
      //   // connect it to currently reachable nodes
      //   graph.addEdge(node.id, reachableId)
      // })
    })
    graph = graph


    console.log("reachable nodes: " + reachableNodeIds.join(", "))
    updateLinks()
  }

  const onOptionBtn = function(event){
    visitedNodeIds.push(currentNode.id)
    console.log(event.target.innerHTML)
    currentNode = nodes.find(node => node.id == event.target.innerHTML)
    turn++
    setupNextTurn()
  }


  import * as d3 from 'd3'

  $: d3nodes = graph.serialize().nodes
  $: d3links = graph.serialize().links

  var simulation, svg
  onMount(() => {
    simulation = d3.forceSimulation(d3nodes)
      .force("link", d3.forceLink(d3links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("x", d3.forceX())
      .force("y", d3.forceY())

    svg = d3
      .select(".diagram")
      .append("svg")
      .attr("height", 480)
      .attr("width", 480)
      .attr("viewBox", [-240, -240, 480, 480])
      .style("font", "12px sans-serif")

    svg.append("defs")
      .append("marker")
        .attr("id", d => 'arrow')
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -0.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("path")
        .attr("fill", 'red')
        .attr("d", "M0,-5L10,0L0,5")

    setupInitialGraph()
  })

  const setupInitialGraph = function(){
    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(d3links)
      .join("path")
        .attr("stroke", "red")
        .attr("marker-end", d => `url(${new URL(`#arrow`, location)})`)

    const node = svg.append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(d3nodes)
      .join("g")
        // .call(drag(simulation));

    node.append("circle")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", 4)

    node.append("text")
        .attr("x", 8)
        .attr("y", "0.31em")
        .text(d => d.id)
      .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3)

    simulation.on("tick", () => {
      link.attr("d", linkArc)
      node.attr("transform", d => `translate(${d.x},${d.y})`)
    })
  }
  
  function linkArc(d) {
    console.log(d)
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y)
    return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `
  }
  
  const updateLinks = function(){
    simulation.stop()

    //   // Make a shallow copy to protect against mutation, while
    //   // recycling old nodes to preserve position and velocity.
    //   // const old = new Map(svg.node().data().map(d => [d.id, d]));
    //   // nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
    //   // nodes = 
    //   // links = links.map(d => Object.assign({}, d));
      console.log(d3links)
      const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(d3links)
      .join("path")
        .attr("stroke", "red")
        .attr("marker-end", d => `url(${new URL(`#arrow`, location)})`)

    // const node = svg.append("g")
    //     .attr("fill", "currentColor")
    //     .attr("stroke-linecap", "round")
    //     .attr("stroke-linejoin", "round")
    //   .selectAll("g")
    //   .data(nodes)
    //   .join("g")
    //     // .call(drag(simulation));

    // node.append("circle")
    //     .attr("stroke", "white")
    //     .attr("stroke-width", 1.5)
    //     .attr("r", 4)

    // node.append("text")
    //     .attr("x", 8)
    //     .attr("y", "0.31em")
    //     .text(d => d.id)
    //   .clone(true).lower()
    //     .attr("fill", "none")
    //     .attr("stroke", "white")
    //     .attr("stroke-width", 3)

    //     simulation.nodes(nodes);
      simulation.force("link", d3.forceLink(d3links).id(d => d.id))
      simulation.alpha(1).restart();
  }
  
</script>

<div class="interface">
  {#each reachableNodeIds as option}
    <button on:click={onOptionBtn}>{option}</button>
  {/each}
</div>
<div class="diagram">

</div>