# Definition of Done

A task is done only when all items are satisfied.

## Functional

- [ ] All acceptance criteria from the task are met.
- [ ] No unresolved `critical` or `high` findings from review.

## Quality

- [ ] Reviewer verdict is `PASS` or `PASS_WITH_RISKS`.
- [ ] Tester verdict is `PASS` or explicitly accepted `PASS_WITH_RISKS`.
- [ ] For UI tasks: browser validation of happy path and at least one error path completed.
- [ ] Relevant tests/checks were executed or justified when skipped.

## Project standards

- [ ] TypeScript, architecture, and naming conventions are respected.
- [ ] i18n constraints are respected (no hardcoded UI strings, locale updates as needed).
- [ ] No accidental scope creep outside agreed scope.

## Traceability

- [ ] Every stage (plan, implement, review, qa) produced a handoff file.
- [ ] Changed files are listed in the implementation handoff.
- [ ] Open follow-ups are captured as explicit next tasks.
