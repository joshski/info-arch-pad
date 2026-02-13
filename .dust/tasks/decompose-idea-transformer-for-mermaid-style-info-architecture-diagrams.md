# Decompose Idea: Transformer for "mermaid" style info architecture diagrams

Create one or more well-defined tasks from this idea. Prefer smaller, narrowly scoped tasks -- split the idea into multiple tasks if it covers more than one logical change. Review `.dust/goals/` to link relevant goals and `.dust/facts/` for design decisions that should inform the task. See [Transformer for "mermaid" style info architecture diagrams](../ideas/transformer-for-mermaid-style-info-architecture-diagrams.md).

For now I want a CLI, but I want the code written in such a way that I could theoretically run it in the browser

## Resolved Questions

### Should nesting use indentation or braces?

**Decision:** Indentation (like YAML/Python)

### How should containment and navigation be distinguished?

**Decision:** Implicit containment via nesting, explicit navigation via arrows

### What should the primary rendering target be?

**Decision:** SVG output (CLI-generated)

### How much of the Garrett visual vocabulary should the MVP support?

**Decision:** Minimal: pages, sections, and navigation links only

### Should one model support multiple diagram views?

**Decision:** Single view per file

### What syntax should be used for metadata?

**Decision:** Inline parenthetical annotations

### Should dynamic routes render as page stacks?

**Decision:** Yes, dynamic routes automatically become page stacks

### What parser implementation should be used?

**Decision:** PEG grammar (peggy)

### How should cross-links between distant hierarchy nodes be handled?

**Decision:** Inline at the source node

### Should the initial output be static or interactive?

**Decision:** Static only (SVG/PNG)


## Goals

(none)

## Blocked By

(none)

## Definition of Done

- [ ] One or more new tasks are created in .dust/tasks/
- [ ] Task's Goals section links to relevant goals from .dust/goals/
- [ ] The original idea is deleted or updated to reflect remaining scope
