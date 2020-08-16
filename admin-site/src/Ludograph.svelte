<script>
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
  }

  const onOptionBtn = function(event){
    visitedNodeIds.push(currentNode.id)
    console.log(event.target.innerHTML)
    currentNode = nodes.find(node => node.id == event.target.innerHTML)
    turn++
    setupNextTurn()
  }
</script>

<div>
  {#each reachableNodeIds as option}
    <button on:click={onOptionBtn}>{option}</button>
  {/each}
</div>