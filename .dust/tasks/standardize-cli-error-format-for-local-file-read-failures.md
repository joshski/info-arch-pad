# Standardize CLI Error Format For Local File Read Failures

Add a shared CLI error formatter for local file read/render failures.

This task should deliver one end-to-end slice: running the CLI with a bad local input path returns a consistent, context-rich error that includes the failing path, original cause (when available), and a concrete next step.

## Principles

- [Easy to try](../principles/easy-to-try.md)
- [Polished output by default](../principles/polished-output-by-default.md)

## Facts

- [Use dust for planning](../facts/use-dust-for-planning.md)

## Decomposed From

- `Preserve CLI error context and next steps` (idea closed by decomposition)

## Blocked By

(none)

## Definition of Done

- [ ] A shared CLI error formatting helper exists and can format `{ context, cause, nextStep }` style failures
- [ ] The local file read/render CLI path uses the shared formatter instead of collapsing errors to `Could not read file`
- [ ] Error output includes the attempted input path and preserves useful cause text (for example ENOENT or EACCES)
- [ ] Error output includes one next-step hint appropriate for local file failures
- [ ] Tests cover the full CLI behavior for a failing local file path
