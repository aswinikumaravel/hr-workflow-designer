import type { Automation, SimulationStep, ValidationResult, WorkflowStats } from '../types/workflow';
import type { Node, Edge } from 'reactflow';
import type { WorkflowNodeData, TaskNodeData, ApprovalNodeData, AutomatedNodeData, ConditionNodeData, StartNodeData } from '../types/workflow';

export const automations: Automation[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'], category: 'Communication' },
  { id: 'send_sms', label: 'Send SMS', params: ['to', 'message'], category: 'Communication' },
  { id: 'notify_slack', label: 'Notify Slack', params: ['channel', 'message'], category: 'Communication' },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'], category: 'Documents' },
  { id: 'create_ticket', label: 'Create Ticket', params: ['project', 'summary', 'priority'], category: 'Tracking' },
  { id: 'update_hrms', label: 'Update HRMS', params: ['employeeId', 'field', 'value'], category: 'HR Systems' },
  { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['attendees', 'title', 'duration'], category: 'Calendar' },
  { id: 'create_account', label: 'Create System Account', params: ['username', 'role', 'department'], category: 'IT' },
];

export function getAutomationById(id: string): Automation | undefined {
  return automations.find((a) => a.id === id);
}

export function validateWorkflow(nodes: Node<WorkflowNodeData>[], edges: Edge[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const hasStart = nodes.some((n) => n.data.type === 'start');
  const hasEnd = nodes.some((n) => n.data.type === 'end');

  if (!hasStart) errors.push('Workflow must have a Start node.');
  if (!hasEnd) errors.push('Workflow must have an End node.');
  if (nodes.length < 2) errors.push('Workflow must have at least 2 nodes.');

  const connectedNodeIds = new Set<string>();
  edges.forEach((e) => { connectedNodeIds.add(e.source); connectedNodeIds.add(e.target); });

  if (edges.length === 0 && nodes.length > 1) errors.push('No connections found. Connect your nodes.');

  nodes.forEach((n) => {
    if (nodes.length > 1 && !connectedNodeIds.has(n.id)) {
      errors.push(`"${n.data.label}" is not connected to any other node.`);
    }
    if (n.data.type === 'task' && !(n.data as TaskNodeData).assignee) {
      warnings.push(`Task "${n.data.label}" has no assignee set.`);
    }
    if (n.data.type === 'approval' && !(n.data as ApprovalNodeData).approver) {
      warnings.push(`Approval "${n.data.label}" has no approver set.`);
    }
    if (n.data.type === 'automated' && !(n.data as AutomatedNodeData).automationId) {
      warnings.push(`Automation node "${n.data.label}" has no action selected.`);
    }
  });

  const startNodes = nodes.filter((n) => n.data.type === 'start');
  if (startNodes.length > 1) warnings.push('Multiple Start nodes detected. Only one is recommended.');

  return { isValid: errors.length === 0, errors, warnings };
}

export function getWorkflowStats(nodes: Node<WorkflowNodeData>[], edges: Edge[]): WorkflowStats {
  const taskNodes = nodes.filter((n) => n.data.type === 'task').length;
  const approvalNodes = nodes.filter((n) => n.data.type === 'approval').length;
  const automatedNodes = nodes.filter((n) => n.data.type === 'automated').length;
  const minutes = taskNodes * 30 + approvalNodes * 60 + automatedNodes * 2;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const estimatedDuration = hours > 0 ? `~${hours}h ${mins}m` : `~${mins}m`;
  return { totalNodes: nodes.length, taskNodes, approvalNodes, automatedNodes, totalEdges: edges.length, estimatedDuration };
}

export function simulateWorkflow(nodes: Node<WorkflowNodeData>[], edges: Edge[]): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const adjMap: Record<string, string[]> = {};
  edges.forEach((e) => { if (!adjMap[e.source]) adjMap[e.source] = []; adjMap[e.source].push(e.target); });

  const startNode = nodes.find((n) => n.data.type === 'start');
  if (!startNode) return [];

  const visited = new Set<string>();
  let queue: string[] = [startNode.id];
  let stepNum = 1;

  const durations: Record<string, number> = { start: 0, task: 30, approval: 60, automated: 2, condition: 1, end: 0 };

  while (queue.length > 0) {
    const nextQueue: string[] = [];
    for (const nodeId of queue) {
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) continue;
      const data = node.data;
      let detail = '';

      switch (data.type) {
        case 'start':
          detail = `Trigger type: ${(data as StartNodeData).triggerType}`;
          break;
        case 'task': {
          const t = data as TaskNodeData;
          detail = `Assigned to: ${t.assignee || 'Unassigned'} • Priority: ${t.priority || 'medium'} • Due: ${t.dueDate || 'Not set'}`;
          break;
        }
        case 'approval': {
          const a = data as ApprovalNodeData;
          detail = `Approver: ${a.approver || 'Unassigned'} • Type: ${a.approvalType} • Status: Approved`;
          break;
        }
        case 'automated': {
          const auto = getAutomationById((data as AutomatedNodeData).automationId);
          detail = `Executed: ${auto?.label ?? 'No action selected'} • Status: Success`;
          break;
        }
        case 'condition': {
          const c = data as ConditionNodeData;
          detail = `Evaluated: ${c.conditionField || 'field'} ${c.conditionOperator || 'equals'} "${c.conditionValue || 'value'}" → TRUE`;
          break;
        }
        case 'end':
          detail = `Workflow ended with status: ${(data as import('../types/workflow').EndNodeData).status || 'success'}`;
          break;
      }

      steps.push({
        step: stepNum++,
        nodeType: data.type,
        title: data.title || data.label,
        status: 'completed',
        detail,
        duration: durations[data.type] ?? 0,
      });

      nextQueue.push(...(adjMap[nodeId] ?? []));
    }
    queue = nextQueue;
  }

  return steps;
}

export function exportWorkflow(nodes: Node<WorkflowNodeData>[], edges: Edge[], name: string): string {
  const payload = { version: '1.0.0', name, exportedAt: new Date().toISOString(), nodes, edges };
  return JSON.stringify(payload, null, 2);
}
