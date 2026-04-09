# QA Rubric

## Validation levels

1. **Core scenario pass**
   - Main acceptance criteria flow works end-to-end.
2. **Edge and negative coverage**
   - Invalid input, empty states, error handling, retries/timeouts as relevant.
3. **Non-functional checks**
   - Performance sanity, UI state consistency, accessibility basics where applicable.
4. **Compatibility checks**
   - Existing adjacent flows unaffected.

## Mandatory browser validation

Static code analysis alone is insufficient for UI tasks. The tester **must** launch the dev server and validate in a real browser when the task includes any of the following: new routes/pages, navigation flows, form submissions, toasts/notifications, conditional redirects, or state-dependent guards.

### Protocol

1. Start the dev server (`npm run dev` or project-equivalent).
2. Walk through every acceptance criterion in the browser — do not rely solely on code traces.
3. Execute the happy path end-to-end and confirm the final observable state (URL, UI, toasts).
4. Exercise at least one negative/error path per route that involves navigation or state transitions.
5. Record each step with the observed result (URL, visible text, component state) in the handoff under **"Browser validation steps"**.

### Why

Bugs caused by React render-cycle ordering (e.g. state update triggering a guard re-render before an imperative `navigate()` takes effect), race conditions between async operations and UI state, and side-effect timing cannot be caught by reading code alone. Browser validation is the only reliable way to verify navigation and state-dependent flows.

### When browser validation can be skipped

- Pure backend/library changes with no UI surface.
- Config-only or dependency-only changes.
- If skipped, the handoff must state the reason under "Not run and why". Skipping browser validation for a UI task results in an automatic `PASS_WITH_RISKS` ceiling on the verdict.

## Required evidence

- Test commands executed:
- Browser validation steps (URL, action, expected, actual):
- Manual scenario steps and outcome:
- Failed checks with reproducible steps:

## Verdict rules

- `PASS`: all acceptance criteria verified, browser validation completed for UI tasks, no unresolved high-risk issues.
- `PASS_WITH_RISKS`: criteria pass but medium/low known risks remain, or browser validation was justifiably skipped.
- `FAIL`: criteria not met or unresolved high/critical issues.

## Release note input

- User-visible behavior changes:
- Migration/config impacts:
- Rollback considerations:
