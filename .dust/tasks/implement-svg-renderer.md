# Implement SVG renderer

Build an SVG renderer that takes the positioned layout output and produces an SVG string.

Rendering rules:
- Regular pages render as rectangles with rounded corners
- Page stacks (dynamic routes) render as stacked/offset rectangles
- Sections render as labeled bounding boxes around their children
- Navigation links render as arrows (lines with arrowheads)
- Node labels show the name, and optionally the path below it
- Annotations appear in smaller text

The renderer should output a complete SVG document as a string. No external SVG libraries — just string concatenation/template literals.

The renderer must be browser-compatible (no Node/Bun-specific APIs).

## Goals

(none)

## Blocked By

- Implement layout engine

## Definition of Done

- [ ] Renderer produces valid SVG from layout output
- [ ] Pages render as rounded rectangles
- [ ] Page stacks render as stacked rectangles
- [ ] Navigation arrows render with arrowheads
- [ ] Labels and paths are visible on nodes
- [ ] Tests verify SVG output contains expected elements
