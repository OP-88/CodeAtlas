import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Clock, ChevronRight, Code2 } from 'lucide-react';
import { useGraphStore } from '../store/useGraphStore';

interface RecentProject {
  name: string;
  filePath: string;
  lastSavedAt: string;
}

function getRecentProjects(): RecentProject[] {
  try {
    const raw = localStorage.getItem('codeatlas-recent-projects');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addToRecents(project: RecentProject) {
  const existing = getRecentProjects().filter(p => p.filePath !== project.filePath);
  const updated = [project, ...existing].slice(0, 8);
  localStorage.setItem('codeatlas-recent-projects', JSON.stringify(updated));
}

export default function WelcomeScreen() {
  const { newProject, loadWorkspace } = useGraphStore();
  const [recents, setRecents] = useState<RecentProject[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  useEffect(() => {
    setRecents(getRecentProjects());
  }, []);

  const handleNew = () => {
    if (!projectName.trim()) return;
    newProject(projectName.trim(), projectDesc.trim());
  };

  const handleOpen = async () => {
    const ipcRenderer = (window as any).require?.('electron')?.ipcRenderer;
    if (!ipcRenderer) return;
    const result = await ipcRenderer.invoke('project:open-dialog');
    if (result?.workspace) {
      loadWorkspace(result.workspace);
      addToRecents({ name: result.workspace.project.name, filePath: result.filePath, lastSavedAt: result.workspace.project.lastSavedAt });
      setRecents(getRecentProjects());
    }
  };

  const handleOpenRecent = async (filePath: string) => {
    const ipcRenderer = (window as any).require?.('electron')?.ipcRenderer;
    if (!ipcRenderer) return;
    const result = await ipcRenderer.invoke('project:open-path', filePath);
    if (result?.workspace) {
      loadWorkspace(result.workspace);
    }
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#0d0d0d',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '680px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="./codeatlas_icon.png"
            alt="CodeAtlas Logo"
            style={{
              width: '54px', height: '54px',
              filter: 'drop-shadow(0 0 20px rgba(0,122,204,0.3))'
            }}
          />
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#e5e5e5', letterSpacing: '-0.02em' }}>CodeAtlas</div>
            <div style={{ fontSize: '12px', color: '#555', fontFamily: 'monospace' }}>Multi-Modal Code Cartography Engine — v2.0</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>

          {/* Left — Actions */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', fontWeight: 600 }}>
              Start
            </div>

            {!showNewForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button onClick={() => setShowNewForm(true)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', background: 'transparent',
                  border: '1px solid #2d2d2d', borderRadius: '6px',
                  color: '#ccc', cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#007acc'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#2d2d2d'; }}
                >
                  <Plus size={15} color="#10b981" /> New Project
                </button>
                <button onClick={handleOpen} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', background: 'transparent',
                  border: '1px solid #2d2d2d', borderRadius: '6px',
                  color: '#ccc', cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#007acc'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#2d2d2d'; }}
                >
                  <FolderOpen size={15} color="#60a5fa" /> Open Project...
                </button>
                <button onClick={() => newProject('Scratch', 'Quick scratchpad')} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', background: 'transparent',
                  border: '1px solid #2d2d2d', borderRadius: '6px',
                  color: '#888', cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#2d2d2d'; }}
                >
                  <Code2 size={15} color="#a78bfa" /> Quick Scratchpad
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  autoFocus
                  placeholder="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNew()}
                  style={{
                    background: '#1a1a1a', border: '1px solid #007acc',
                    borderRadius: '5px', padding: '9px 12px',
                    color: '#e5e5e5', fontSize: '13px', outline: 'none',
                  }}
                />
                <input
                  placeholder="Description (optional)"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNew()}
                  style={{
                    background: '#1a1a1a', border: '1px solid #333',
                    borderRadius: '5px', padding: '9px 12px',
                    color: '#ccc', fontSize: '12px', outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleNew} disabled={!projectName.trim()} style={{
                    flex: 1, padding: '9px', background: '#0e639c',
                    border: '1px solid #1177bb', borderRadius: '5px',
                    color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    opacity: projectName.trim() ? 1 : 0.4,
                  }}>
                    Create Project
                  </button>
                  <button onClick={() => setShowNewForm(false)} style={{
                    padding: '9px 14px', background: 'transparent',
                    border: '1px solid #333', borderRadius: '5px',
                    color: '#888', cursor: 'pointer', fontSize: '13px',
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: '1px', background: '#1e1e1e' }} />

          {/* Right — Recent */}
          <div style={{ flex: 1.4 }}>
            <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', fontWeight: 600 }}>
              Recent
            </div>
            {recents.length === 0 ? (
              <div style={{ color: '#3a3a3a', fontSize: '12px', fontStyle: 'italic', marginTop: '8px' }}>
                No recent projects yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {recents.map((r) => (
                  <button key={r.filePath} onClick={() => handleOpenRecent(r.filePath)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 12px', background: 'transparent',
                    border: '1px solid transparent', borderRadius: '5px',
                    color: '#ccc', cursor: 'pointer', fontSize: '12px', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#2d2d2d'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <div>
                      <div style={{ color: '#d4d4d4', fontWeight: 500 }}>{r.name}</div>
                      <div style={{ fontSize: '10px', color: '#555', marginTop: '2px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                        {r.filePath}
                      </div>
                      {r.lastSavedAt && (
                        <div style={{ fontSize: '10px', color: '#444', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={9} /> {new Date(r.lastSavedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={13} color="#444" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#333', textAlign: 'center' }}>
          Projects are saved as <span style={{ color: '#555', fontFamily: 'monospace' }}>.catlas</span> files — fully portable, version-control friendly JSON
        </div>
      </div>
    </div>
  );
}
