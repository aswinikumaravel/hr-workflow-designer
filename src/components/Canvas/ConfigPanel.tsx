import { useWorkflowStore } from '../../hooks/useWorkflow';
import { NodeConfigForm } from '../Forms/NodeConfigForm';

export function ConfigPanel() {
  const { nodes, selectedNodeId, darkMode } = useWorkflowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const bg = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#f1f5f9';
  const text = darkMode ? '#f1f5f9' : '#0f172a';
  const muted = darkMode ? '#64748b' : '#94a3b8';

  return (
    <div style={{ width: 256, background: bg, borderLeft: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${border}` }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: text }}>Properties</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {selectedNode ? (
          <NodeConfigForm nodeId={selectedNode.id} data={selectedNode.data} />
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 48, color: muted }}>
            <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }}>⬡</div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: muted }}>No node selected</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: muted }}>Click any node to configure it</p>
          </div>
        )}
      </div>
    </div>
  );
}
