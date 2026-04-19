import type { DragEvent } from 'react';
import { useRef } from 'react';
import { useWorkflowStore } from '../../hooks/useWorkflow';
import type { NodeType } from '../../types/workflow';

const nodeItems: { type: NodeType; label: string; icon: string; color: string; desc: string }[] = [
  { type: 'start',     label: 'Start',      icon: '▶', color: '#22c55e', desc: 'Entry point' },
  { type: 'task',      label: 'Task',       icon: '⊞', color: '#3b82f6', desc: 'Manual step' },
  { type: 'approval',  label: 'Approval',   icon: '✦', color: '#f59e0b', desc: 'Needs sign-off' },
  { type: 'automated', label: 'Automated',  icon: '⚡', color: '#8b5cf6', desc: 'Auto action' },
  { type: 'condition', label: 'Condition',  icon: '◆', color: '#ec4899', desc: 'Branch logic' },
  { type: 'end',       label: 'End',        icon: '■', color: '#ef4444', desc: 'Final step' },
];

const templates: { id: 'onboarding' | 'leave' | 'document' | 'exit'; label: string; icon: string }[] = [
  { id: 'onboarding', label: 'Employee Onboarding', icon: '👤' },
  { id: 'leave',      label: 'Leave Approval',       icon: '📅' },
  { id: 'document',   label: 'Document Verification',icon: '📄' },
  { id: 'exit',       label: 'Employee Exit',         icon: '🚪' },
];

export function Sidebar() {
  const { loadTemplate, darkMode, exportToJson, importFromJson, workflowName, setWorkflowName } = useWorkflowStore();
  const importRef = useRef<HTMLInputElement>(null);

  const onDragStart = (e: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target?.result) importFromJson(ev.target.result as string); };
    reader.readAsText(file);
    e.target.value = '';
  };

  const bg = darkMode ? '#111827' : '#ffffff';
  const border = darkMode ? '#1f2937' : '#f3f4f6';
  const text = darkMode ? '#f9fafb' : '#111827';
  const muted = darkMode ? '#6b7280' : '#9ca3af';
  const surface = darkMode ? '#1f2937' : '#f9fafb';
  const surfaceBorder = darkMode ? '#374151' : '#e5e7eb';

  return (
    <aside style={{ width: 240, background: bg, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>⬡</div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: text }}>FlowHR</p>
            <p style={{ margin: 0, fontSize: 10, color: muted }}>Workflow Designer</p>
          </div>
        </div>
        <input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          style={{ width: '100%', fontSize: 12, padding: '5px 8px', borderRadius: 7, border: `1px solid ${surfaceBorder}`, background: surface, color: text, outline: 'none', boxSizing: 'border-box' }}
          placeholder="Workflow name..."
        />
      </div>

      <div style={{ padding: '12px 16px' }}>
        <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: muted, letterSpacing: '0.1em' }}>NODES — DRAG TO CANVAS</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {nodeItems.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 10, border: `1px solid ${item.color}33`, background: `${item.color}11`,
                cursor: 'grab', userSelect: 'none', transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span style={{ color: item.color, fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: text }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 10, color: muted }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}` }}>
        <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: muted, letterSpacing: '0.1em' }}>TEMPLATES</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => loadTemplate(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                borderRadius: 8, border: `1px solid ${surfaceBorder}`, background: surface,
                color: text, cursor: 'pointer', fontSize: 12, fontWeight: 500, textAlign: 'left', width: '100%', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? '#374151' : '#ede9fe')}
              onMouseLeave={(e) => (e.currentTarget.style.background = surface)}
            >
              <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}`, marginTop: 'auto' }}>
        <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: muted, letterSpacing: '0.1em' }}>IMPORT / EXPORT</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={exportToJson}
            style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid #6366f133`, background: '#6366f111', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            ↓ Export JSON
          </button>
          <button
            onClick={() => importRef.current?.click()}
            style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${surfaceBorder}`, background: surface, color: text, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            ↑ Import JSON
          </button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 10, color: muted }}>
          Del — delete selected node<br />
          Ctrl+scroll — zoom in/out
        </p>
      </div>
    </aside>
  );
}
