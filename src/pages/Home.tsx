import { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { Canvas } from '../components/Canvas/Canvas';
import { ConfigPanel } from '../components/Canvas/ConfigPanel';
import { SimulationPanel } from '../components/Sidebar/SimulationPanel';
import { useWorkflowStore } from '../hooks/useWorkflow';

export default function Home() {
  const { darkMode, updateStats } = useWorkflowStore();

  useEffect(() => { updateStats(); }, []);

  return (
    <ReactFlowProvider>
      <div style={{
        display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: darkMode ? '#0f172a' : '#f8fafc',
      }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Canvas />
        </main>
        <ConfigPanel />
        <SimulationPanel />
      </div>
    </ReactFlowProvider>
  );
}
