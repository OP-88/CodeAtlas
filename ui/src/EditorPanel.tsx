import React, { useState } from 'react';
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

  if (!nodeId) return null;

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: '500px',
      height: '100%',
      background: '#1e1e1e',
      borderLeft: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      boxShadow: '-5px 0 15px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#252526', borderBottom: '1px solid #333', color: 'white' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>{nodeLabel} Code</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onCodeRun(code, nodeId)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#0e639c', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
          >
            <Play size={14} /> Validate
          </button>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}>
            <X size={16} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: 'on'
          }}
        />
      </div>
    </div>
  );
}
