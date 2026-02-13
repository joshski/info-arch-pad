# Add curved edges

Replace straight-line edges between nodes with smooth bezier curves. This improves readability in diagrams with many connections by making edge paths visually distinct and reducing overlap with nodes.

## Goals

- [Polished output by default](../goals/polished-output-by-default.md)

## Blocked By

(none)

## Definition of Done

- [ ] Edges render as smooth bezier curves instead of straight lines
- [ ] Curves route cleanly and don't overlap node boxes
- [ ] Complex diagrams with cross-links are visually clearer than before
- [ ] Existing tests pass and new tests cover curved edge rendering
