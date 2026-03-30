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
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Trash2, ExternalLink, Play } from 'lucide-react';

import Sidebar from './Sidebar';
import EditorPanel from './EditorPanel';

const initialNodes = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'CodeAtlas Core Engine' }, type: 'default' }
];

let id = 0;
const getId = () => \`node_\${id++}\`;

function Flowboard() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Editor State
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeNodeLabel, setActiveNodeLabel] = useState('');

  // Context Menu State
  const [menu, setMenu] = useState<{ x: number, y: number, type: string, element: any } | null>(null);

  // Dismiss context menu exactly on outside click
  useEffect(() => {
    const handleGlobalClick = () => setMenu(null);
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (!type || !label) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type: 'default',
        position,
        data: { label },
        style: {
          background: '#252526',
          color: '#e0e0e0',
          border: '1px solid #3c3c3c',
          borderRadius: '6px',
          width: 170,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
          fontSize: '13px',
          fontWeight: 500,
          padding: '12px'
        }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    setActiveNodeId(node.id);
    setActiveNodeLabel(node.data.label);
  }, []);

  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: any) => {
    event.preventDefault();
    event.stopPropagation();
    // Delete edge on double click
    setEdges((eds) => eds.filter(e => e.id !== edge.id));
  }, [setEdges]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY, type: 'node', element: node });
  }, []);

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: any) => {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY, type: 'edge', element: edge });
  }, []);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    // Optional: could add generic pane actions here
    event.preventDefault();
    setMenu(null);
  }, []);

  const handleCodeRun = (code: string, nodeId: string) => {
    // Simulate Engine Running
    const isError = code.toLowerCase().includes('error') || code.toLowerCase().includes('fail');
    const color = isError ? '#ef4444' : '#10b981';

    setEdges((eds) => eds.map((edge) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        edge.animated = !isError;
        edge.style = { ...edge.style, stroke: color, strokeWidth: 2 };
      }
      return edge;
    }));
    
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeId) {
        node.style = { 
          ...node.style, 
          border: \`2px solid \${color}\`,
          boxShadow: \`0 0 15px \${color}50\` 
        };
      }
      return node;
    }));
  };

  const handleMenuAction = (action: string) => {
    if (!menu) return;
    
    if (menu.type === 'node') {
      if (action === 'delete') {
        setNodes((nds) => nds.filter((n) => n.id !== menu.element.id));
        setEdges((eds) => eds.filter((e) => e.source !== menu.element.id && e.target !== menu.element.id));
        if (activeNodeId === menu.element.id) setActiveNodeId(null);
      }
      if (action === 'edit') {
        setActiveNodeId(menu.element.id);
        setActiveNodeLabel(menu.element.data.label);
      }
      if (action === 'validate') {
        handleCodeRun('simulation', menu.element.id); // Triggers green on quick click
      }
    } else if (menu.type === 'edge') {
      if (action === 'delete') {
        setEdges((eds) => eds.filter((e) => e.id !== menu.element.id));
      }
    }
    setMenu(null);
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'row', background: '#121212', overflow: 'hidden' }}>
      <Sidebar />
      <div 
        style={{ 
          flexGrow: 1, 
          position: 'relative',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
        }} 
        ref={reactFlowWrapper}
      >
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
          onEdgeDoubleClick={onEdgeDoubleClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          colorMode="dark"
          fitView
        >
          <Controls />
          <MiniMap style={{ background: '#1e1e1e', maskColor: '#252526' }} nodeColor="#444" />
          <Background variant={BackgroundVariant.Lines} gap={30} size={1} color="#2a2a2a" />
        </ReactFlow>

        {/* Custom Context Menu */}
        {menu && (
          <div 
            style={{ 
              position: 'fixed', 
              top: menu.y, 
              left: menu.x, 
              zIndex: 9999, 
              background: '#252526', 
              border: '1px solid #454545',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              borderRadius: '6px',
              padding: '6px 0',
              minWidth: '160px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {menu.type === 'node' ? (
              <>
                <button 
                  onClick={() => handleMenuAction('edit')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', background: 'transparent', color: '#ccc', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#094771'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ExternalLink size={14} /> Open Editor
                </button>
                <button 
                  onClick={() => handleMenuAction('validate')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', background: 'transparent', color: '#10b981', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#094771'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Play size={14} /> Quick Validate
                </button>
                <div style={{ height: '1px', background: '#454545', margin: '4px 0' }} />
                <button 
                  onClick={() => handleMenuAction('delete')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', background: 'transparent', color: '#ef4444', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#094771'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 size={14} /> Delete Component
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleMenuAction('delete')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', background: 'transparent', color: '#ef4444', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#094771'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 size={14} /> Sever Connection
                </button>
              </>
            )}
          </div>
        )}

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
