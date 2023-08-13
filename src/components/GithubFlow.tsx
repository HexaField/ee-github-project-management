import React, { useCallback, useEffect } from 'react'
import ReactFlow, { useNodesState, useEdgesState, addEdge, Node, Edge, Position, ConnectionLineType } from 'reactflow'
import 'reactflow/dist/style.css'
import DAGRE from 'dagre'

// https://reactflow.dev/docs/examples/layout/dagre/
const dagreGraph = new DAGRE.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 172
const nodeHeight = 36

const createLayout = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: 'LR' })

  // filter nodes with no edges
  const filteredNodes = nodes.filter((node) => {
    return edges.find((edge) => {
      return edge.source === node.id || edge.target === node.id
    })
  })

  filteredNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  DAGRE.layout(dagreGraph)

  filteredNodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    node.targetPosition = Position.Left
    node.sourcePosition = Position.Right

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    }
  })

  let unlinkedY = 0

  nodes.forEach((node) => {
    if (filteredNodes.find((n) => n.id === node.id)) return

    node.position = {
      x: -nodeWidth * 2,
      y: unlinkedY++ * nodeHeight * 2
    }
  })


  return { nodes, edges }
}

export default function GithubFlow (props: { nodes: any[], edges: any[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = createLayout(
      [...props.nodes],
      [...props.edges]
    );

    setNodes([...layoutedNodes])
    setEdges([...layoutedEdges])
  }, [props.nodes, props.edges])

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
      ),
    []
  )

  const onLayout = useCallback(
    () => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = createLayout(
        nodes,
        edges
      );

      setNodes([...layoutedNodes])
      setEdges([...layoutedEdges])
    },
    [nodes, edges]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      minZoom={0.2}
      maxZoom={1.5}
      fitView
      attributionPosition="bottom-left"
    />
  )
}