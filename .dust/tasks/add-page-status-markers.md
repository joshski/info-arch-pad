# Add page status markers

Allow pages to be marked with a status using a `{status}` syntax (e.g. `{draft}`, `{live}`, `{archived}`) that maps to visual styling such as color or opacity. This lets IA professionals show which pages exist vs. which are planned.

## Goals

- [Polished output by default](../goals/polished-output-by-default.md)

## Blocked By

(none)

## Definition of Done

- [ ] The DSL grammar supports `{status}` syntax on page nodes
- [ ] The parser produces status information in the `IANode` model
- [ ] The renderer applies distinct visual styling per status (e.g. different fill color or opacity)
- [ ] Default theme includes styles for at least `draft`, `live`, and `archived` statuses
- [ ] Tests cover parsing and rendering of status markers
