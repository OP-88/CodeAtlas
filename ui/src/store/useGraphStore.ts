import { create } from 'zustand';
import type { Node, Edge, Viewport } from '@xyflow/react';

export type EngineTab = 'recon' | 'deconstructor' | 'simulator';

export interface TabGraphState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  viewport: Viewport;
}

export interface ProjectMeta {
  name: string;
  description: string;
  createdAt: string;
  lastSavedAt: string | null;
  filePath: string | null;   // null = unsaved new project
}

const emptyTab = (): TabGraphState => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },
});

const emptyProject = (): ProjectMeta => ({
  name: 'Untitled Project',
  description: '',
  createdAt: new Date().toISOString(),
  lastSavedAt: null,
  filePath: null,
});

interface GraphStore {
  // Project state
  project: ProjectMeta | null;     // null = on welcome screen
  isDirty: boolean;                 // unsaved changes
  setProject: (meta: ProjectMeta) => void;
  newProject: (name: string, description?: string) => void;
  markDirty: () => void;
  markSaved: (filePath: string) => void;
  closeProject: () => void;

  // Tab state
  activeTab: EngineTab;
  recon: TabGraphState;
  deconstructor: TabGraphState;
  simulator: TabGraphState;

  setActiveTab: (tab: EngineTab) => void;
  setTabState: (tab: EngineTab, patch: Partial<TabGraphState>) => void;

  // Load a full saved workspace (all three tab canvases)
  loadWorkspace: (data: {
    recon: TabGraphState;
    deconstructor: TabGraphState;
    simulator: TabGraphState;
    project: ProjectMeta;
  }) => void;

  // "Send to..." pivot
  sendToTab: (nodeId: string, nodeLabel: string, targetTab: 'deconstructor' | 'simulator') => void;

  // Inspector panel
  inspectorOpen: boolean;
  inspectorNodeId: string | null;
  inspectorNodeLabel: string;
  openInspector: (nodeId: string, label: string) => void;
  closeInspector: () => void;
}

// No persist — project files are the source of truth, not localStorage
export const useGraphStore = create<GraphStore>()((set, get) => ({
  project: null,      // null = show welcome screen
  isDirty: false,

  setProject: (meta) => set({ project: meta, isDirty: false }),

  newProject: (name, description = '') => set({
    project: { ...emptyProject(), name, description },
    isDirty: false,
    activeTab: 'recon',
    recon: emptyTab(),
    deconstructor: emptyTab(),
    simulator: emptyTab(),
    inspectorOpen: false,
    inspectorNodeId: null,
    inspectorNodeLabel: '',
  }),

  markDirty: () => set({ isDirty: true }),

  markSaved: (filePath) => set((state) => ({
    isDirty: false,
    project: state.project
      ? { ...state.project, filePath, lastSavedAt: new Date().toISOString() }
      : state.project,
  })),

  closeProject: () => set({
    project: null,
    isDirty: false,
    activeTab: 'recon',
    recon: emptyTab(),
    deconstructor: emptyTab(),
    simulator: emptyTab(),
    inspectorOpen: false,
    inspectorNodeId: null,
    inspectorNodeLabel: '',
  }),

  // Tab state
  activeTab: 'recon',
  recon: emptyTab(),
  deconstructor: emptyTab(),
  simulator: emptyTab(),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setTabState: (tab, patch) =>
    set((state) => ({ [tab]: { ...state[tab as EngineTab], ...patch } })),

  loadWorkspace: ({ recon, deconstructor, simulator, project }) =>
    set({ recon, deconstructor, simulator, project, isDirty: false, activeTab: 'recon' }),

  sendToTab: (nodeId, _nodeLabel, targetTab) => {
    const { recon } = get();
    const node = recon.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const pivotNode = {
      ...node,
      position: { x: 250, y: 200 },
      style: { ...node.style, border: '2px solid #007acc', boxShadow: '0 0 20px rgba(0,122,204,0.4)' },
    };
    set((state) => ({
      [targetTab]: { ...(state[targetTab] as TabGraphState), nodes: [pivotNode], edges: [], selectedNodeId: nodeId },
      activeTab: targetTab,
    }));
  },

  inspectorOpen: false,
  inspectorNodeId: null,
  inspectorNodeLabel: '',
  openInspector: (nodeId, label) => set({ inspectorOpen: true, inspectorNodeId: nodeId, inspectorNodeLabel: label }),
  closeInspector: () => set({ inspectorOpen: false, inspectorNodeId: null, inspectorNodeLabel: '' }),
}));