import React from 'react';
import { 
  Server, 
  Database, 
  AppWindow, 
  Cloud, 
  Globe, 
  Cpu, 
  HardDrive,
  CodeSquare,
  Box,
  Layout,
  Smartphone,
  Shield
} from 'lucide-react';

const components = [
  { type: 'frontend', label: 'React SPA', icon: AppWindow, group: 'Frontend' },
  { type: 'frontend', label: 'Next.js App', icon: Layout, group: 'Frontend' },
  { type: 'mobile', label: 'iOS/Swift', icon: Smartphone, group: 'Frontend' },
  { type: 'backend', label: 'FastAPI Server', icon: Server, group: 'Backend' },
  { type: 'backend', label: 'Express.js', icon: CodeSquare, group: 'Backend' },
  { type: 'backend', label: 'Spring Boot', icon: Cpu, group: 'Backend' },
  { type: 'database', label: 'PostgreSQL DB', icon: Database, group: 'Databases' },
  { type: 'database', label: 'MongoDB', icon: HardDrive, group: 'Databases' },
  { type: 'database', label: 'Redis Cache', icon: Box, group: 'Databases' },
  { type: 'infra', label: 'AWS S3 Bucket', icon: Cloud, group: 'Infrastructure' },
  { type: 'infra', label: 'Nginx Proxy', icon: Globe, group: 'Infrastructure' },
  { type: 'security', label: 'Auth0 / IAM', icon: Shield, group: 'Security' }
];

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside style={{ 
      width: '260px',
      minWidth: '260px',
      flexShrink: 0,
      background: '#1e1e1e', 
      borderRight: '1px solid #333', 
      padding: '15px 10px', 
      color: '#e0e0e0',
      overflowY: 'auto',
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: '5px 5px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#858585' }}>
          Component Library
        </h3>
      </div>

      <div 
        onDragStart={(event) => onDragStart(event, 'custom', 'Raw Script Ingestion')} 
        draggable 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', background: '#0e639c', 
          border: '1px solid #1177bb', borderRadius: '4px', 
          cursor: 'grab', fontSize: '13px', fontWeight: 'bold', color: 'white', transition: 'background 0.2s', marginBottom: '10px' 
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#1177bb'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#0e639c'}
      >
        <span style={{ fontSize: '16px', lineHeight: 1 }}>{'</>'}</span>
        <span>Raw Script Engine</span>
      </div>
      
      {['Frontend', 'Backend', 'Databases', 'Infrastructure', 'Security'].map(group => (
        <div key={group} style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', marginLeft: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {group}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {components.filter(c => c.group === group).map(c => {
              const Icon = c.icon;
              return (
                <div 
                  key={c.label}
                  onDragStart={(event) => onDragStart(event, c.type, c.label)} 
                  draggable 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', background: '#252526', 
                    border: '1px solid #3c3c3c', borderRadius: '4px', 
                    cursor: 'grab', fontSize: '13px', transition: 'background 0.2s' 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2a2d2e'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#252526'}
                >
                  <Icon size={16} color="#007acc" />
                  <span>{c.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
