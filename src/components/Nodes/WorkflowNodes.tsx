import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { WorkflowNodeData, NodeType } from '../../types/workflow';
import { useWorkflowStore } from '../../hooks/useWorkflow';

const nodeConfig: Record<NodeType, { accent: string; bg: string; icon: string; badge: string; badgeText: string }> = {
  start:     { accent: '#22c55e', bg: '#f0fdf4', icon: '▶', badge: 'bg-green-100 text-green-700 border-green-200',  badgeText: 'START' },
  task:      { accent: '#3b82f6', bg: '#eff6ff', icon: '⊞', badge: 'bg-blue-100 text-blue-700 border-blue-200',    badgeText: 'TASK' },
  approval:  { accent: '#f59e0b', bg: '#fffbeb', icon: '✦', badge: 'bg-amber-100 text-amber-700 border-amber-200', badgeText: 'APPROVAL' },
  automated: { accent: '#8b5cf6', bg: '#faf5ff', icon: '⚡', badge: 'bg-purple-100 text-purple-700 border-purple-200', badgeText: 'AUTO' },
  condition: { accent: '#ec4899', bg: '#fdf2f8', icon: '◆', badge: 'bg-pink-100 text-pink-700 border-pink-200',    badgeText: 'IF/ELSE' },
  end:       { accent: '#ef4444', bg: '#fef2f2', icon: '■', badge: 'bg-red-100 text-red-700 border-red-200',        badgeText: 'END' },
};

const darkNodeConfig: Record<NodeType, { bg: string; accent: string }> = {
  start:     { bg: '#052e16', accent: '#22c55e' },
  task:      { bg: '#0c1a2e', accent: '#3b82f6' },
  approval:  { bg: '#2d1f00', accent: '#f59e0b' },
  automated: { bg: '#1e0a3c', accent: '#8b5cf6' },
  condition: { bg: '#2d0a1e', accent: '#ec4899' },
  end:       { bg: '#2d0a0a', accent: '#ef4444' },
};

function WorkflowNode({ id, data, selected }: NodeProps<WorkflowNodeData>) {
  const { setSelectedNodeId, darkMode } = useWorkflowStore();
  const cfg = nodeConfig[data.type];
  const darkCfg = darkNodeConfig[data.type];

  const bg = darkMode ? darkCfg.bg : cfg.bg;
  const borderColor = selected ? cfg.accent : (darkMode ? '#374151' : '#e5e7eb');
  const titleColor = darkMode ? '#f9fafb' : '#111827';
  const subtitleColor = darkMode ? '#9ca3af' : '#6b7280';

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      style={{
        background: bg,
        border: `2px solid ${borderColor}`,
        borderRadius: 14,
        minWidth: 200,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: selected ? `0 0 0 3px ${cfg.accent}33` : 'none',
      }}
    >
      {data.type !== 'start' && (
        <Handle type="target" position={Position.Top} style={{ background: cfg.accent, width: 10, height: 10, border: '2px solid white' }} />
      )}

      <div style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            background: darkMode ? `${cfg.accent}22` : undefined,
            color: cfg.accent, padding: '2px 7px', borderRadius: 99,
            border: `1px solid ${cfg.accent}44`,
          }}>
            {cfg.icon} {cfg.badgeText}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: titleColor, lineHeight: 1.3 }}>
          {data.title || data.label}
        </p>
        {'assignee' in data && (data as import('../../types/workflow').TaskNodeData).assignee && (
          <p style={{ margin: '4px 0 0', fontSize: 11, color: subtitleColor }}>
            👤 {(data as import('../../types/workflow').TaskNodeData).assignee}
          </p>
        )}
        {'approver' in data && (data as import('../../types/workflow').ApprovalNodeData).approver && (
          <p style={{ margin: '4px 0 0', fontSize: 11, color: subtitleColor }}>
            ✓ {(data as import('../../types/workflow').ApprovalNodeData).approver}
          </p>
        )}
        {'priority' in data && (
          <span style={{
            display: 'inline-block', marginTop: 5,
            fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99,
            background: (data as import('../../types/workflow').TaskNodeData).priority === 'high' ? '#fee2e2' : (data as import('../../types/workflow').TaskNodeData).priority === 'medium' ? '#fef9c3' : '#f0fdf4',
            color: (data as import('../../types/workflow').TaskNodeData).priority === 'high' ? '#b91c1c' : (data as import('../../types/workflow').TaskNodeData).priority === 'medium' ? '#854d0e' : '#166534',
          }}>
            {((data as import('../../types/workflow').TaskNodeData).priority || 'medium').toUpperCase()}
          </span>
        )}
      </div>

      {data.type !== 'end' && (
        <Handle type="source" position={Position.Bottom} style={{ background: cfg.accent, width: 10, height: 10, border: '2px solid white' }} />
      )}
    </div>
  );
}

export const StartNode = memo((p: NodeProps<WorkflowNodeData>) => <WorkflowNode {...p} />);
export const TaskNode = memo((p: NodeProps<WorkflowNodeData>) => <WorkflowNode {...p} />);
export const ApprovalNode = memo((p: NodeProps<WorkflowNodeData>) => <WorkflowNode {...p} />);
export const AutomatedNode = memo((p: NodeProps<WorkflowNodeData>) => <WorkflowNode {...p} />);
export const ConditionNode = memo((p: NodeProps<WorkflowNodeData>) => <WorkflowNode {...p} />);
export const EndNode = memo((p: NodeProps<WorkflowNodeData>) => <WorkflowNode {...p} />);

StartNode.displayName = 'StartNode';
TaskNode.displayName = 'TaskNode';
ApprovalNode.displayName = 'ApprovalNode';
AutomatedNode.displayName = 'AutomatedNode';
ConditionNode.displayName = 'ConditionNode';
EndNode.displayName = 'EndNode';
