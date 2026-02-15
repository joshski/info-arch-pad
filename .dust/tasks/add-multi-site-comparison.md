# Add multi-site comparison

Support defining two or more `site` blocks in a single `.ia` file and rendering them side by side. This enables comparing current vs. proposed architectures or showing how different products relate.

## Goals

- [Polished output by default](../goals/polished-output-by-default.md)

## Blocked By

(none)

## Definition of Done

- [ ] The parser accepts multiple `site` blocks in a single `.ia` file
- [ ] The layout engine positions multiple sites side by side
- [ ] Cross-site links are supported and rendered correctly
- [ ] Tests cover parsing and rendering of multi-site diagrams
