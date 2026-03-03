# Refactor playground logic for unit tests

Extract the non-DOM decision logic from `playground.ts` into a small testable module. Then add unit coverage for the behavior that currently has zero tests.

The resulting task should preserve current playground behavior while giving the project repeatable coverage over example switching, theme selection defaults, successful render-state creation, and the formatted error messages shown to users when parsing fails.

## Goals

- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] A new testable module owns the playground state and formatting logic that does not require `document` access
- [ ] A new `playground.test.ts` covers example loading, theme fallback, and parse error formatting
- [ ] `playground.ts` remains the browser entrypoint and delegates to the extracted helpers without changing the visible UI behavior
