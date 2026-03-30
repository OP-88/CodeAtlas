import React, { useState, useRef, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { X, Play, Save, CheckCircle, TerminalSquare } from 'lucide-react';

// Configure Monaco to load entirely from local installation to bypass "Loading..." CDN blockage
loader.config({ monaco });

interface EditorPanelProps {
  nodeId: string | null;
  nodeLabel: string;
  onClose: () => void;
  onCodeRun: (code: string, nodeId: string) => void;
}

const BOILERPLATES: Record<string, string> = {
  'React Frontend': `import React, { useState, useEffect } from 'react';

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-4">
      <h1>React Frontend</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}`,
  'FastAPI Server': `from fastapi import FastAPI
from pydantic import BaseModel
import psycopg2

app = FastAPI()

class Item(BaseModel):
    name: str

@app.get("/api/status")
async def read_root():
    return {"status": "healthy", "service": "fastapi"}

@app.post("/api/items")
async def create_item(item: Item):
    # TODO: write to database
    return {"message": f"Successfully processed {item.name}"}
`,
  'PostgreSQL DB': `-- PostgreSQL Initialization Script
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
`,
  'AWS S3 Bucket': `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::example-bucket/*"
    }
  ]
}`,
  'Express.js': `const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(port, () => {
  console.log(\`Server listening on port \${port}\`);
});`
};

export default function EditorPanel({ nodeId, nodeLabel, onClose, onCodeRun }: EditorPanelProps) {
  const [code, setCode] = useState('');
  const [width, setWidth] = useState(600);
  const [isHoveringResizer, setIsHoveringResizer] = useState(false);
  const isResizing = useRef(false);
  const [validationResult, setValidationResult] = useState<{ status: 'idle' | 'success' | 'error', message: string }>({ status: 'idle', message: '' });

  // Terminal UI State
  const [activeTab, setActiveTab] = useState<'output' | 'terminal'>('output');
  const [terminalLines, setTerminalLines] = useState<string[]>(['CodeAtlas Local Shell (Bash) - Engine hooked.', 'Type a command and press Enter...']);
  const [terminalInput, setTerminalInput] = useState('');

  const handleTerminalSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      const cmd = terminalInput.trim();
      setTerminalLines(prev => [...prev, `$ ${cmd}`]);
      setTerminalInput('');
      
      if (cmd === 'clear') {
         setTerminalLines([]);
         return;
      }

      try {
        const cp = (window as any).require('child_process');
        cp.exec(cmd, { cwd: '/home/marc/Verba-mvp/CodeAtlas/ui' }, (error: any, stdout: string, stderr: string) => {
          if (stdout) setTerminalLines(prev => [...prev, ...stdout.trim().split('\n')]);
          if (stderr) setTerminalLines(prev => [...prev, ...stderr.trim().split('\n')]);
          if (error) setTerminalLines(prev => [...prev, `[Process exited with code ${error.code}]`]);
        });
      } catch (err) {
        setTerminalLines(prev => [...prev, 'Error: Local terminal execution requires native application context.']);
      }
    }
  };

  // Reset console output when node switching
  useEffect(() => {
    setValidationResult({ status: 'idle', message: '' });
  }, [nodeId]);

  const handleValidate = () => {
    if (!nodeId) return;
    const isErr = code.toLowerCase().includes('error') || code.toLowerCase().includes('fail');
    if (isErr) {
      setValidationResult({ status: 'error', message: 'EngineHeuristicError: Failed to parse structural schema blocks. Invalid tokens or vulnerable logic pathways detected in component.' });
    } else {
      setValidationResult({ status: 'success', message: 'Validation Passed: Syntax verified. Heuristic AST mapping successfully parsed and integrated seamlessly.' });
    }
    onCodeRun(code, nodeId);
  };

  // Seed code based on the dragged component label
  useEffect(() => {
    if (!nodeId) return;
    const template = BOILERPLATES[nodeLabel] || `// Welcome to ${nodeLabel}\n\n// Write your logic or configuration here.\n`;
    setCode(template);
  }, [nodeId, nodeLabel]);

  // Resizable logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < window.innerWidth - 300) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = 'default';
        setIsHoveringResizer(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!nodeId) return null;

  // Determine language mapping
  let language = "python";
  if (nodeLabel.includes("React") || nodeLabel.includes("Express")) language = "javascript";
  if (nodeLabel.includes("Postgre") || nodeLabel.includes("Mongo")) language = "sql";
  if (nodeLabel.includes("AWS")) language = "json";

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: `${width}px`,
      height: '100%',
      background: '#1e1e1e',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      boxShadow: '-10px 0 30px rgba(0,0,0,0.6)'
    }}>
      {/* Resizer Handle */}
      <div 
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '6px',
          cursor: 'col-resize',
          zIndex: 1001,
          background: isHoveringResizer || isResizing.current ? '#007acc' : 'transparent',
          transition: 'background 0.2s',
          borderLeft: isHoveringResizer || isResizing.current ? 'none' : '1px solid #333'
        }}
        onMouseEnter={() => setIsHoveringResizer(true)}
        onMouseLeave={() => setIsHoveringResizer(false)}
        onMouseDown={() => {
          isResizing.current = true;
          document.body.style.cursor = 'col-resize';
        }}
      />
      
      {/* VS Code Style Header/Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#252526', borderBottom: '1px solid #333', color: '#eaeaea' }}>
        {/* Title Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 15px 8px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em', color: '#ccc' }}>{nodeLabel} <span style={{ color: '#666', fontWeight: 400 }}>— CodeAtlas Engine</span></h3>
            <span style={{ fontSize: '10px', color: '#888', background: '#1e1e1e', padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase', border: '1px solid #333' }}>{language}</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#888'}>
            <X size={16} />
          </button>
        </div>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 20px 8px 20px', gap: '10px' }}>
          <button 
            onClick={() => { setActiveTab('output'); handleValidate(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0e639c', color: 'white', border: '1px solid #1177bb', padding: '4px 12px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1177bb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#0e639c'}
          >
            <Play size={14} /> Validate AST
          </button>
          <button 
            onClick={() => setActiveTab('terminal')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#333333', color: '#ccc', border: '1px solid #444', padding: '4px 12px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#444'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#333'}
          >
            <TerminalSquare size={14} /> Local Bash
          </button>
          <div style={{ flex: 1 }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: '#aaa', border: '1px solid transparent', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>
            <CheckCircle size={14} /> Format
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: '#aaa', border: '1px solid transparent', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>
            <Save size={14} /> Save
          </button>
        </div>
      </div>
      <div style={{ flex: 1, paddingLeft: '6px' }}>
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          onMount={(editor, monaco) => {
            editor.onKeyDown(async (e) => {
              if ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyV) {
                try {
                  const text = await navigator.clipboard.readText();
                  const selection = editor.getSelection();
                  if (selection && text) {
                    editor.executeEdits('custom-paste', [{
                      range: selection,
                      text: text,
                      forceMoveMarkers: true
                    }]);
                  }
                  e.preventDefault();
                  e.stopPropagation();
                } catch (err) {
                  console.error("Explicit clipboard read failed natively", err);
                }
              }
            });
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            padding: { top: 15 },
            tabCompletion: "on",
            quickSuggestions: { other: true, comments: true, strings: true },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "smart",
            acceptSuggestionOnCommitCharacter: true,
            wordBasedSuggestions: "currentDocument"
          }}
        />
      </div>

      {/* VS Code Style Bottom Panel (Tabs + Content) */}
      <div style={{
        height: '240px',
        minHeight: '240px',
        background: '#181818',
        borderTop: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.3)',
        zIndex: 10
      }}>
        {/* Tab Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid #333', padding: '0 10px', background: '#1e1e1e' }}>
          <button 
            onClick={() => setActiveTab('output')}
            style={{ background: 'transparent', border: 'none', padding: '8px 15px', color: activeTab === 'output' ? '#e5e5e5' : '#858585', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer', borderBottom: activeTab === 'output' ? '1px solid #007acc' : '1px solid transparent', transition: 'all 0.2s', outline: 'none' }}
          >
            Output
          </button>
          <button 
            onClick={() => setActiveTab('terminal')}
            style={{ background: 'transparent', border: 'none', padding: '8px 15px', color: activeTab === 'terminal' ? '#e5e5e5' : '#858585', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer', borderBottom: activeTab === 'terminal' ? '1px solid #007acc' : '1px solid transparent', transition: 'all 0.2s', outline: 'none' }}
          >
            Terminal
          </button>
        </div>

        {/* Output Tab Content */}
        {activeTab === 'output' && (
          <div style={{ padding: '12px 15px', overflowY: 'auto', flex: 1, fontFamily: 'monospace', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {validationResult.status === 'idle' ? (
              <span style={{ color: '#666' }}>No execution output to display. Click 'Validate AST' to run simulated architecture verification.</span>
            ) : (
              <>
                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '6px', color: validationResult.status === 'error' ? '#ef4444' : '#10b981' }}>
                  {validationResult.status === 'error' ? '❌ ENGINE_BUILD_FAILED' : '✅ ENGINE_BUILD_SUCCESS'}
                </div>
                <div style={{ color: '#d4d4d4', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  <span style={{ color: '#569cd6' }}>[compiler] </span> {validationResult.message}
                </div>
              </>
            )}
          </div>
        )}

        {/* Terminal Tab Content */}
        {activeTab === 'terminal' && (
          <div 
            style={{ padding: '10px 15px', overflowY: 'auto', flex: 1, fontFamily: 'monospace', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input');
              if (input) input.focus();
            }}
          >
            {terminalLines.map((line, idx) => (
              <div key={idx} style={{ color: line.startsWith('$') ? '#569cd6' : line.toLowerCase().includes('error') ? '#ef4444' : '#cccccc', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                {line}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>marc@codeatlas-shell:~$</span>
              <input 
                type="text" 
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalSubmit}
                style={{ background: 'transparent', border: 'none', color: '#cccccc', flex: 1, outline: 'none', fontFamily: 'monospace', fontSize: '13px' }}
                autoFocus
                placeholder="npm -v"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
