# Add PNG export

Support exporting diagrams as PNG images via a `--format png` flag. This makes it easy to paste diagrams into Slack, Notion, and other tools that don't support SVG.

## Goals

- [Polished output by default](../goals/polished-output-by-default.md)

## Blocked By

(none)

## Definition of Done

- [ ] A `--format png` CLI flag produces a PNG file instead of SVG
- [ ] The PNG renders at 2x resolution for crisp display on retina screens
- [ ] Tests verify PNG output is generated without errors
