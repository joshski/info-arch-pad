# Validate link targets

Add a validation pass after parsing that checks all `-->` link targets reference existing node names. Report clear error messages with the location of invalid links.

## Goals

- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] After parsing, validate that every link target matches a node name in the diagram
- [ ] Invalid link targets produce an error message with the target name
- [ ] Tests cover valid links, invalid links, and diagrams with no links
