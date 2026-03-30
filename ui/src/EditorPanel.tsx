import React, { useState, useRef, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { X, Play } from 'lucide-react';

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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 12px 25px', background: '#252526', borderBottom: '1px solid #333', color: '#eaeaea' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em' }}>{nodeLabel}</h3>
          <span style={{ fontSize: '11px', color: '#666', background: '#1e1e1e', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{language}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onCodeRun(code, nodeId)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0e639c', color: 'white', border: '1px solid transparent', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', transition: 'background 0.2s' }}
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
      <div style={{ flex: 1, paddingLeft: '6px' }}>
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
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
    </div>
  );
}
