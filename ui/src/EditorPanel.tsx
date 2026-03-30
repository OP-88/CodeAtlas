import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, Play } from 'lucide-react';

interface EditorPanelProps {
  nodeId: string | null;
  nodeLabel: string;
  onClose: () => void;
  onCodeRun: (code: string, nodeId: string) => void;
}

export default function EditorPanel({ nodeId, nodeLabel, onClose, onCodeRun }: EditorPanelProps) {
  const [code, setCode] = useState('// Write your logic here\n');
  const [width, setWidth] = useState(500);
  const isResizing = useRef(false);

  // Reset code when a different node is clicked
  useEffect(() => {
    setCode(`// Code context for ${nodeLabel}\n\n`);
  }, [nodeId, nodeLabel]);

  // Resizable logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      // Calculate new width relative to the right edge of the screen
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < window.innerWidth - 300) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!nodeId) return null;

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: `${width}px`,
      height: '100%',
      background: '#1e1e1e',
      borderLeft: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      boxShadow: '-5px 0 25px rgba(0,0,0,0.5)'
    }}>
      {/* Resizer Handle */}
      <div 
        style={{
          position: 'absolute',
          left: -4,
          top: 0,
          bottom: 0,
          width: '8px',
          cursor: 'col-resize',
          zIndex: 1001,
          background: 'transparent'
        }}
        onMouseDown={() => {
          isResizing.current = true;
          document.body.style.cursor = 'col-resize';
        }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#252526', borderBottom: '1px solid #333', color: '#cccccc' }}>
        <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, letterSpacing: '0.03em' }}>{nodeLabel}</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onCodeRun(code, nodeId)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0e639c', color: 'white', border: '1px solid transparent', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1177bb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#0e639c'}
          >
            <Play size={14} /> Validate
          </button>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, paddingTop: '10px' }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth'
          }}
        />
      </div>
    </div>
  );
}
