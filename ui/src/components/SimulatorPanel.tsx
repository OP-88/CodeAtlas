import { useGraphStore } from '../store/useGraphStore';
import { Zap, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface SimFlag {
  severity: 'red' | 'amber' | 'green';
  title: string;
  description: string;
}

// Deterministic heuristic check — will be replaced by Python engine response
function runHeuristics(nodes: any[]): SimFlag[] {
  const flags: SimFlag[] = [];

  nodes.forEach((node) => {
    const label = (node.data?.label || '').toLowerCase();

    if (label.includes('frontend') && nodes.some((n) => (n.data?.label || '').toLowerCase().includes('database'))) {
      flags.push({
        severity: 'red',
        title: 'Direct Database Exposure',
        description: 'A frontend component is directly wired to a database node. This bypasses all API security layers and exposes raw query capabilities to the client boundary.',
      });
    }

    if (label.includes('auth') && !nodes.some((n) => (n.data?.label || '').toLowerCase().includes('ssl') || (n.data?.label || '').toLowerCase().includes('https'))) {
      flags.push({
        severity: 'amber',
        title: 'Unencrypted Auth Channel Suspected',
        description: 'An authentication component is present but no TLS/SSL termination node is detected in the architecture. Auth tokens may be in transit unencrypted.',
      });
    }

    if (label.includes('redis') && !nodes.some((n) => (n.data?.label || '').toLowerCase().includes('auth'))) {
      flags.push({
        severity: 'amber',
        title: 'Unauthenticated Cache Layer',
        description: 'A Redis cache node has no visible auth or rate-limiting middleware upstream. Default Redis instances require no password.',
      });
    }
  });

  if (flags.length === 0) {
    flags.push({
      severity: 'green',
      title: 'No Critical Violations Detected',
      description: 'The heuristic scan found no obvious structural vulnerabilities in the current component relationship graph. Deep code analysis requires the Tree-sitter engine.',
    });
  }

  return flags;
}

const severityConfig = {
  red: { icon: <XCircle size={14} />, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'CRITICAL' },
  amber: { icon: <AlertTriangle size={14} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'WARNING' },
  green: { icon: <CheckCircle size={14} />, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', label: 'PASS' },
};

export default function SimulatorPanel() {
  const { simulator } = useGraphStore();

  if (simulator.nodes.length === 0) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#0d0d0d', color: '#555', gap: '14px',
      }}>
        <Zap size={48} strokeWidth={1} color="#333" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '15px', color: '#666', fontWeight: 500 }}>Simulator is empty</div>
          <div style={{ fontSize: '12px', color: '#444', marginTop: '6px' }}>
            Right-click any node in the Recon Map → <span style={{ color: '#a78bfa' }}>Send to Simulator</span>
          </div>
        </div>
      </div>
    );
  }

  const flags = runHeuristics(simulator.nodes);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0d0d0d', overflow: 'auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Zap size={18} color="#a78bfa" />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#e5e5e5' }}>
            Heuristic Analysis Report
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#555', fontFamily: 'monospace' }}>
          {simulator.nodes.length} component(s) queued · {flags.filter(f => f.severity === 'red').length} critical · {flags.filter(f => f.severity === 'amber').length} warnings
        </p>
      </div>

      {/* Node List */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {simulator.nodes.map((node) => (
          <div key={node.id} style={{
            padding: '4px 10px', background: '#1e1e1e',
            border: '1px solid #333', borderRadius: '4px',
            fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace',
          }}>
            {node.data?.label as string}
          </div>
        ))}
      </div>

      {/* Flags */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {flags.map((flag, i) => {
          const cfg = severityConfig[flag.severity];
          return (
            <div key={i} style={{
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              borderRadius: '8px', padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ color: cfg.color }}>{cfg.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.color, letterSpacing: '0.08em' }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize: '13px', color: '#d4d4d4', fontWeight: 500 }}>{flag.title}</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#888', lineHeight: 1.6 }}>
                {flag.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
