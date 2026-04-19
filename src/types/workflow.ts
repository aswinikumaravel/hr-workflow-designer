export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'condition' | 'end';

export interface TaskNodeData {
  type: 'task';
  label: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ApprovalNodeData {
  type: 'approval';
  label: string;
  title: string;
  approver: string;
  approvalType: 'single' | 'multiple' | 'any';
  description: string;
  deadline: string;
}

export interface AutomatedNodeData {
  type: 'automated';
  label: string;
  title: string;
  automationId: string;
  params: Record<string, string>;
}

export interface StartNodeData {
  type: 'start';
  label: string;
  title: string;
  triggerType: 'manual' | 'scheduled' | 'event' | 'webhook';
  description: string;
}

export interface ConditionNodeData {
  type: 'condition';
  label: string;
  title: string;
  conditionField: string;
  conditionOperator: 'equals' | 'not_equals' | 'contains' | 'greater_than';
  conditionValue: string;
}

export interface EndNodeData {
  type: 'end';
  label: string;
  title: string;
  description: string;
  status: 'success' | 'failure' | 'cancelled';
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | ConditionNodeData
  | EndNodeData;

export interface SimulationStep {
  step: number;
  nodeType: NodeType;
  title: string;
  status: 'completed' | 'pending' | 'skipped';
  detail: string;
  duration: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface Automation {
  id: string;
  label: string;
  params: string[];
  category: string;
}

export interface WorkflowStats {
  totalNodes: number;
  taskNodes: number;
  approvalNodes: number;
  automatedNodes: number;
  totalEdges: number;
  estimatedDuration: string;
}

export interface ExportedWorkflow {
  version: string;
  name: string;
  exportedAt: string;
  nodes: unknown[];
  edges: unknown[];
}
