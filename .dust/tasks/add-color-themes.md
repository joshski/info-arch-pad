# Add color themes

Replace the hardcoded colors in the SVG renderer with a theming system. The tool should ship with a default theme that looks polished, plus at least one alternative theme. Users select a theme via a CLI flag (e.g. `--theme dark`).

## Goals

- [Polished output by default](../goals/polished-output-by-default.md)

## Blocked By

(none)

## Definition of Done

- [ ] Colors in the renderer are driven by a theme object, not hardcoded values
- [ ] A default theme produces visually polished output (balanced palette, good contrast)
- [ ] At least one alternative theme is included (e.g. dark)
- [ ] A `--theme` CLI flag selects the active theme
- [ ] Existing tests pass and new tests cover theme selection
