import { useCallback, useRef, useState } from 'react';
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
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from './Sidebar';
import EditorPanel from './EditorPanel';

const initialNodes = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'CodeAtlas Core Engine' }, type: 'default' }
];

let id = 0;
const getId = () => `node_${id++}`;

function Flowboard() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Editor State
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeNodeLabel, setActiveNodeLabel] = useState('');

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
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
        type: 'default',
        position,
        data: { label: label },
        style: {
          background: '#252526',
          color: 'white',
          border: '1px solid #3c3c3c',
          borderRadius: '6px',
          width: 160,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
          fontSize: '13px'
        }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );

  const onNodeDoubleClick = useCallback((event: any, node: any) => {
    setActiveNodeId(node.id);
    setActiveNodeLabel(node.data.label);
  }, []);

  const handleCodeRun = (code: string, nodeId: string) => {
    // Simulate static analysis evaluation
    const isError = code.toLowerCase().includes('error') || code.toLowerCase().includes('fail');
    const color = isError ? '#ef4444' : '#10b981'; // Red for error, Green for success

    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          edge.animated = !isError; // animate if success
          edge.style = { ...edge.style, stroke: color, strokeWidth: 2 };
        }
        return edge;
      })
    );
    
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === nodeId) {
          node.style = { 
            ...node.style, 
            border: `2px solid ${color}`,
            boxShadow: `0 0 15px ${color}40` 
          };
        }
        return node;
      })
    );
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
          <MiniMap style={{ background: '#1e1e1e', maskColor: '#252526' }} nodeColor="#444" />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#333" />
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
