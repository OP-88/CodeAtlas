import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  ReactFlowProvider,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Trash2, ExternalLink, SendToBack, Zap } from 'lucide-react';
import { useGraphStore } from '../store/useGraphStore';

let nodeCounter = 100;
const getId = () => `recon_${nodeCounter++}`;

const NODE_STYLE = {
  background: '#252526', color: '#e0e0e0',
  border: '1px solid #3c3c3c', borderRadius: '6px',
  width: 170, boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
  fontSize: '13px', fontWeight: 500, padding: '12px',
};

const initialNodes: any[] = [];

function ReconFlow() {
  const rfRef = useRef<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string; label: string } | null>(null);
  const { openInspector, sendToTab } = useGraphStore();

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    const label = e.dataTransfer.getData('application/label');
    if (!type || !label || !rfRef.current) return;
    const position = rfRef.current.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setNodes((nds) => nds.concat({ id: getId(), type: 'default', position, data: { label }, style: NODE_STYLE }));
  }, [setNodes]);

  const onNodeDoubleClick = useCallback((_e: React.MouseEvent, node: any) => {
    openInspector(node.id, node.data.label);
  }, [openInspector]);

  const onEdgeDoubleClick = useCallback((_e: React.MouseEvent, edge: any) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }, [setEdges]);

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: any) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id, label: node.data.label });
  }, []);

  const dismiss = () => setContextMenu(null);

  const menuActions = contextMenu ? [
    { action: () => { openInspector(contextMenu.nodeId, contextMenu.label); dismiss(); }, icon: <ExternalLink size={13} />, label: 'Open in Inspector', color: '#ccc' },
    { action: () => { sendToTab(contextMenu.nodeId, contextMenu.label, 'deconstructor'); dismiss(); }, icon: <SendToBack size={13} />, label: 'Send to Deconstructor', color: '#60a5fa' },
    { action: () => { sendToTab(contextMenu.nodeId, contextMenu.label, 'simulator'); dismiss(); }, icon: <Zap size={13} />, label: 'Send to Simulator', color: '#a78bfa' },
    {
      action: () => {
        setNodes((ns) => ns.filter((n) => n.id !== contextMenu.nodeId));
        setEdges((es) => es.filter((e) => e.source !== contextMenu.nodeId && e.target !== contextMenu.nodeId));
        dismiss();
      },
      icon: <Trash2 size={13} />, label: 'Delete Component', color: '#ef4444',
    },
  ] : [];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} onClick={dismiss}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onInit={(inst) => { rfRef.current = inst; }}
        onDrop={onDrop} onDragOver={onDragOver}
        onNodeDoubleClick={onNodeDoubleClick} onEdgeDoubleClick={onEdgeDoubleClick}
        onNodeContextMenu={onNodeContextMenu} onPaneClick={dismiss}
        proOptions={{ hideAttribution: true }} colorMode="dark"
        panActivationKeyCode={null} fitView
      >
        <Controls />
        <Background
          variant={BackgroundVariant.Lines} gap={30} size={1} color="#2a2a2a"
          style={{
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
          }}
        />
      </ReactFlow>

      {contextMenu && (
        <div style={{
          position: 'fixed', top: contextMenu.y, left: contextMenu.x,
          zIndex: 99999, background: '#252526', border: '1px solid #454545',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)', borderRadius: '6px',
          padding: '5px 0', minWidth: '200px', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '6px 14px', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {contextMenu.label}
          </div>
          <div style={{ height: '1px', background: '#333', margin: '2px 0' }} />
          {menuActions.map((item, i) => (
            <button key={i} onClick={item.action} style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              padding: '8px 14px', background: 'transparent', color: item.color,
              border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2a2d2e'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReconCanvas() {
  return (
    <ReactFlowProvider>
      <ReconFlow />
    </ReactFlowProvider>
  );
}
