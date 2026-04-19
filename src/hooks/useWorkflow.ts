import { create } from 'zustand';
import {
  addEdge, applyNodeChanges, applyEdgeChanges,
  type Node, type Edge, type Connection, type NodeChange, type EdgeChange,
} from 'reactflow';
import type { WorkflowNodeData } from '../types/workflow';
import { simulateWorkflow, validateWorkflow, exportWorkflow, getWorkflowStats } from '../api/mockApi';
import type { SimulationStep, ValidationResult, WorkflowStats, ExportedWorkflow } from '../types/workflow';

interface WorkflowState {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  simulationSteps: SimulationStep[];
  isSimulating: boolean;
  validation: ValidationResult | null;
  darkMode: boolean;
  workflowName: string;
  stats: WorkflowStats | null;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<WorkflowNodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  runSimulation: () => void;
  clearSimulation: () => void;
  loadTemplate: (template: 'onboarding' | 'leave' | 'document' | 'exit') => void;
  toggleDarkMode: () => void;
  setWorkflowName: (name: string) => void;
  exportToJson: () => void;
  importFromJson: (json: string) => void;
  updateStats: () => void;
}

const makeOnboarding = () => ({
  nodes: [
    { id: '1', type: 'startNode', position: { x: 300, y: 40 }, data: { type: 'start' as const, label: 'Onboarding Start', title: 'Onboarding Start', triggerType: 'event' as const, description: 'New hire accepted offer' } },
    { id: '2', type: 'taskNode', position: { x: 300, y: 160 }, data: { type: 'task' as const, label: 'Collect Documents', title: 'Collect Documents', description: 'Gather ID, certificates, and offer letter.', assignee: 'HR Team', dueDate: '2024-02-01', priority: 'high' as const } },
    { id: '3', type: 'approvalNode', position: { x: 300, y: 280 }, data: { type: 'approval' as const, label: 'Manager Approval', title: 'Manager Approval', approver: 'Hiring Manager', approvalType: 'single' as const, description: 'Manager reviews and approves onboarding.', deadline: '2024-02-03' } },
    { id: '4', type: 'automatedNode', position: { x: 300, y: 400 }, data: { type: 'automated' as const, label: 'Send Welcome Email', title: 'Send Welcome Email', automationId: 'send_email', params: { to: 'employee@company.com', subject: 'Welcome aboard!', body: 'We are excited to have you.' } } },
    { id: '5', type: 'automatedNode', position: { x: 300, y: 510 }, data: { type: 'automated' as const, label: 'Create System Account', title: 'Create System Account', automationId: 'create_account', params: { username: '', role: 'employee', department: '' } } },
    { id: '6', type: 'endNode', position: { x: 300, y: 620 }, data: { type: 'end' as const, label: 'Onboarding Complete', title: 'Onboarding Complete', description: 'Employee successfully onboarded.', status: 'success' as const } },
  ] as Node<WorkflowNodeData>[],
  edges: [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3', animated: true },
    { id: 'e3-4', source: '3', target: '4', animated: true },
    { id: 'e4-5', source: '4', target: '5', animated: true },
    { id: 'e5-6', source: '5', target: '6', animated: true },
  ] as Edge[],
});

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  ...makeOnboarding(),
  selectedNodeId: null,
  simulationSteps: [],
  isSimulating: false,
  validation: null,
  darkMode: false,
  workflowName: 'Employee Onboarding',
  stats: null,

  onNodesChange: (changes) => {
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) as Node<WorkflowNodeData>[] }));
    get().updateStats();
  },
  onEdgesChange: (changes) => {
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }));
    get().updateStats();
  },
  onConnect: (connection) => {
    set((state) => ({ edges: addEdge({ ...connection, animated: true }, state.edges) }));
    get().updateStats();
  },
  addNode: (node) => {
    set((state) => ({ nodes: [...state.nodes, node] }));
    get().updateStats();
  },
  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n),
    })),
  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
    get().updateStats();
  },
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  runSimulation: () => {
    const { nodes, edges } = get();
    const validation = validateWorkflow(nodes, edges);
    if (!validation.isValid) { set({ validation, simulationSteps: [] }); return; }
    set({ isSimulating: true, validation, simulationSteps: [] });
    setTimeout(() => {
      const steps = simulateWorkflow(nodes, edges);
      set({ simulationSteps: steps, isSimulating: false });
    }, 1000);
  },
  clearSimulation: () => set({ simulationSteps: [], validation: null }),
  loadTemplate: (template) => {
    const templates = {
      onboarding: { name: 'Employee Onboarding', ...makeOnboarding() },
      leave: {
        name: 'Leave Approval',
        nodes: [
          { id: '1', type: 'startNode', position: { x: 300, y: 40 }, data: { type: 'start' as const, label: 'Leave Request', title: 'Leave Request', triggerType: 'manual' as const, description: 'Employee submits leave request' } },
          { id: '2', type: 'taskNode', position: { x: 300, y: 160 }, data: { type: 'task' as const, label: 'Fill Leave Form', title: 'Fill Leave Form', description: 'Employee fills out leave application.', assignee: 'Employee', dueDate: '', priority: 'medium' as const } },
          { id: '3', type: 'approvalNode', position: { x: 300, y: 280 }, data: { type: 'approval' as const, label: 'Manager Approval', title: 'Manager Approval', approver: 'Direct Manager', approvalType: 'single' as const, description: 'Manager reviews leave dates.', deadline: '' } },
          { id: '4', type: 'approvalNode', position: { x: 300, y: 400 }, data: { type: 'approval' as const, label: 'HR Sign-off', title: 'HR Sign-off', approver: 'HR Manager', approvalType: 'single' as const, description: 'HR confirms balance availability.', deadline: '' } },
          { id: '5', type: 'automatedNode', position: { x: 300, y: 510 }, data: { type: 'automated' as const, label: 'Update HRMS', title: 'Update HRMS', automationId: 'update_hrms', params: { employeeId: '', field: 'leave_balance', value: '' } } },
          { id: '6', type: 'endNode', position: { x: 300, y: 620 }, data: { type: 'end' as const, label: 'Leave Approved', title: 'Leave Approved', description: 'Leave successfully processed.', status: 'success' as const } },
        ] as Node<WorkflowNodeData>[],
        edges: [
          { id: 'e1-2', source: '1', target: '2', animated: true }, { id: 'e2-3', source: '2', target: '3', animated: true },
          { id: 'e3-4', source: '3', target: '4', animated: true }, { id: 'e4-5', source: '4', target: '5', animated: true },
          { id: 'e5-6', source: '5', target: '6', animated: true },
        ] as Edge[],
      },
      document: {
        name: 'Document Verification',
        nodes: [
          { id: '1', type: 'startNode', position: { x: 300, y: 40 }, data: { type: 'start' as const, label: 'Doc Submission', title: 'Document Submission', triggerType: 'event' as const, description: 'Employee uploads documents' } },
          { id: '2', type: 'taskNode', position: { x: 300, y: 160 }, data: { type: 'task' as const, label: 'Upload Documents', title: 'Upload Documents', description: 'Employee uploads required documents.', assignee: 'Employee', dueDate: '', priority: 'high' as const } },
          { id: '3', type: 'automatedNode', position: { x: 300, y: 280 }, data: { type: 'automated' as const, label: 'Generate Report', title: 'Generate Verification Report', automationId: 'generate_doc', params: { template: 'verification_report', recipient: 'hr@company.com' } } },
          { id: '4', type: 'approvalNode', position: { x: 300, y: 400 }, data: { type: 'approval' as const, label: 'Admin Sign-off', title: 'Admin Sign-off', approver: 'Admin', approvalType: 'single' as const, description: 'Admin verifies all documents.', deadline: '' } },
          { id: '5', type: 'endNode', position: { x: 300, y: 510 }, data: { type: 'end' as const, label: 'Verified', title: 'Documents Verified', description: 'All documents verified successfully.', status: 'success' as const } },
        ] as Node<WorkflowNodeData>[],
        edges: [
          { id: 'e1-2', source: '1', target: '2', animated: true }, { id: 'e2-3', source: '2', target: '3', animated: true },
          { id: 'e3-4', source: '3', target: '4', animated: true }, { id: 'e4-5', source: '4', target: '5', animated: true },
        ] as Edge[],
      },
      exit: {
        name: 'Employee Exit Process',
        nodes: [
          { id: '1', type: 'startNode', position: { x: 300, y: 40 }, data: { type: 'start' as const, label: 'Resignation Received', title: 'Resignation Received', triggerType: 'event' as const, description: 'Employee submits resignation' } },
          { id: '2', type: 'taskNode', position: { x: 300, y: 160 }, data: { type: 'task' as const, label: 'Exit Interview', title: 'Schedule Exit Interview', description: 'HR schedules exit interview with employee.', assignee: 'HR Team', dueDate: '', priority: 'medium' as const } },
          { id: '3', type: 'taskNode', position: { x: 300, y: 280 }, data: { type: 'task' as const, label: 'Asset Recovery', title: 'Asset Recovery', description: 'Collect company laptop, ID, and access cards.', assignee: 'IT Team', dueDate: '', priority: 'high' as const } },
          { id: '4', type: 'automatedNode', position: { x: 300, y: 400 }, data: { type: 'automated' as const, label: 'Revoke Access', title: 'Revoke System Access', automationId: 'update_hrms', params: { employeeId: '', field: 'status', value: 'inactive' } } },
          { id: '5', type: 'automatedNode', position: { x: 300, y: 510 }, data: { type: 'automated' as const, label: 'Final Settlement', title: 'Process Final Settlement', automationId: 'generate_doc', params: { template: 'final_settlement', recipient: '' } } },
          { id: '6', type: 'endNode', position: { x: 300, y: 620 }, data: { type: 'end' as const, label: 'Exit Complete', title: 'Exit Process Complete', description: 'Employee offboarding finished.', status: 'success' as const } },
        ] as Node<WorkflowNodeData>[],
        edges: [
          { id: 'e1-2', source: '1', target: '2', animated: true }, { id: 'e2-3', source: '2', target: '3', animated: true },
          { id: 'e3-4', source: '3', target: '4', animated: true }, { id: 'e4-5', source: '4', target: '5', animated: true },
          { id: 'e5-6', source: '5', target: '6', animated: true },
        ] as Edge[],
      },
    };
    const t = templates[template];
    set({ nodes: t.nodes, edges: t.edges, workflowName: t.name, selectedNodeId: null, simulationSteps: [], validation: null });
    get().updateStats();
  },
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setWorkflowName: (name) => set({ workflowName: name }),
  exportToJson: () => {
    const { nodes, edges, workflowName } = get();
    const json = exportWorkflow(nodes, edges, workflowName);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/\s+/g, '-')}.workflow.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  importFromJson: (json) => {
    try {
      const data = JSON.parse(json) as ExportedWorkflow;
      if (!data.nodes || !data.edges) throw new Error('Invalid workflow file');
      set({
        nodes: data.nodes as Node<WorkflowNodeData>[],
        edges: data.edges as Edge[],
        workflowName: data.name || 'Imported Workflow',
        selectedNodeId: null, simulationSteps: [], validation: null,
      });
      get().updateStats();
    } catch {
      alert('Invalid workflow JSON file. Please check the file and try again.');
    }
  },
  updateStats: () => {
    const { nodes, edges } = get();
    set({ stats: getWorkflowStats(nodes, edges) });
  },
}));
