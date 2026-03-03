# Improve Layout Text Measurement For Rendered Diagrams

Replace the fixed-width text sizing heuristic in `layout.ts` with a more accurate measurement approach. Keep the change focused on the end-to-end render path from parsed IA input through layout and rendering.

## Goals

- [Polished output by default](../goals/polished-output-by-default.md)

## Blocked By

(none)

## Definition of Done

- [ ] `layout.ts` no longer relies on a single fixed character width for all text
- [ ] Rendered node widths better match real label lengths for narrow and wide characters
- [ ] Tests cover at least one case where the old heuristic would under-size or over-size a node
