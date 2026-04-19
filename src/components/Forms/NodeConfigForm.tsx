import { useEffect, useState } from 'react';
import { useWorkflowStore } from '../../hooks/useWorkflow';
import { automations } from '../../api/mockApi';
import type { WorkflowNodeData, TaskNodeData, ApprovalNodeData, AutomatedNodeData, StartNodeData, EndNodeData, ConditionNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: WorkflowNodeData; }

export function NodeConfigForm({ nodeId, data }: Props) {
  const { updateNodeData, deleteNode, setSelectedNodeId, darkMode } = useWorkflowStore();
  const [localData, setLocalData] = useState<WorkflowNodeData>(data);

  useEffect(() => { setLocalData(data); }, [nodeId, data]);

  const update = (field: string, value: string) => {
    const updated = { ...localData, [field]: value } as WorkflowNodeData;
    setLocalData(updated);
    updateNodeData(nodeId, { [field]: value });
  };

  const bg = darkMode ? '#1e293b' : '#ffffff';
  const text = darkMode ? '#f1f5f9' : '#0f172a';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';
  const inputBorder = darkMode ? '#334155' : '#e2e8f0';
  const inputStyle: React.CSSProperties = { width: '100%', background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: '7px 10px', fontSize: 13, color: text, outline: 'none', boxSizing: 'border-box' };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.06em', marginBottom: 5 }}>{label.toUpperCase()}</label>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Field label="Label">
        <input style={inputStyle} value={localData.label} onChange={(e) => update('label', e.target.value)} />
      </Field>
      <Field label="Title">
        <input style={inputStyle} value={localData.title} onChange={(e) => update('title', e.target.value)} />
      </Field>

      {localData.type === 'start' && (
        <>
          <Field label="Trigger Type">
            <select style={inputStyle} value={(localData as StartNodeData).triggerType} onChange={(e) => update('triggerType', e.target.value)}>
              <option value="manual">Manual</option>
              <option value="scheduled">Scheduled</option>
              <option value="event">Event-based</option>
              <option value="webhook">Webhook</option>
            </select>
          </Field>
          <Field label="Description">
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={(localData as StartNodeData).description} onChange={(e) => update('description', e.target.value)} />
          </Field>
        </>
      )}

      {localData.type === 'task' && (
        <>
          <Field label="Description">
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={(localData as TaskNodeData).description} onChange={(e) => update('description', e.target.value)} />
          </Field>
          <Field label="Assignee">
            <input style={inputStyle} placeholder="e.g. HR Team" value={(localData as TaskNodeData).assignee} onChange={(e) => update('assignee', e.target.value)} />
          </Field>
          <Field label="Priority">
            <select style={inputStyle} value={(localData as TaskNodeData).priority} onChange={(e) => update('priority', e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
          <Field label="Due Date">
            <input type="date" style={inputStyle} value={(localData as TaskNodeData).dueDate} onChange={(e) => update('dueDate', e.target.value)} />
          </Field>
        </>
      )}

      {localData.type === 'approval' && (
        <>
          <Field label="Description">
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={(localData as ApprovalNodeData).description} onChange={(e) => update('description', e.target.value)} />
          </Field>
          <Field label="Approver">
            <input style={inputStyle} placeholder="e.g. HR Manager" value={(localData as ApprovalNodeData).approver} onChange={(e) => update('approver', e.target.value)} />
          </Field>
          <Field label="Approval Type">
            <select style={inputStyle} value={(localData as ApprovalNodeData).approvalType} onChange={(e) => update('approvalType', e.target.value)}>
              <option value="single">Single Approver</option>
              <option value="multiple">All Must Approve</option>
              <option value="any">Any Can Approve</option>
            </select>
          </Field>
          <Field label="Deadline">
            <input type="date" style={inputStyle} value={(localData as ApprovalNodeData).deadline} onChange={(e) => update('deadline', e.target.value)} />
          </Field>
        </>
      )}

      {localData.type === 'automated' && (
        <>
          <Field label="Automation Action">
            <select style={inputStyle} value={(localData as AutomatedNodeData).automationId} onChange={(e) => update('automationId', e.target.value)}>
              <option value="">-- Select Action --</option>
              {automations.map((a) => (
                <option key={a.id} value={a.id}>[{a.category}] {a.label}</option>
              ))}
            </select>
          </Field>
          {(localData as AutomatedNodeData).automationId && automations.find((a) => a.id === (localData as AutomatedNodeData).automationId)?.params.map((param) => (
            <Field key={param} label={param}>
              <input
                style={inputStyle}
                placeholder={`Enter ${param}`}
                value={(localData as AutomatedNodeData).params?.[param] ?? ''}
                onChange={(e) => updateNodeData(nodeId, { params: { ...(localData as AutomatedNodeData).params, [param]: e.target.value } } as Partial<WorkflowNodeData>)}
              />
            </Field>
          ))}
        </>
      )}

      {localData.type === 'condition' && (
        <>
          <Field label="Field to Check">
            <input style={inputStyle} placeholder="e.g. leave_days" value={(localData as ConditionNodeData).conditionField} onChange={(e) => update('conditionField', e.target.value)} />
          </Field>
          <Field label="Operator">
            <select style={inputStyle} value={(localData as ConditionNodeData).conditionOperator} onChange={(e) => update('conditionOperator', e.target.value)}>
              <option value="equals">Equals</option>
              <option value="not_equals">Not Equals</option>
              <option value="contains">Contains</option>
              <option value="greater_than">Greater Than</option>
            </select>
          </Field>
          <Field label="Value">
            <input style={inputStyle} placeholder="e.g. 10" value={(localData as ConditionNodeData).conditionValue} onChange={(e) => update('conditionValue', e.target.value)} />
          </Field>
        </>
      )}

      {localData.type === 'end' && (
        <>
          <Field label="Description">
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={(localData as EndNodeData).description} onChange={(e) => update('description', e.target.value)} />
          </Field>
          <Field label="End Status">
            <select style={inputStyle} value={(localData as EndNodeData).status} onChange={(e) => update('status', e.target.value)}>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>
        </>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: `1px solid ${inputBorder}` }}>
        <button
          onClick={() => { deleteNode(nodeId); setSelectedNodeId(null); }}
          style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}
