# Multi-Agent Workflow

## Roles

- `orchestrator`: owns pipeline transitions, FAIL handling, and final validation. Runs in the user's chat — not a separate stage.
- `planner`: proposes implementation plan and test plan.
- `implementer`: applies code changes according to approved plan. Also handles fixes when review/QA fails.
- `reviewer`: performs independent risk-focused code review.
- `tester`: validates behavior against acceptance criteria.

## Stages

| # | Stage     | Role        | Input                              | Output                | Readonly |
|---|-----------|-------------|------------------------------------|-----------------------|----------|
| 1 | plan      | planner     | task                               | step plan + test plan | yes      |
| 2 | implement | implementer | task, plan                         | code changes + checks | no       |
| 3 | review    | reviewer    | task, implement handoff, rubric    | findings + verdict    | yes      |
| 4 | qa        | tester      | task, implement handoff, qa rubric | test report + verdict | yes      |

## Execution model

Each stage runs as an **isolated subagent** — fresh context, no conversation history from other stages. The orchestrator (user's chat) manages transitions.

## FAIL → fix → re-validation

When review or QA issues a `FAIL` verdict:

1. Orchestrator re-runs **implement** with the failing findings as additional input.
2. After fix, the failing stage (review or QA) re-runs with the updated implementation.
3. Maximum **2 fix cycles** per failing stage. On 3rd FAIL — escalate to user.

Flow examples:
- `review(FAIL)` → `implement(fix)` → `review` → …
- `qa(FAIL)` → `implement(fix)` → `qa` → …

## Independence rules

- Reviewer must NOT see the plan — reviews from code and task criteria only.
- Tester validates against acceptance criteria, not reviewer opinion.
- Implementer receives the plan but not review/QA reasoning from prior runs (only findings to fix).

## Escalation

Escalate when:
- Acceptance criteria conflict with constraints.
- Fix cycle exceeds 2 rounds.
- Blocker affects architecture, security, or release scope.
- Stage returns `BLOCKED` verdict.
