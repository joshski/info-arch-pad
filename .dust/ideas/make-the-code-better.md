# Make the code better

The codebase is well-structured with clean separation of concerns and strong test coverage. There are several concrete areas where the code could be improved in terms of maintainability, robustness, and correctness.

## Duplicated tree-building logic

`crawl.ts` and `sitemap.ts` both implement their own versions of `buildTree()`, `pathToName()`, and `sanitizeName()`. Extracting this shared logic into a common module would reduce duplication and ensure bug fixes propagate to both code paths.

## Approximate text width calculation

`layout.ts` estimates text width by multiplying character count by a fixed `CHAR_WIDTH` constant. Since the rendered font is sans-serif (not monospace), characters like "W" and "i" have very different widths. This can cause text overflow or wasted space in rendered diagrams. A more accurate measurement approach would improve output quality, which aligns with the **Polished output by default** goal.

## Unused `ia.pegjs` file

The grammar file `ia.pegjs` exists at the project root but isn't referenced anywhere. The actual grammar is embedded as a string inside `parser.ts`. This is confusing — either the standalone file should be used (for better IDE support and maintainability) or removed.

## Regex-based HTML parsing in crawler

`crawl.ts` uses raw regex to extract `href` attributes from HTML. This is fragile against real-world HTML variations (attribute quoting, whitespace, malformed markup). A proper HTML parser would be more robust.

## Magic numbers in layout and renderer

Spacing and sizing constants (`SIBLING_GAP`, `LEVEL_GAP`, `CORNER_RADIUS`, `STACK_OFFSET`, etc.) are scattered as hardcoded values. Centralizing these or making them configurable would make it easier to adjust the visual output and support different diagram styles.

## Open Questions

### Which improvements would deliver the most value?

#### Prioritize output quality improvements

Text width accuracy and layout constants directly affect diagram appearance, which aligns with the "Polished output by default" goal. Users see these improvements immediately.

#### Prioritize internal code quality

Deduplication and removing the unused grammar file reduce maintenance burden and make future changes easier, even though users don't see the difference directly.

### How should text width accuracy be improved?

#### Use actual font metrics via a library like opentype.js

Accurate but adds a dependency. Would need to bundle or reference the actual font file used in rendering.

#### Use a better heuristic based on character categories

Classify characters as narrow/normal/wide and use different multipliers. No new dependencies but still approximate.

### What should happen with the standalone ia.pegjs file?

#### Use it as the source of truth and load it in parser.ts

Better IDE support, syntax highlighting, and separation of concerns. Requires a build or load step.

#### Remove it since the embedded grammar in parser.ts is the actual source

Eliminates confusion. The embedded grammar works and is well-tested.

### Is regex-based HTML parsing in the crawler causing real problems?

#### Yes, replace it with a proper HTML parser

Adds a dependency but handles real-world HTML reliably. Important if people crawl diverse sites.

#### No, keep it simple unless specific failures are reported

The regex approach is lightweight and dependency-free. Fix specific edge cases as they come up.
