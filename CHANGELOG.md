# Changelog

## v2.0 — Pipeline automation

This release rebuilds `agent-kit` from a manual copy-paste workflow into an automated pipeline orchestrated by Cursor subagents.

### Breaking changes

- Removed commands: `init`, `start`, `orchestrate`, `next`, `advance`, `complete`, `handoff`, `reopen`, `isolate`.
- Removed `team/handoff-template.md` and replaced it with role-specific prompt templates.
- Renamed stages: `planning` → `plan`, `implementation` → `implement`.
- Removed stages: `fix` (the implementer now resolves issues directly on FAIL), `closure` (covered by the `validate` command).

### CLI simplification (671 → 155 lines)

- Reduced the command surface to `bootstrap`, `status`, and `validate`.
- Moved pipeline orchestration from script logic to the AI agent in `rules/orchestrator.mdc`.
- Updated `bootstrap` to use `team/task-template.md` by default when `--task-file` is not provided.
- Removed the macOS-specific `pbcopy` dependency.

### Stage model (4 instead of 6)

| v1 | v2 | Change |
|----|-----|--------|
| planning | plan | Renamed |
| implementation | implement | Renamed; now also handles fix cycles |
| review | review | No change |
| fix | — | Removed; implementer resolves issues on FAIL |
| qa | qa | No change |
| closure | — | Removed; replaced by `validate` |

### Role-specific prompt templates

Added a dedicated `team/prompts/` template for each stage:

- `plan.md` — plan steps table, test-plan table, risks, and open questions.
- `implement.md` — change table, self-check checklist, and findings response section (fix cycle).
- `review.md` — findings table with severity model and strict isolation (no access to the plan).
- `qa.md` — acceptance criteria validation table, browser test steps table, and edge cases.

Each template uses `{{placeholders}}` that are resolved by the orchestrator before launching a subagent.

### Orchestrator rule (`rules/orchestrator.mdc`)

Added a Cursor rule that automates the full pipeline:

- Reads prompt templates and composes stage-specific prompts.
- Launches isolated Task subagents for each stage.
- Parses stage verdicts from handoff files.
- Handles FAIL → re-implement → re-review/re-test loops (maximum 2 cycles).
- Updates `status.json` after each stage transition.
- Runs `validate` at pipeline completion.

### Workflow impact

Before (v1): ~36 manual actions per task (copy prompt, open chat, paste, run, save handoff, run handoff command, repeat across 6 stages).

After (v2): 3 actions — run `bootstrap`, complete `task.md`, send one chat message.

### npm scripts

```
agent:bootstrap      Create a new pipeline run
agent:status         Show pipeline state
agent:validate       Check Definition of Done
agent:rules:install  Copy rules to .cursor/rules/
```
