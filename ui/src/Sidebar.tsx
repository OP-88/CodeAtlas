import React from 'react';

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside style={{ width: '250px', background: '#222', borderRight: '1px solid #444', padding: '15px', color: 'white', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', color: '#888' }}>Components</h3>
      <div 
        onDragStart={(event) => onDragStart(event, 'frontend', 'React Frontend')} 
        draggable 
        style={{ padding: '10px', background: '#333', border: '1px solid #555', borderRadius: '4px', cursor: 'grab' }}
      >
        ⚛️ React Frontend
      </div>
      <div 
        onDragStart={(event) => onDragStart(event, 'backend', 'FastAPI Server')} 
        draggable 
        style={{ padding: '10px', background: '#333', border: '1px solid #555', borderRadius: '4px', cursor: 'grab' }}
      >
        ⚡ FastAPI Server
      </div>
      <div 
        onDragStart={(event) => onDragStart(event, 'database', 'PostgreSQL')} 
        draggable 
        style={{ padding: '10px', background: '#333', border: '1px solid #555', borderRadius: '4px', cursor: 'grab' }}
      >
        🐘 PostgreSQL DB
      </div>
    </aside>
  );
}
