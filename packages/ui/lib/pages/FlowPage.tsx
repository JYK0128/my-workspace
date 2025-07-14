import { useHistory } from '#customs/hooks/use-history.ts';
import { Background, Controls, ReactFlow, addEdge, applyEdgeChanges, applyNodeChanges, type DefaultEdgeOptions, type Edge, type FitViewOptions, type Node, type OnConnect, type OnEdgesChange, type OnNodesChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect } from 'react';

const initialNodes: Node[] = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 5, y: 5 } },
];

const initialEdges: Edge[] = [];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

export function FlowPage() {
  const [nodes, setNodes] = useHistory(initialNodes, { skipFirst: true });
  const [edges, setEdges] = useHistory(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    // "position" | "dimensions" | "select" | "remove" | "add" | "replace"
    (changes) => {
      if (changes.every((v) => v.type === 'position')) {
        setNodes((nds) => applyNodeChanges(changes, nds), { immediate: false });
      }
      else {
        setNodes((nds) => applyNodeChanges(changes, nds));
      }
    },
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    // "add" | "replace" | "select" | "remove"
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  useEffect(() => {
    nodes.forEach((n) => {
      const el = document.querySelector(`[data-id="${n.id}"]`);
      if (el instanceof HTMLElement) {
        if (n.selected) {
          el.focus();
        }
        else {
          el.blur();
        }
      }
    });
  }, [nodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      fitViewOptions={fitViewOptions}
      defaultEdgeOptions={defaultEdgeOptions}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
