# Add diagram annotations

Allow users to attach freeform notes to specific nodes in the diagram using a DSL syntax like `-- "note text"` beneath a page node. Notes should render as callouts or labels near the annotated node.

## Goals

- [Polished output by default](../goals/polished-output-by-default.md)

## Blocked By

(none)

## Definition of Done

- [ ] The DSL grammar supports a note/annotation syntax on page nodes
- [ ] The parser produces annotation data in the `IANode` model
- [ ] The renderer displays annotations as callouts or labels near the node
- [ ] Annotations are visually distinct from other node text (path, components)
- [ ] Tests cover parsing and rendering of annotations
