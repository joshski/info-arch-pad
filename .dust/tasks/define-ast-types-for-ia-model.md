# Define AST types for IA model

Define the TypeScript types that represent a parsed information architecture diagram. These types form the core data model used by the parser, layout engine, and renderer.

Types needed:
- `IANode` — a page or section with a name, optional path, optional annotation, and children
- `IALink` — a navigation link from one node to a target (by name or path)
- `IADiagram` — the root container with a site name and top-level nodes

Dynamic routes (paths containing `:param`) should be flagged as page stacks on the node.

Keep types simple — no rendering or layout information. This is the pure domain model.

The types should be browser-compatible (no Node/Bun-specific imports).

## Goals

(none)

## Blocked By

(none)

## Definition of Done

- [ ] TypeScript types/interfaces exported from a module
- [ ] Types cover pages, sections, navigation links, and page stacks
- [ ] No runtime dependencies
- [ ] Tests verify type structures compile correctly
