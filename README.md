# FlowHR — Visual Workflow Designer

A production-quality HR workflow builder. Design, configure, simulate, and export HR workflows visually.

---

## What makes this different

Most workflow builders just render nodes. FlowHR adds:

- **Dark mode** — toggle in the simulation panel
- **Live stats bar** — real-time node count, edge count, and estimated duration as you build
- **Export / Import JSON** — save your workflow to a file and reload it anytime
- **Condition nodes** — branch logic (if/else) for complex workflows
- **4 workflow templates** — Onboarding, Leave Approval, Document Verification, Employee Exit
- **Validation warnings** — not just errors, but soft warnings for missing assignees/approvers
- **Priority badges** on task nodes — visual priority (high/medium/low) visible on the canvas
- **Estimated duration** — automatically calculated based on node types

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Styling | Inline styles + Tailwind CSS |
| Flow Canvas | React Flow v11 |
| State | Zustand |

---

## Getting Started

```bash
git clone https://github.com/aswinikumaravel/hr-workflow-designer.git
cd hr-workflow-designer
npm install
npm run dev
```

Open http://localhost:5173

---

## Project Structure

```
src/
├── api/
│   └── mockApi.ts          # Automations catalog, validation, simulation, export logic
├── components/
│   ├── Canvas/
│   │   ├── Canvas.tsx       # React Flow canvas, drag-drop, stats bar overlay
│   │   └── ConfigPanel.tsx  # Right panel, shows node config form when node selected
│   ├── Forms/
│   │   └── NodeConfigForm.tsx  # Dynamic form per node type (6 types)
│   ├── Nodes/
│   │   └── WorkflowNodes.tsx   # Reusable styled node component for all types
│   └── Sidebar/
│       ├── Sidebar.tsx          # Node palette, templates, import/export
│       └── SimulationPanel.tsx  # Run simulation, view log, dark mode toggle
├── hooks/
│   └── useWorkflow.ts       # Zustand store — all state and actions
├── pages/
│   └── Home.tsx             # Root page
└── types/
    └── workflow.ts          # All TypeScript types (discriminated union)
```

---

## Node Types

| Node | Purpose | Key Fields |
|---|---|---|
| Start | Entry point | Trigger type (manual/scheduled/event/webhook) |
| Task | Manual work item | Assignee, priority, due date |
| Approval | Human sign-off | Approver, type (single/all/any), deadline |
| Automated | System action | Action (8 available), configurable params |
| Condition | Branch logic | Field, operator (equals/contains/etc), value |
| End | Terminal node | Status (success/failure/cancelled) |

---

## Architecture Notes

**State** — All workflow state lives in a single Zustand store (`useWorkflow.ts`). Components subscribe to only what they need, preventing unnecessary re-renders.

**Discriminated union types** — `WorkflowNodeData` is a TypeScript discriminated union. Node-specific fields are only accessible after narrowing with `data.type`, making the code type-safe and self-documenting.

**Simulation engine** — `simulateWorkflow()` uses BFS traversal over the adjacency map built from edges. This correctly handles future branching (condition nodes) without recursion.

**Validation** — Two-tier: errors block simulation, warnings still allow it but surface issues like missing assignees.

**Export** — `exportToJson()` serializes the full graph to a `.workflow.json` file. `importFromJson()` parses and validates the structure before loading.

---

## What I'd Add With More Time

- Backend (Node.js + PostgreSQL) to persist workflows per user
- Real integrations (email via SendGrid, Slack via webhook, calendar via Google API)
- Undo/redo stack using immer patches
- Collaborative editing with WebSockets
- Workflow version history
- Unit tests for validation and simulation logic (Jest + Testing Library)

---

## Author

Built for HR automation case study. Clean architecture, full TypeScript, zero copy-paste.
