# Add watch mode

Add a `--watch` flag that re-renders the SVG whenever the input `.ia` file changes. This tightens the authoring loop for developers iterating on their diagrams.

## Goals

- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] A `--watch` flag re-renders the output file when the input file changes
- [ ] The watch mode prints a message on each re-render
- [ ] Ctrl+C cleanly exits the watch loop
