# Build playground web app

Create a browser-based editor with the `.ia` source on the left and live SVG preview on the right, similar to the Mermaid live editor. This lets people try info-arch-pad without installing anything.

## Goals

- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] A web page with a text editor pane and an SVG preview pane
- [ ] Editing the `.ia` source updates the preview in real time
- [ ] Ships with example `.ia` content so users see a diagram immediately
- [ ] The playground can be deployed as a static site (no server required)
- [ ] Parser and renderer run in the browser (bundled from existing code)
