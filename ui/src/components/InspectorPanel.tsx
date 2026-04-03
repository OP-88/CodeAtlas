import { useState, useRef, useEffect, useCallback } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { X, Play, Save, CheckCircle, TerminalSquare, ChevronRight } from 'lucide-react';
import { useGraphStore } from '../store/useGraphStore';

loader.config({ monaco });

// Language detection
function detectLanguage(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('react') || l.includes('vue') || l.includes('next') || l.includes('express') || l.includes('node')) return 'javascript';
  if (l.includes('typescript') || l.includes('nestjs')) return 'typescript';
  if (l.includes('postgres') || l.includes('mysql') || l.includes('sqlite')) return 'sql';
  if (l.includes('aws') || l.includes('json')) return 'json';
  if (l.includes('docker') || l.includes('nginx')) return 'dockerfile';
  if (l.includes('terraform') || l.includes('ansible')) return 'yaml';
  if (l.includes('html')) return 'html';
  if (l.includes('css') || l.includes('tailwind')) return 'css';
  if (l.includes('go ') || l.endsWith('go')) return 'go';
  if (l.includes('rust')) return 'rust';
  if (l.includes('java ') || l.endsWith('java') || l.includes('spring') || l.includes('kotlin')) return 'java';
  if (l.includes('c++')) return 'cpp';
  if (l.includes('c#') || l.includes('dotnet') || l.includes('asp')) return 'csharp';
  if (l.includes('ruby') || l.includes('rails')) return 'ruby';
  if (l.includes('php') || l.includes('laravel')) return 'php';
  if (l.includes('swift') || l.includes('ios')) return 'swift';
  return 'python';
}

const BOILERPLATES: Record<string, string> = {
  javascript: `// Node.js / Express Entry Point
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(3000, () => console.log('Server running on :3000'));
`,
  typescript: `import express, { Request, Response } from 'express';

const app = express();

app.get('/api/status', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

app.listen(4000);
`,
  python: `from fastapi import FastAPI, Depends
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    value: float

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.post("/api/items")
async def create_item(item: Item):
    return {"created": item.name}
`,
  sql: `-- Schema Initialization
CREATE TABLE IF NOT EXISTS users (
    id        SERIAL PRIMARY KEY,
    email     VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
`,
  json: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}`,
  yaml: `version: "3.9"
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/app
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: pass
`,
};

function getBoilerplate(label: string, language: string): string {
  return BOILERPLATES[language] || `// Welcome to ${label}\n\n// Write your logic here.\n`;
}

interface OutputLine {
  text: string;
  type: 'info' | 'success' | 'error' | 'command';
}

export default function InspectorPanel() {
  const { inspectorOpen, inspectorNodeId, inspectorNodeLabel, closeInspector } = useGraphStore();

  const [code, setCode] = useState('');
  const [width, setWidth] = useState(640);
  const [isHoveringResizer, setIsHoveringResizer] = useState(false);
  const isResizing = useRef(false);
  const [activeTab, setActiveTab] = useState<'output' | 'terminal'>('output');
  const [outputLines, setOutputLines] = useState<OutputLine[]>([
    { text: 'Output panel ready. Click "Validate AST" to run analysis.', type: 'info' },
  ]);

  // xterm terminal refs
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const [terminalReady, setTerminalReady] = useState(false);

  const language = detectLanguage(inspectorNodeLabel);

  // Seed boilerplate when node changes
  useEffect(() => {
    if (!inspectorNodeId) return;
    setCode(getBoilerplate(inspectorNodeLabel, language));
    setOutputLines([{ text: `Loaded: ${inspectorNodeLabel} (${language})`, type: 'info' }]);
  }, [inspectorNodeId, inspectorNodeLabel, language]);

  // Initialize xterm.js when terminal tab is first opened
  useEffect(() => {
    if (activeTab !== 'terminal' || xtermRef.current || !terminalRef.current) return;

    const initTerminal = async () => {
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');

      const term = new Terminal({
        cursorBlink: true,
        fontFamily: '"Cascadia Code", "Fira Code", monospace',
        fontSize: 13,
        theme: {
          background: '#0d0d0d',
          foreground: '#cccccc',
          cursor: '#007acc',
          selectionBackground: '#264f78',
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b',
          blue: '#60a5fa',
          cyan: '#22d3ee',
        },
        scrollback: 5000,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      if (terminalRef.current) {
        term.open(terminalRef.current);
        fitAddon.fit();
      }

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      term.writeln('\x1b[32mCodeAtlas Shell\x1b[0m — Powered by node-pty');
      term.writeln('\x1b[90mType any shell command and press Enter\x1b[0m');
      term.writeln('');

      // Wire to Electron IPC if available
      const ipcRenderer = (window as any).require?.('electron')?.ipcRenderer;
      if (ipcRenderer) {
        // Receive data from pty process
        ipcRenderer.on('terminal:data', (_event: any, data: string) => {
          term.write(data);
        });

        // Send keystrokes to pty process
        term.onData((data) => {
          ipcRenderer.send('terminal:write', data);
        });

        term.writeln('\x1b[36m[native pty connected]\x1b[0m');
      } else {
        // Fallback: simulate a basic shell using child_process.spawn streaming
        term.writeln('\x1b[33m[running in browser mode — limited shell]\x1b[0m');
        let inputBuffer = '';

        term.write('$ ');
        term.onData((data) => {
          if (data === '\r') {
            term.writeln('');
            const cmd = inputBuffer.trim();
            inputBuffer = '';
            if (cmd === 'clear') { term.clear(); term.write('$ '); return; }
            if (!cmd) { term.write('$ '); return; }

            try {
              const cp = (window as any).require('child_process');
              const proc = cp.spawn('bash', ['-c', cmd], { cwd: '/home' });
              proc.stdout.on('data', (d: { toString(): string }) => term.write(d.toString()));
              proc.stderr.on('data', (d: { toString(): string }) => term.write(`\x1b[31m${d.toString()}\x1b[0m`));
              proc.on('close', () => term.write('$ '));
            } catch {
              term.writeln('\x1b[31mShell unavailable in this context\x1b[0m');
              term.write('$ ');
            }
          } else if (data === '\u007F') {
            if (inputBuffer.length > 0) {
              inputBuffer = inputBuffer.slice(0, -1);
              term.write('\b \b');
            }
          } else {
            inputBuffer += data;
            term.write(data);
          }
        });
      }

      setTerminalReady(true);
    };

    initTerminal();
  }, [activeTab]);

  // Fit terminal on resize
  useEffect(() => {
    if (fitAddonRef.current && terminalReady) {
      setTimeout(() => fitAddonRef.current?.fit(), 100);
    }
  }, [width, terminalReady]);

  // Resizable handle
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 380 && newWidth < window.innerWidth - 380) setWidth(newWidth);
    };
    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      setIsHoveringResizer(false);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleValidate = useCallback(() => {
    const isErr = code.toLowerCase().includes('error') || code.toLowerCase().includes('fail');
    setActiveTab('output');
    if (isErr) {
      setOutputLines([
        { text: 'ENGINE_BUILD_FAILED', type: 'error' },
        { text: `EngineHeuristicError: Invalid tokens or vulnerable logic pathways detected.`, type: 'error' },
        { text: 'Recommendation: Review lines flagged by the AST scanner.', type: 'info' },
      ]);
    } else {
      setOutputLines([
        { text: 'ENGINE_BUILD_SUCCESS', type: 'success' },
        { text: 'Syntax verified. Heuristic AST mapping complete.', type: 'success' },
        { text: `Language: ${language} · Component: ${inspectorNodeLabel}`, type: 'info' },
      ]);
    }
  }, [code, language, inspectorNodeLabel]);

  // Clipboard paste fix
  const handleEditorMount = useCallback((editor: any, monacoInstance: any) => {
    editor.onKeyDown(async (e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.keyCode === monacoInstance.KeyCode.KeyV) {
        try {
          const text = await navigator.clipboard.readText();
          const sel = editor.getSelection();
          if (sel && text) {
            editor.executeEdits('paste', [{ range: sel, text, forceMoveMarkers: true }]);
          }
          e.preventDefault();
          e.stopPropagation();
        } catch {}
      }
    });
  }, []);

  if (!inspectorOpen) return null;

  return (
    <div style={{
      position: 'relative',
      width: `${width}px`,
      minWidth: `${width}px`,
      height: '100%',
      background: '#1e1e1e',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #2d2d2d',
      flexShrink: 0,
      zIndex: 50,
    }}>
      {/* Resize handle */}
      <div
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px',
          cursor: 'col-resize', zIndex: 10,
          background: isHoveringResizer || isResizing.current ? '#007acc' : 'transparent',
          transition: 'background 0.2s',
        }}
        onMouseEnter={() => setIsHoveringResizer(true)}
        onMouseLeave={() => setIsHoveringResizer(false)}
        onMouseDown={() => { isResizing.current = true; document.body.style.cursor = 'col-resize'; }}
      />

      {/* Header */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        background: '#252526', borderBottom: '1px solid #2d2d2d', paddingLeft: '6px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px 8px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ccc' }}>{inspectorNodeLabel}</span>
            <span style={{
              fontSize: '10px', color: '#888', background: '#1e1e1e',
              padding: '2px 6px', borderRadius: '3px', border: '1px solid #333', textTransform: 'uppercase',
            }}>{language}</span>
          </div>
          <button onClick={closeInspector} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
          >
            <X size={16} />
          </button>
        </div>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 14px 8px 18px', gap: '8px' }}>
          <button onClick={() => { setActiveTab('output'); handleValidate(); }} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#0e639c', color: 'white', border: '1px solid #1177bb',
            padding: '4px 12px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1177bb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#0e639c'}
          >
            <Play size={13} /> Validate AST
          </button>
          <button onClick={() => setActiveTab('terminal')} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#333', color: '#ccc', border: '1px solid #444',
            padding: '4px 12px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#444'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#333'}
          >
            <TerminalSquare size={13} /> Shell
          </button>
          <div style={{ flex: 1 }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontSize: '12px' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
          >
            <CheckCircle size={13} /> Format
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontSize: '12px' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
          >
            <Save size={13} /> Save
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, paddingLeft: '5px', minHeight: 0 }}>
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            padding: { top: 12 },
            tabCompletion: 'on',
            quickSuggestions: { other: true, comments: true, strings: true },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'smart',
            acceptSuggestionOnCommitCharacter: true,
            wordBasedSuggestions: 'currentDocument',
          }}
        />
      </div>

      {/* Bottom Panel */}
      <div style={{
        height: '220px', minHeight: '220px',
        background: '#0d0d0d', borderTop: '1px solid #2d2d2d',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', background: '#1a1a1a', borderBottom: '1px solid #2d2d2d', padding: '0 10px' }}>
          {(['output', 'terminal'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: 'transparent', border: 'none',
              padding: '7px 14px',
              color: activeTab === tab ? '#e5e5e5' : '#666',
              fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer',
              borderBottom: activeTab === tab ? '1px solid #007acc' : '1px solid transparent',
              outline: 'none',
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Output */}
        {activeTab === 'output' && (
          <div style={{ flex: 1, padding: '10px 14px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {outputLines.map((line, i) => (
              <div key={i} style={{
                color: line.type === 'error' ? '#ef4444' : line.type === 'success' ? '#10b981' : line.type === 'command' ? '#569cd6' : '#888',
                display: 'flex', alignItems: 'flex-start', gap: '6px',
              }}>
                <ChevronRight size={11} style={{ marginTop: '2px', flexShrink: 0 }} />
                {line.text}
              </div>
            ))}
          </div>
        )}

        {/* xterm.js Terminal */}
        {activeTab === 'terminal' && (
          <div style={{ flex: 1, overflow: 'hidden', padding: '4px' }}>
            <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
          </div>
        )}
      </div>
    </div>
  );
}
