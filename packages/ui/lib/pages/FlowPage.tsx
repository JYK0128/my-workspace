import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, getConnectedEdges, getIncomers, getOutgoers, MiniMap, ReactFlow, ReactFlowProvider, reconnectEdge, SelectionMode, useReactFlow, type DefaultEdgeOptions, type Edge, type FitViewOptions, type IsValidConnection, type Node, type OnConnect, type OnConnectEnd, type OnEdgesChange, type OnNodesChange, type OnNodesDelete, type OnReconnect, type ReactFlowProps } from '@xyflow/react';
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

type HistoryState = { past: FlowState[], future: FlowState[] };
type FlowState = { nodes: Node[], edges: Edge[] };

const initialNodes: Node[] = [
  { id: 'START', data: { label: 'START' }, position: { x: 5, y: 5 }, type: 'input' },
  { id: 'END', data: { label: 'END' }, position: { x: 5, y: 85 }, type: 'output' },
];

const initialEdges: Edge[] = [];

let id = 1;
const getId = () => `${id++}`;

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true, // 실선 - 점선
};

function FlowPageInner() {
  const [history, setHistory] = useState<HistoryState>({ past: [], future: [] });
  const [flow, setFlow] = useState<FlowState>({ nodes: initialNodes, edges: initialEdges });
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  const setFlowWithHistory: Dispatch<SetStateAction<FlowState>> = (updater) => {
    setFlow((flow) => {
      setHistory((hist) => ({ past: hist.past.concat(flow), future: [] }));
      return typeof updater === 'function' ? updater(flow) : updater;
    });
  };

  const undo = useCallback(() => {
    if (history.past.length) {
      setHistory((history) => {
        const pastFlow = history.past.at(-1);
        if (pastFlow) {
          const newHistory = {
            past: history.past.slice(0, -1),
            future: history.future.toSpliced(0, 0, flow),
          };
          setFlow(pastFlow);
          return newHistory;
        }
        else {
          return history;
        }
      });
    }
  }, [flow, history.past.length]);

  const redo = useCallback(() => {
    if (history.future.length) {
      setHistory((history) => {
        const futureFlow = history.future.at(0);
        if (futureFlow) {
          const newHistory = {
            past: history.past.concat(flow),
            future: history.future.toSpliced(0, 1),
          };
          setFlow(futureFlow);
          return newHistory;
        }
        else {
          return history;
        }
      });
    }
  }, [flow, history.future.length]);

  useEffect(() => {
    const target = window;
    const handleKeyDown = (e: Event) => {
      if (!(e instanceof KeyboardEvent)) return;

      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (history.past.length) undo();
      }
      else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (history.future.length) redo();
      }
    };

    target.addEventListener('keydown', handleKeyDown);
    return () => target.removeEventListener('keydown', handleKeyDown);
  }, [history, redo, undo]);

  useEffect(() => console.log({ history }), [history]);
  useEffect(() => console.log({ flow }), [flow]);

  const onNodesChange: OnNodesChange = (changes) => {
    if (changes.every((v) => v.type === 'select')) {
      setFlowWithHistory((flow) => ({
        ...flow,
        nodes: applyNodeChanges(changes, flow.nodes),
      }));
    }
    else {
      setFlow((flow) => ({
        ...flow,
        nodes: applyNodeChanges(changes, flow.nodes),
      }));
    }
  };

  const onEdgesChange: OnEdgesChange = (changes) => {
    setFlow((flow) => ({
      ...flow,
      edges: applyEdgeChanges(changes, flow.edges),
    }));
  };

  const onConnect: OnConnect = (connection) => {
    setFlowWithHistory((flow) => ({
      ...flow,
      edges: addEdge(connection, flow.edges),
    }));
  };

  /** Add Node On Edge Drop */
  const onConnectEnd: OnConnectEnd = (event, connectionState) => {
    if (!connectionState.isValid && connectionState.fromNode?.id) {
      const id = getId();
      const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
      const newNode = {
        id,
        position: screenToFlowPosition({
          x: clientX,
          y: clientY,
        }),
        data: { label: `Node ${id}` },
        origin: [0.5, 0.0],
      } satisfies Node;

      const newEdge = {
        ...defaultEdgeOptions,
        source: connectionState.fromNode.id,
        target: id,
        id: `xy-edge__${connectionState.fromNode.id}-${id}`,
      } satisfies Edge;

      setFlowWithHistory((flow) => ({
        nodes: flow.nodes.concat(newNode),
        edges: flow.edges.concat(newEdge),
      }));
    }
  };

  /** Delete Middle Node */
  const onNodesDelete: OnNodesDelete = useCallback((deleted) => {
    const newEdges = deleted.reduce((acc, node) => {
      const incomers = getIncomers(node, flow.nodes, flow.edges);
      const outgoers = getOutgoers(node, flow.nodes, flow.edges);
      const connectedEdges = getConnectedEdges([node], flow.edges);

      const remainingEdges = acc.filter(
        (edge) => !connectedEdges.includes(edge),
      );

      const createdEdges = incomers.flatMap(({ id: source }) =>
        outgoers.map(({ id: target }) => ({
          id: `${source}->${target}`,
          source,
          target,
        })),
      );

      return [...remainingEdges, ...createdEdges];
    }, flow.edges);

    setFlowWithHistory((flow) => ({
      ...flow,
      edges: newEdges,
    }));
  }, [flow]);

  /** Reconnect Edge */
  const edgeReconnectSuccessful = useRef(true);
  const onReconnect = useCallback<OnReconnect>((oldEdge, newConnection) => {
    setFlowWithHistory((flow) => ({
      ...flow,
      edges: reconnectEdge(oldEdge, newConnection, flow.edges),
    }));
  }, []);

  const onReconnectStart = useCallback<NonNullable<ReactFlowProps['onReconnectStart']>>(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnectEnd = useCallback<NonNullable<ReactFlowProps['onReconnectEnd']>>((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setFlowWithHistory((flow) => ({
        ...flow,
        edges: flow.edges.filter((e) => e.id !== edge.id),
      }));
    }
    edgeReconnectSuccessful.current = true;
  }, []);

  /** Drag Node */
  const onNodeDragStart = useCallback<NonNullable<ReactFlowProps['onNodeDragStart']>>((_, node) => {
    setFlowWithHistory((flow) => ({
      ...flow,
      nodes: flow.nodes.map((n) => n.id === node.id ? node : n),
    }));
  }, []);

  // TODO: Context Menu - Duplicate Node...
  // TODO: Drag And Drop - Node...

  /** Preventing Cycles */
  const isValidConnection = useCallback<IsValidConnection>(
    (connection) => {
      const nodes = getNodes();
      const edges = getEdges();
      const target = nodes.find((node) => node.id === connection.target);
      if (!target) return false;

      const hasCycle = (node: Node, visited = new Set()) => {
        if (visited.has(node.id)) return false;
        visited.add(node.id);
        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (target.id === connection.source) return false;
      return !hasCycle(target);
    },
    [getNodes, getEdges],
  );

  return (
    <ReactFlow
      nodes={flow.nodes}
      edges={flow.edges}
      isValidConnection={isValidConnection}
      onNodesChange={onNodesChange}
      onNodesDelete={onNodesDelete}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      // onConnectEnd={onConnectEnd}
      onReconnect={onReconnect}
      onReconnectStart={onReconnectStart}
      onReconnectEnd={onReconnectEnd}
      onNodeDragStart={onNodeDragStart}
      panOnScroll
      panOnDrag={[1, 2]}
      selectionOnDrag
      selectionMode={SelectionMode.Full}
      fitView
      fitViewOptions={fitViewOptions}
      defaultEdgeOptions={defaultEdgeOptions}
    >
      <Background />
      <Controls />
      <MiniMap
        nodeColor={(node) => ({
          input: '#6ede87',
          output: '#3B82F6',
        }[node.type ?? ''] ?? '#64748B')}
        zoomable
        pannable
      />
    </ReactFlow>
  );
}

export function FlowPage() {
  return (
    <ReactFlowProvider>
      <FlowPageInner />
    </ReactFlowProvider>
  );
}
