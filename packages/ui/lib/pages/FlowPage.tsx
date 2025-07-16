import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '#shadcn/components/ui/sheet.tsx';
import { closestCorners, DndContext, PointerSensor, useDndMonitor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, getConnectedEdges, getIncomers, getOutgoers, MiniMap, ReactFlow, ReactFlowProvider, reconnectEdge, SelectionMode, useReactFlow, type DefaultEdgeOptions, type Edge, type FitViewOptions, type IsValidConnection, type Node, type OnConnect, type OnConnectEnd, type OnEdgesChange, type OnNodesChange, type OnNodesDelete, type OnReconnect, type ReactFlowProps } from '@xyflow/react';
import { Plus } from 'lucide-react';
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

function NodeTemplate() {
  const { setNodeRef, attributes, listeners, transform } = useDraggable({
    id: 'node-template',
  });

  return (
    <div
      style={{ transform: CSS.Translate.toString(transform) }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      sample
    </div>
  );
}

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

  /* 히스토리 기능 */
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

  /* 복사 + 붙여넣기 기능 */
  const clipCount = useRef<number>(0);
  const clipboard = useRef<Nullable<Node[]>>(null);
  const copy = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    clipboard.current = structuredClone(selectedNodes);
    clipCount.current = 0;
  }, [getNodes]);

  const cut = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    clipboard.current = structuredClone(selectedNodes);
    clipCount.current = 0;
    setFlowWithHistory((flow) => ({
      ...flow,
      nodes: flow.nodes.filter((node) => !node.selected),
      edges: flow.edges.filter(
        (edge) =>
          !selectedNodes.find((node) => node.id === edge.source || node.id === edge.target),
      ),
    }));
  }, [getNodes]);

  const paste = useCallback(() => {
    if (clipboard.current) {
      clipCount.current = clipCount.current + 1;
      const pastedNodes = clipboard.current.map((v) => ({
        ...v,
        id: getId(),
        position: {
          x: v.position.x + 10 * clipCount.current,
          y: v.position.y + 10 * clipCount.current,
        },
        selected: true,
      }));

      setFlowWithHistory((flow) => ({
        edges: flow.edges,
        nodes: flow.nodes
          .map((v) => ({ ...v, selected: false }))
          .concat(pastedNodes),
      }));
    }
  }, []);

  /* 단축키 설정 */
  useEffect(() => {
    const target = window;
    const handleKeyDown = (e: Event) => {
      if (!(e instanceof KeyboardEvent)) return;

      // undo - redo
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (history.past.length) undo();
      }
      else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (history.future.length) redo();
      }
      else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copy();
      }
      else if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        paste();
      }
      else if (e.ctrlKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        cut();
      }
    };

    target.addEventListener('keydown', handleKeyDown);
    return () => target.removeEventListener('keydown', handleKeyDown);
  }, [copy, cut, history, paste, redo, undo]);

  /* 노드, 엣지 상태관리 */
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

  useEffect(() => {
    const { nodes, edges } = flow;
    nodes.forEach((n) => {
      const el = document.querySelector(`[data-id="${n.id}"]`);
      if (el instanceof HTMLElement) {
        el[n.selected ? 'focus' : 'blur']();
      }
    });
    edges.forEach((eg) => {
      const el = document.querySelector(`[data-id="${eg.id}"]`);
      if (el instanceof HTMLElement) {
        el[eg.selected ? 'focus' : 'blur']();
      }
    });
  }, [flow]);


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

  const { setNodeRef: setSidebarRef } = useDroppable({ id: 'node-sidebar' });
  const { setNodeRef } = useDroppable({ id: 'node-canvas' });
  useDndMonitor({
    onDragEnd(event) {
      const { active, over } = event;
      if (!active || !over || over.id === 'node-sidebar') return;

      const position = screenToFlowPosition({
        x: active.rect.current.translated?.left ?? 0,
        y: active.rect.current.translated?.top ?? 0,
      });

      const newNode: Node = {
        id: getId(),
        position,
        data: { label: 'node' },
      };

      setFlowWithHistory((flow) => ({
        ...flow,
        nodes: flow.nodes.concat(newNode),
      }));
    },
  });


  return (
    <div className="tw:size-full tw:flex">
      <ReactFlow
        ref={setNodeRef}
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
      <Sheet modal={false}>
        <SheetTrigger className="tw:flex tw:flex-col tw:justify-center tw:items-center">
          <Plus />
          추가
        </SheetTrigger>
        <SheetContent ref={setSidebarRef}>
          <SheetHeader>
            <SheetTitle>노드 생성</SheetTitle>
            <SheetDescription />
          </SheetHeader>
          <div className="tw:px-4">
            <NodeTemplate />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function FlowPage() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 0,
      },
    }),
  );

  return (
    <ReactFlowProvider>
      <DndContext
        collisionDetection={closestCorners}
        sensors={sensors}
      >
        <FlowPageInner />
      </DndContext>
    </ReactFlowProvider>
  );
}
