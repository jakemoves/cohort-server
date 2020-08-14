<script>
  import { onMount } from 'svelte'
  import * as d3 from 'd3'
  
  let nodes = [{
    id: "Start"
  },{
    id: "Wake up"
  },{
    id: "Brush teeth"
  }]

  let links = [{
    source: "Start",
    target: "Wake up"
  },{
    source: "Wake up",
    target: "Brush teeth"
  }]

  onMount( () => {
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("x", d3.forceX())
      .force("y", d3.forceY())

    var svg = d3
      .select("#show-graph")
      .append("svg")
      .attr("width", 640)
      .attr("height", 480)

    // var edges = svg.append("g").selectAll("line");

    var vertices = svg
      .selectAll("circle")
      .data(nodes.slice(1), function(d) {
        return d.id
      })
      .enter()
      .append("circle")
      .attr("r", function(d) {
        return 100
      })
      .style("fill", function(d, i) {
        return 'white'
      })
  })
  


</script>

<style>

</style>

<div id="show-graph"></div>