import TopBar from './components/TopBar';
import ReconCanvas from './components/ReconCanvas';
import DeconstructorCanvas from './components/DeconstructorCanvas';
import SimulatorPanel from './components/SimulatorPanel';
import InspectorPanel from './components/InspectorPanel';
import Sidebar from './Sidebar';
import { useGraphStore } from './store/useGraphStore';

export default function App() {
  const { activeTab, openInspector } = useGraphStore();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#121212',
      overflow: 'hidden',
    }}>
      {/* Top Bar — always visible */}
      <TopBar />

      {/* Main workspace row */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', minHeight: 0 }}>

        {/* Left Sidebar */}
        <Sidebar onOpenRawScript={() => openInspector('raw-script', 'Raw Script Engine')} />

        {/* Canvas area — switches per tab, all remain mounted for zero-reload switching */}
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

        {/* Right Inspector Panel — docked, resizable */}
        <InspectorPanel />
      </div>
    </div>
  );
}
