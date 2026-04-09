# Team Kit

Workflow definitions, rubrics, and role-specific prompt templates.

## Files

| File | Purpose |
|------|---------|
| `workflow.md` | Roles, 4-stage sequence, FAIL handling, escalation |
| `task-template.md` | Input template for new tasks |
| `review-rubric.md` | Review checklist, severity model (critical/high/medium/low) |
| `qa-rubric.md` | QA validation levels, browser validation protocol, verdict rules |
| `definition-of-done.md` | Readiness checklist before closure |

## Prompt templates (`prompts/`)

| File | Role | Stage | Key sections |
|------|------|-------|-------------|
| `plan.md` | planner | plan | Step plan table, test plan table, risks, open questions |
| `implement.md` | implementer | implement | Changes table, self-check checklist, fix responses (fix cycle) |
| `review.md` | reviewer | review | Findings table (severity/file/problem/fix), residual risks |
| `qa.md` | tester | qa | AC validation table, browser steps table, edge cases |

### Placeholders

Prompts use `{{placeholders}}` that the orchestrator replaces with file contents before launching subagents.

| Placeholder | Source | Used by |
|-------------|--------|---------|
| `{{TASK}}` | `runs/<ID>/task.md` | all stages |
| `{{PLAN}}` | `runs/<ID>/handoffs/plan.md` | implement |
| `{{IMPLEMENTATION}}` | `runs/<ID>/handoffs/implement.md` | review, qa |
| `{{FINDINGS}}` | Failing review/QA handoff | implement (fix cycle) |
| `{{REVIEW_RUBRIC}}` | `team/review-rubric.md` | review |
| `{{QA_RUBRIC}}` | `team/qa-rubric.md` | qa |
| `{{OUTPUT_FILE}}` | `runs/<ID>/handoffs/<stage>.md` | all stages |
