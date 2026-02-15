# Add HTML output format with pan and zoom

Add `--format html` to the CLI that wraps the existing SVG output in a self-contained HTML page with pan and zoom controls. Large diagrams are hard to navigate as static images; an HTML wrapper with basic interactivity makes them practical for real IA work.

## Goals

- [Polished output by default](../goals/polished-output-by-default.md)
- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] `--format html` flag is accepted by the CLI
- [ ] Output is a single self-contained HTML file (no external dependencies)
- [ ] SVG is embedded inline in the HTML
- [ ] User can pan and zoom the diagram with mouse/trackpad
- [ ] Diagram is centered on load and fits the viewport
- [ ] Existing SVG and PNG output formats are unchanged
- [ ] Tests cover the new format option
