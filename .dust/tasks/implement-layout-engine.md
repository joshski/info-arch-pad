# Implement layout engine

Build a layout engine that takes the parsed IA AST and computes x/y positions and dimensions for each node, suitable for rendering as an SVG.

Use a simple hierarchical tree layout algorithm (no external layout library for MVP). The layout should:
- Position child nodes below their parent
- Space siblings horizontally
- Account for node label widths
- Compute bounding boxes for sections that contain children
- Return a flat list of positioned elements (nodes and edges) ready for SVG rendering

The layout module should be browser-compatible (no Node/Bun-specific APIs).

## Goals

(none)

## Blocked By

- Define AST types for IA model

## Definition of Done

- [ ] Layout function takes an IADiagram and returns positioned nodes and edges
- [ ] Children are positioned below parents in a tree structure
- [ ] Sections with children have bounding boxes
- [ ] Navigation links produce edge coordinates
- [ ] Tests verify layout positions for a simple diagram
