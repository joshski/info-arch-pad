# Make The Parser Grammar Source Of Truth Explicit

Remove the ambiguity between `ia.pegjs` and the embedded grammar in `parser.ts`. Choose one canonical source of truth and update the parser implementation to match.

## Goals

- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] The repository has a single clear source of truth for the IA grammar
- [ ] Any unused duplicate grammar file or embedded copy is removed or replaced
- [ ] Parser tests still pass after the grammar source is clarified
