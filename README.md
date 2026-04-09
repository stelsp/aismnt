# Agent Kit v2

Portable single-folder toolkit for multi-agent pipelines in Cursor.

## Structure

```
agent-kit/
├── rules/                       Cursor rules (.mdc)
│   ├── codestyle-strict.mdc     Project codestyle enforcement
│   ├── i18n-strict.mdc          i18n compliance enforcement
│   └── orchestrator.mdc         Pipeline orchestration protocol
├── team/                        Workflow docs and templates
│   ├── prompts/                 Role-specific prompt templates
│   │   ├── plan.md              Planner prompt
│   │   ├── implement.md         Implementer prompt (+ fix cycle)
│   │   ├── review.md            Reviewer prompt
│   │   └── qa.md                Tester prompt
│   ├── workflow.md              Roles, stages, FAIL handling
│   ├── task-template.md         Task input template
│   ├── review-rubric.md         Review severity model and checklist
│   ├── qa-rubric.md             QA validation levels and verdict rules
│   └── definition-of-done.md    DoD checklist
├── scripts/                     CLI utilities
│   ├── agent-orchestrator.mjs   bootstrap / status / validate
│   └── install-rules.mjs        Copy rules to .cursor/rules/
└── runs/                        Pipeline run artifacts (gitignored)
    └── <RUN-ID>/
        ├── task.md              Task copy
        ├── status.json          Pipeline state
        └── handoffs/            Stage outputs
            ├── plan.md
            ├── implement.md
            ├── review.md
            └── qa.md
```

## Quick start

### 1. Bootstrap

```bash
npm run agent:bootstrap -- --run-id TASK-001
```

Creates `agent-kit/runs/TASK-001/` with task template, status file. Installs Cursor rules.

### 2. Fill in the task

Open `agent-kit/runs/TASK-001/task.md` — fill in goal, scope, constraints, acceptance criteria.

### 3. Run

Open a new chat and say:

> Запусти agent-kit pipeline для TASK-001

The orchestrator launches isolated subagents: plan → implement → review → qa.
FAIL cycles are handled automatically. Handoffs are saved to `runs/TASK-001/handoffs/`.

### 4. Validate

```bash
npm run agent:validate -- --run-id TASK-001
```

## CLI

| Command | Description |
|---------|-------------|
| `npm run agent:bootstrap -- [--task-file <path>] [--run-id <id>]` | Create a run (uses template if no --task-file) |
| `npm run agent:status -- --run-id <id>` | Show pipeline state |
| `npm run agent:validate -- --run-id <id>` | Check Definition of Done |
| `npm run agent:rules:install` | Copy rules to `.cursor/rules/` |

## Pipeline

### 4 stages, isolated subagents

Each stage runs in a fresh Task subagent — no conversation history from other stages.

| Stage | Role | Input | Output | Readonly |
|-------|------|-------|--------|----------|
| plan | planner | task | step plan + test plan | yes |
| implement | implementer | task, plan | code changes + self-check | no |
| review | reviewer | task, implement handoff, rubric | findings + verdict | yes |
| qa | tester | task, implement handoff, qa rubric | test report + verdict | yes |

### Isolation

- Reviewer does NOT see the plan — reviews from code and task criteria only.
- Tester does NOT see plan or review — validates against acceptance criteria only.
- Each subagent gets only the files listed in its input column.

### FAIL cycles

Review or QA returns `FAIL` → orchestrator re-runs implement with findings → re-runs the failing stage. Max 2 cycles, then escalates.

## Porting

1. Copy `agent-kit/` folder to another project.
2. Add scripts to `package.json`:

```json
{
  "scripts": {
    "agent:bootstrap": "node agent-kit/scripts/agent-orchestrator.mjs bootstrap",
    "agent:status": "node agent-kit/scripts/agent-orchestrator.mjs status",
    "agent:validate": "node agent-kit/scripts/agent-orchestrator.mjs validate",
    "agent:rules:install": "node agent-kit/scripts/install-rules.mjs"
  }
}
```

3. `npm run agent:bootstrap` — installs rules automatically.
