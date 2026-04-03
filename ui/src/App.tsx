import TopBar from './components/TopBar';
import ReconCanvas from './components/ReconCanvas';
import DeconstructorCanvas from './components/DeconstructorCanvas';
import SimulatorPanel from './components/SimulatorPanel';
import InspectorPanel from './components/InspectorPanel';
import WelcomeScreen from './components/WelcomeScreen';
import Sidebar from './Sidebar';
import CommandPalette from './components/CommandPalette';
import { useGraphStore } from './store/useGraphStore';
import { useEffect } from 'react';

export default function App() {
  const { 
    activeTab, project, isDirty, markSaved, 
    loadWorkspace, closeProject, newProject, openCommandPalette 
  } = useGraphStore();

  // Wire Electron IPC menu events into the React store
  useEffect(() => {
    const ipcRenderer = (window as any).require?.('electron')?.ipcRenderer;
    if (!ipcRenderer) return;

    // File > New Project
    ipcRenderer.on('menu:new-project', () => {
      if (isDirty) {
        const ok = window.confirm('You have unsaved changes. Discard and create a new project?');
        if (!ok) return;
      }
      newProject('Untitled Project');
    });

    // File > Save / Save As — main process does the actual dialog + disk write
    ipcRenderer.on('menu:save-result', (_: any, { filePath }: { filePath: string }) => {
      markSaved(filePath);
    });

    // File > Open (result comes back after dialog)
    ipcRenderer.on('menu:open-result', (_: any, result: any) => {
      if (result?.workspace) loadWorkspace(result.workspace);
    });

    // File > Close Project
    ipcRenderer.on('menu:close-project', () => {
      if (isDirty) {
        const ok = window.confirm('You have unsaved changes. Close without saving?');
        if (!ok) return;
      }
      closeProject();
    });

    // Help > Search Commands
    ipcRenderer.on('menu:search-commands', () => {
      openCommandPalette();
    });

    return () => {
      ipcRenderer.removeAllListeners('menu:new-project');
      ipcRenderer.removeAllListeners('menu:save-result');
      ipcRenderer.removeAllListeners('menu:open-result');
      ipcRenderer.removeAllListeners('menu:close-project');
      ipcRenderer.removeAllListeners('menu:search-commands');
    };
  }, [isDirty, markSaved, loadWorkspace, closeProject, newProject, openCommandPalette]);

  // Keyboard shortcut: Ctrl+S for Save, Ctrl+Shift+P for Command Palette
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const ipcRenderer = (window as any).require?.('electron')?.ipcRenderer;
        ipcRenderer?.invoke('project:save');
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        openCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [openCommandPalette]);

  // Update native menu visibility
  useEffect(() => {
    const ipcRenderer = (window as any).require?.('electron')?.ipcRenderer;
    ipcRenderer?.send('menu:set-visibility', !!project);
  }, [project]);

  // No project loaded → Welcome screen
  if (!project) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d0d0d', overflow: 'hidden' }}>
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#121212', overflow: 'hidden' }}>
      {/* Top Bar — always visible */}
      <TopBar />

      {/* Main workspace row */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', minHeight: 0 }}>
        <Sidebar />

        {/* Canvas area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ display: activeTab === 'recon' ? 'block' : 'none', width: '100%', height: '100%' }}>
            <ReconCanvas />
          </div>
          <div style={{ display: activeTab === 'deconstructor' ? 'block' : 'none', width: '100%', height: '100%' }}>
            <DeconstructorCanvas />
          </div>
          <div style={{ display: activeTab === 'simulator' ? 'block' : 'none', width: '100%', height: '100%' }}>
            <SimulatorPanel />
          </div>
        </div>

        {/* Right Inspector Panel */}
        <InspectorPanel />
      </div>
      
      <CommandPalette />
    </div>
  );
}
