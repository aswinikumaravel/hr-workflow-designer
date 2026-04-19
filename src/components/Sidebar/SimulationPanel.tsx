import { useWorkflowStore } from '../../hooks/useWorkflow';
import type { NodeType, SimulationStep } from '../../types/workflow';

const nodeColors: Record<NodeType, string> = {
  start: '#22c55e', task: '#3b82f6', approval: '#f59e0b',
  automated: '#8b5cf6', condition: '#ec4899', end: '#ef4444',
};
const nodeIcons: Record<NodeType, string> = {
  start: '▶', task: '⊞', approval: '✦', automated: '⚡', condition: '◆', end: '■',
};

function StepCard({ step, darkMode }: { step: SimulationStep; darkMode: boolean }) {
  const color = nodeColors[step.nodeType];
  const icon = nodeIcons[step.nodeType];
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const mutedColor = darkMode ? '#94a3b8' : '#64748b';
  const lineBg = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color }}>
          {icon}
        </div>
        <div style={{ width: 1, flex: 1, background: lineBg, minHeight: 12, marginTop: 3 }} />
      </div>
      <div style={{ paddingBottom: 14, flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: mutedColor, fontWeight: 600 }}>Step {step.step}</span>
          <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: `${color}22`, color, fontWeight: 700, border: `1px solid ${color}44` }}>
            {step.nodeType.toUpperCase()}
          </span>
          {step.duration > 0 && (
            <span style={{ fontSize: 10, color: mutedColor }}>~{step.duration}m</span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: textColor }}>{step.title}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: mutedColor, lineHeight: 1.4 }}>{step.detail}</p>
      </div>
    </div>
  );
}

export function SimulationPanel() {
  const { runSimulation, clearSimulation, simulationSteps, isSimulating, validation, darkMode, toggleDarkMode, stats } = useWorkflowStore();

  const bg = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#f1f5f9';
  const text = darkMode ? '#f1f5f9' : '#0f172a';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const surface = darkMode ? '#0f172a' : '#f8fafc';

  const totalTime = simulationSteps.reduce((s, st) => s + st.duration, 0);

  return (
    <div style={{ width: 272, background: bg, borderLeft: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: text }}>Simulation</p>
          <button
            onClick={toggleDarkMode}
            title="Toggle dark mode"
            style={{ padding: '4px 10px', borderRadius: 7, border: `1px solid ${border}`, background: surface, color: text, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
          >
            {darkMode ? '☀ Light' : '☾ Dark'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={runSimulation} disabled={isSimulating}
            style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: isSimulating ? '#818cf8' : '#6366f1', color: 'white', fontSize: 13, fontWeight: 700, cursor: isSimulating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {isSimulating ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Running…</> : '▶ Run Workflow'}
          </button>
          {(simulationSteps.length > 0 || validation) && (
            <button onClick={clearSimulation} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${border}`, background: surface, color: muted, fontSize: 13, cursor: 'pointer' }}>✕</button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {validation && (
          <div>
            {!validation.isValid && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#dc2626' }}>Cannot run — fix these:</p>
                {validation.errors.map((e, i) => (
                  <p key={i} style={{ margin: '3px 0', fontSize: 11, color: '#dc2626' }}>• {e}</p>
                ))}
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#d97706' }}>Warnings:</p>
                {validation.warnings.map((w, i) => (
                  <p key={i} style={{ margin: '3px 0', fontSize: 11, color: '#d97706' }}>⚠ {w}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {simulationSteps.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: muted, letterSpacing: '0.1em' }}>EXECUTION LOG</p>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#dcfce7', color: '#16a34a', fontWeight: 700 }}>{simulationSteps.length} steps</span>
                {totalTime > 0 && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>~{totalTime}m</span>}
              </div>
            </div>
            {simulationSteps.map((step) => <StepCard key={step.step} step={step} darkMode={darkMode} />)}
            <div style={{ marginTop: 4, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#16a34a' }}>✓ Workflow completed successfully</p>
              {stats && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#4ade80' }}>Estimated run time: {stats.estimatedDuration}</p>}
            </div>
          </div>
        )}

        {simulationSteps.length === 0 && !validation && (
          <div style={{ textAlign: 'center', paddingTop: 40, color: muted }}>
            <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>▶</div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Run your workflow</p>
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>See the step-by-step execution</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
