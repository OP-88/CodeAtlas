import { useCallback, useRef, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from './Sidebar';
import EditorPanel from './EditorPanel';

const initialNodes = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'CodeAtlas Core Engine' }, type: 'default' }
];

let id = 0;
const getId = () => `dndnode_${id++}`;

function Flowboard() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Editor State
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeNodeLabel, setActiveNodeLabel] = useState('');

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type: 'default', // Using default node type for MVP
        position,
        data: { label: label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );

  const onNodeDoubleClick = useCallback((event, node) => {
    setActiveNodeId(node.id);
    setActiveNodeLabel(node.data.label);
  }, []);

  const handleCodeRun = (code: string, nodeId: string) => {
    console.log("Simulating Validation for Node: ", nodeId);
    console.log("Code snippet: ", code);
    // In a real scenario, this is sent down via WebSockets to the Python Engine
    alert(`Engine Validation Triggered for ${activeNodeLabel}:\nStatic Analysis heuristics are running...`);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row', background: '#1a1a1a' }}>
      <Sidebar />
      <div style={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDoubleClick={onNodeDoubleClick}
          colorMode="dark"
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        {/* The double-click IDE Panel */}
        <EditorPanel 
          nodeId={activeNodeId} 
          nodeLabel={activeNodeLabel} 
          onClose={() => setActiveNodeId(null)}
          onCodeRun={handleCodeRun}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flowboard />
    </ReactFlowProvider>
  );
}
