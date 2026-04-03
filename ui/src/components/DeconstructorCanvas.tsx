import { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '../store/useGraphStore';
import { Microscope } from 'lucide-react';

function DeconstructorInner() {
  const { deconstructor, openInspector } = useGraphStore();

  const [nodes, , onNodesChange] = useNodesState(deconstructor.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(deconstructor.edges);

  const onEdgeDoubleClick = useCallback((_e: any, edge: any) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }, [setEdges]);

  const onNodeDoubleClick = useCallback((_e: any, node: any) => {
    openInspector(node.id, node.data.label);
  }, [openInspector]);

  if (deconstructor.nodes.length === 0) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#121212', color: '#555', gap: '14px',
      }}>
        <Microscope size={48} strokeWidth={1} color="#333" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '15px', color: '#666', fontWeight: 500 }}>Deconstructor is empty</div>
          <div style={{ fontSize: '12px', color: '#444', marginTop: '6px' }}>
            Right-click any node in the Recon Map → <span style={{ color: '#60a5fa' }}>Send to Deconstructor</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDoubleClick={onNodeDoubleClick}
      onEdgeDoubleClick={onEdgeDoubleClick}
      proOptions={{ hideAttribution: true }}
      colorMode="dark"
      panActivationKeyCode={null}
      fitView
    >
      <Controls />
      <Background
        variant={BackgroundVariant.Dots}
        gap={20} size={1} color="#1e1e1e"
      />
    </ReactFlow>
  );
}

export default function DeconstructorCanvas() {
  return (
    <ReactFlowProvider>
      <DeconstructorInner />
    </ReactFlowProvider>
  );
}
