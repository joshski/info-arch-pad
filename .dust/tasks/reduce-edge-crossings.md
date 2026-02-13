# Reduce edge crossings

Improve the layout algorithm to minimize edge crossings in diagrams with many `-->` links. The current layout places nodes left-to-right without considering where links go, which produces cluttered diagrams.

## Goals

- [Polished output by default](../goals/polished-output-by-default.md)

## Blocked By

(none)

## Definition of Done

- [ ] Nodes with `-->` links between them are positioned closer together when possible
- [ ] Existing tests still pass (layout changes must not break rendering)
- [ ] A test with multiple cross-links produces fewer crossings than before
