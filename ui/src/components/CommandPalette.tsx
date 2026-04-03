import { useEffect, useState, useRef } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { Search, CornerDownLeft, X } from 'lucide-react';

export default function CommandPalette() {
  const { 
    isCommandPaletteOpen, closeCommandPalette, 
    newProject, closeProject
  } = useGraphStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  // List of all commands
  const allCommands = [
    {
      name: 'File: New Project',
      action: () => {
        const ipcRenderer = (window as any).require?.('electron')?.ipcRenderer;
        ipcRenderer?.send('menu:set-visibility', true); // ensure menus shown if it forces welcome screen
        newProject('Untitled Project');
      }
    },
    {
      name: 'File: Open Project...',
      action: () => {
        const ipcRenderer = (window as any).require?.('electron')?.ipcRenderer;
        ipcRenderer?.invoke('project:open-dialog').then((res: any) => {
          if (res) ipcRenderer.send('menu:open-result', res);
        });
      }
    },
    {
      name: 'File: Save Project',
      action: () => {
        const ipcRenderer = (window as any).require?.('electron')?.ipcRenderer;
        ipcRenderer?.invoke('project:save');
      }
    },
    {
      name: 'File: Close Workspace',
      action: () => {
        closeProject();
      }
    },
    {
      name: 'View: Toggle Fullscreen',
      action: () => {
        const ipcRenderer = (window as any).require?.('electron')?.ipcRenderer;
        ipcRenderer?.invoke('window:toggle-fullscreen');
      }
    },
    {
      name: 'Inspector: Format Code',
      action: () => {
        window.dispatchEvent(new CustomEvent('cmd:format-code'));
      }
    },
    {
      name: 'Inspector: Save Node Logic',
      action: () => {
        window.dispatchEvent(new CustomEvent('cmd:save-node'));
      }
    },
    {
      name: 'Inspector: Validate AST',
      action: () => {
        window.dispatchEvent(new CustomEvent('cmd:validate-ast'));
      }
    },
    {
      name: 'Inspector: Open Shell',
      action: () => {
        window.dispatchEvent(new CustomEvent('cmd:open-shell'));
      }
    }
  ];

  // Filter based on query
  const filteredCommands = allCommands.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;
      
      if (e.key === 'Escape') {
        closeCommandPalette();
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (filteredCommands.length > 0) {
          const cmd = filteredCommands[selectedIndex];
          cmd.action();
          closeCommandPalette();
        }
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filteredCommands, selectedIndex, closeCommandPalette]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', zIndex: 999999,
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      paddingTop: '15vh', backdropFilter: 'blur(2px)'
    }} onClick={closeCommandPalette}>
      <div style={{
        width: '600px', maxWidth: '90%', background: '#1e1e1e',
        borderRadius: '8px', border: '1px solid #3c3c3c',
        boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Search Header */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '12px 16px',
          borderBottom: '1px solid #2d2d2d', gap: '10px'
        }}>
          <Search size={18} color="#888" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: '#fff', fontSize: '15px', outline: 'none'
            }}
          />
          <button onClick={closeCommandPalette} style={{
            background: 'transparent', border: 'none', color: '#888',
            cursor: 'pointer', padding: '4px', display: 'flex'
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px 0' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
              No commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.name}
                  onClick={() => {
                    cmd.action();
                    closeCommandPalette();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '10px 16px', cursor: 'pointer',
                    background: isSelected ? '#004a77' : 'transparent',
                    color: isSelected ? '#fff' : '#ccc',
                    fontSize: '13px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    borderLeft: isSelected ? '3px solid #007acc' : '3px solid transparent',
                  }}
                >
                  <span>{cmd.name}</span>
                  {isSelected && <CornerDownLeft size={14} color="#888" />}
                </div>
              );
            })
          )}
        </div>
        
        <div style={{
          padding: '8px 16px', background: '#252526', borderTop: '1px solid #2d2d2d',
          fontSize: '11px', color: '#666', display: 'flex', justifyContent: 'space-between'
        }}>
          <span>Use <b>↑ ↓</b> to navigate, <b>Enter</b> to select, <b>Esc</b> to close.</span>
        </div>
      </div>
    </div>
  );
}
