import React, { useEffect, useState } from 'react';
import { Map, Microscope, Zap, Wifi, WifiOff } from 'lucide-react';
import { useGraphStore } from '../store/useGraphStore';
import type { EngineTab } from '../store/useGraphStore';

const TABS: { id: EngineTab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'recon', label: 'Recon Map', icon: <Map size={14} />, description: 'Macro architecture view' },
  { id: 'deconstructor', label: 'Deconstructor', icon: <Microscope size={14} />, description: 'Deep file analysis' },
  { id: 'simulator', label: 'Simulator', icon: <Zap size={14} />, description: 'Heuristic validation' },
];

export default function TopBar() {
  const { activeTab, setActiveTab } = useGraphStore();
  const [engineOnline, setEngineOnline] = useState(false);

  useEffect(() => {
    const check = () =>
      fetch('http://localhost:8000/api/health')
        .then(() => setEngineOnline(true))
        .catch(() => setEngineOnline(false));
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      height: '46px',
      minHeight: '46px',
      background: '#1a1a1a',
      borderBottom: '1px solid #2d2d2d',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '16px',
      paddingRight: '16px',
      gap: '0',
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginRight: '24px', flexShrink: 0,
      }}>
        <div style={{
          width: '22px', height: '22px', borderRadius: '5px',
          background: 'linear-gradient(135deg, #007acc, #0e639c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 'bold', color: 'white', fontFamily: 'monospace',
        }}>CA</div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#d4d4d4', letterSpacing: '0.03em' }}>
          CodeAtlas
        </span>
        <span style={{ fontSize: '10px', color: '#555', fontFamily: 'monospace' }}>v2.0</span>
      </div>

      {/* Engine Tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', gap: '2px' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.description}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '0 16px',
                background: isActive ? '#252526' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #007acc' : '2px solid transparent',
                color: isActive ? '#e5e5e5' : '#888',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                outline: 'none',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#ccc'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#888'; }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Engine Status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '11px', color: engineOnline ? '#10b981' : '#6b7280',
      }}>
        {engineOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
        <span>{engineOnline ? 'Engine Online' : 'Engine Offline'}</span>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: engineOnline ? '#10b981' : '#6b7280',
          boxShadow: engineOnline ? '0 0 6px #10b981' : 'none',
        }} />
      </div>
    </div>
  );
}
