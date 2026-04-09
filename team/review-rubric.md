# Review Rubric

## Severity model

- `critical`: production breakage, data loss, security issue, or unrecoverable flow.
- `high`: likely regression, incorrect business logic, broken user path.
- `medium`: maintainability/correctness risk with bounded impact.
- `low`: style/docs/minor cleanup.

## Mandatory review checks

1. **Behavioral correctness**
   - Does change satisfy acceptance criteria exactly?
   - Any logic branch missing for edge cases?
2. **Type/runtime safety**
   - Unsafe assumptions, null/undefined gaps, unhandled promises/errors.
3. **Render-cycle and side-effect ordering**
   - State updates followed by imperative navigation: will a re-render trigger a guard/redirect before the navigation takes effect?
   - Async callbacks that mix state setters with router calls: verify the order survives React batching and reconciliation.
   - Cleanup of timers, subscriptions, and refs when a component unmounts due to navigation.
4. **Architecture and code style**
   - Alignment with project conventions and module boundaries.
5. **i18n compliance**
   - No hardcoded user-facing strings, locales updated when needed.
6. **Regression risk**
   - Existing flows possibly affected by touched files/dependencies.
7. **Test adequacy**
   - Coverage for changed logic and negative paths.

## Output format

For each finding:

- Severity:
- File/path:
- Problem:
- Why it matters:
- Suggested fix:

If no findings, explicitly state "No blocking findings" and list residual risks.
