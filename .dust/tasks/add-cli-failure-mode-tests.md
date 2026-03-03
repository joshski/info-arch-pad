# Add CLI failure mode tests

Add regression coverage in `index.test.ts` for the CLI paths that currently return user-facing errors but are not exercised today. Focus on failures that can happen in real usage: PNG conversion failures, output file write failures, and `--watch` behavior after the input file is deleted or becomes unreadable. Keep the task scoped to observable CLI behavior by driving `index.ts` through `Bun.spawn(...)` and only make small code changes needed to make those failures deterministic in tests.

## Goals

- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] `index.test.ts` covers at least one deterministic failure case for PNG rendering, output writing, and watch mode after the input file becomes unreadable
- [ ] The CLI exits non-zero or keeps reporting recoverable watch errors in the same way a user would observe from the terminal, without crashing the process
- [ ] Any code changes needed to make these paths testable stay localized to `index.ts`
