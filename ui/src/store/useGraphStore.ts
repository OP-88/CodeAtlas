import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Node, Edge, Viewport } from '@xyflow/react';

export type EngineTab = 'recon' | 'deconstructor' | 'simulator';

export interface TabGraphState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  viewport: Viewport;
}

const emptyTab = (): TabGraphState => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },
});

interface GraphStore {
  activeTab: EngineTab;
  recon: TabGraphState;
  deconstructor: TabGraphState;
  simulator: TabGraphState;

  setActiveTab: (tab: EngineTab) => void;
  setTabState: (tab: EngineTab, patch: Partial<TabGraphState>) => void;

  // The "Send to..." pivot — queues a node for the target tab
  sendToTab: (nodeId: string, nodeLabel: string, targetTab: 'deconstructor' | 'simulator') => void;

  // Inspector panel state (shared across tabs)
  inspectorOpen: boolean;
  inspectorNodeId: string | null;
  inspectorNodeLabel: string;
  openInspector: (nodeId: string, label: string) => void;
  closeInspector: () => void;
}

export const useGraphStore = create<GraphStore>()(
  persist(
    (set, get) => ({
      activeTab: 'recon',
      recon: emptyTab(),
      deconstructor: emptyTab(),
      simulator: emptyTab(),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setTabState: (tab, patch) =>
        set((state) => ({
          [tab]: { ...state[tab], ...patch },
        })),

      sendToTab: (nodeId, nodeLabel, targetTab) => {
        // Find the node from the recon map
        const { recon } = get();
        const node = recon.nodes.find((n) => n.id === nodeId);
        if (!node) return;

        // Place it in the target tab's canvas at a clean position
        const pivotNode = {
          ...node,
          position: { x: 250, y: 200 },
          style: {
            ...node.style,
            border: '2px solid #007acc',
            boxShadow: '0 0 20px rgba(0,122,204,0.4)',
          },
        };

        set((state) => ({
          [targetTab]: {
            ...state[targetTab as keyof GraphStore] as TabGraphState,
            nodes: [pivotNode],
            edges: [],
            selectedNodeId: nodeId,
          },
          activeTab: targetTab,
        }));
      },

      inspectorOpen: false,
      inspectorNodeId: null,
      inspectorNodeLabel: '',

      openInspector: (nodeId, label) =>
        set({ inspectorOpen: true, inspectorNodeId: nodeId, inspectorNodeLabel: label }),

      closeInspector: () =>
        set({ inspectorOpen: false, inspectorNodeId: null, inspectorNodeLabel: '' }),
    }),
    {
      name: 'codeatlas-workspace',
      // Only persist the graph data — not handler functions
      partialize: (state) => ({
        activeTab: state.activeTab,
        recon: state.recon,
        deconstructor: state.deconstructor,
        simulator: state.simulator,
      }),
    }
  )
);
