import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  type ReactFlowInstance, type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../../hooks/useWorkflow';
import { StartNode, TaskNode, ApprovalNode, AutomatedNode, ConditionNode, EndNode } from '../Nodes/WorkflowNodes';
import type { NodeType, WorkflowNodeData } from '../../types/workflow';

const nodeTypes = { startNode: StartNode, taskNode: TaskNode, approvalNode: ApprovalNode, automatedNode: AutomatedNode, conditionNode: ConditionNode, endNode: EndNode };

const defaultData: Record<NodeType, WorkflowNodeData> = {
  start:     { type: 'start', label: 'Start', title: 'Start', triggerType: 'manual', description: '' },
  task:      { type: 'task', label: 'New Task', title: 'New Task', description: '', assignee: '', dueDate: '', priority: 'medium' },
  approval:  { type: 'approval', label: 'Approval', title: 'Approval', approver: '', approvalType: 'single', description: '', deadline: '' },
  automated: { type: 'automated', label: 'Automation', title: 'Automation', automationId: '', params: {} },
  condition: { type: 'condition', label: 'Condition', title: 'Condition', conditionField: '', conditionOperator: 'equals', conditionValue: '' },
  end:       { type: 'end', label: 'End', title: 'End', description: '', status: 'success' },
};

const nodeTypeMap: Record<NodeType, string> = {
  start: 'startNode', task: 'taskNode', approval: 'approvalNode',
  automated: 'automatedNode', condition: 'conditionNode', end: 'endNode',
};

let idCounter = 100;

export function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId, darkMode, stats } = useWorkflowStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  const onInit = useCallback((i: ReactFlowInstance) => { rfInstance.current = i; }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow') as NodeType;
    if (!type || !rfInstance.current || !wrapperRef.current) return;
    const bounds = wrapperRef.current.getBoundingClientRect();
    const position = rfInstance.current.project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    const newNode: Node<WorkflowNodeData> = {
      id: `node_${++idCounter}`, type: nodeTypeMap[type], position, data: { ...defaultData[type] },
    };
    addNode(newNode);
    setSelectedNodeId(newNode.id);
  }, [addNode, setSelectedNodeId]);

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const statBg = darkMode ? '#1e293b' : '#ffffff';
  const statBorder = darkMode ? '#334155' : '#e2e8f0';
  const statText = darkMode ? '#f1f5f9' : '#1e293b';
  const statMuted = darkMode ? '#94a3b8' : '#64748b';

  return (
    <div ref={wrapperRef} style={{ flex: 1, height: '100%', position: 'relative' }}>
      {stats && (
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, display: 'flex', gap: 8, background: statBg,
          border: `1px solid ${statBorder}`, borderRadius: 12, padding: '6px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          {[
            { label: 'Nodes', value: stats.totalNodes, color: '#6366f1' },
            { label: 'Edges', value: stats.totalEdges, color: '#3b82f6' },
            { label: 'Tasks', value: stats.taskNodes, color: '#3b82f6' },
            { label: 'Approvals', value: stats.approvalNodes, color: '#f59e0b' },
            { label: 'Est. Time', value: stats.estimatedDuration, color: '#22c55e' },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0 10px', borderRight: i < arr.length - 1 ? `1px solid ${statBorder}` : 'none' }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 10, color: statMuted }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onInit={onInit}
        onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        nodeTypes={nodeTypes} fitView deleteKeyCode="Delete"
        defaultEdgeOptions={{ animated: true, style: { stroke: '#6366f1', strokeWidth: 2.5 } }}
        style={{ background: bg }}
      >
        <Background color={darkMode ? '#1e293b' : '#e2e8f0'} gap={24} size={1} />
        <Controls style={{ background: statBg, border: `1px solid ${statBorder}`, borderRadius: 10 }} />
        <MiniMap
          nodeColor={(n) => {
            const colors: Record<string, string> = { startNode: '#22c55e', taskNode: '#3b82f6', approvalNode: '#f59e0b', automatedNode: '#8b5cf6', conditionNode: '#ec4899', endNode: '#ef4444' };
            return colors[n.type ?? ''] ?? '#94a3b8';
          }}
          style={{ background: statBg, border: `1px solid ${statBorder}`, borderRadius: 10 }}
        />
      </ReactFlow>
    </div>
  );
}
