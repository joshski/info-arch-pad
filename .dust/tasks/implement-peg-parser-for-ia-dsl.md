# Implement PEG parser for IA DSL

Build a parser using peggy that reads the indentation-based IA DSL and produces the AST types defined in the model.

The DSL syntax supports:
- `site <name>` as the root declaration
- Indentation-based nesting for containment (pages within sections)
- Node lines: `<name> [<path>] [(<annotation>)]`
- Navigation links: `--> <target>`
- Components within pages: `[<component-name>]` (parse but no layout/render needed yet)

The parser should:
- Handle consistent indentation (2-space increments)
- Detect dynamic route parameters (`:param`) and mark nodes as page stacks
- Produce the AST types from the model module
- Work in browser environments (no Node/Bun-specific APIs in the parser itself)

## Goals

(none)

## Blocked By

- Define AST types for IA model

## Definition of Done

- [ ] peggy grammar parses the minimal example from the idea doc
- [ ] peggy grammar parses the navigation links example from the idea doc
- [ ] Parser output matches the defined AST types
- [ ] Dynamic routes are flagged as page stacks
- [ ] Tests cover hierarchy, navigation links, annotations, and dynamic routes
