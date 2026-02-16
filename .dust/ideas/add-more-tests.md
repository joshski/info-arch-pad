# Add more tests

The project has 104 tests across 7 files, but meaningful gaps remain. Additional tests would improve confidence and catch regressions in several areas.

## Current test coverage

| Module | Coverage | Tests |
|--------|----------|-------|
| parser.ts | ~95% | 22 tests |
| renderer.ts | ~95% | 28 tests |
| layout.ts | ~90% | 13 tests |
| crawl.ts | ~90% | 11 tests |
| sitemap.ts | ~90% | 8 tests |
| index.ts (CLI) | ~70% | 16 tests |
| model.ts | ~100% | 6 tests |
| playground.ts | 0% | 0 tests |

## Untested playground module

`playground.ts` (141 lines) has zero test coverage. It handles example loading, theme switching, live parsing/rendering, and error display. Since it runs in the browser, testing it would require a browser-like environment or refactoring to separate pure logic from DOM interaction.

## CLI error handling edge cases

`index.ts` has good coverage of the happy path and basic error cases, but several error handling paths are untested:
- PNG rendering failures (resvg errors)
- File system errors during output writing
- Watch mode behavior when the input file is deleted or becomes unreadable

## Layout stress tests

The layout tests cover core positioning logic but don't exercise edge cases like:
- Very deep hierarchies (10+ levels)
- Very wide layouts (many sibling nodes)
- Diagrams with many cross-references creating complex edge routing

## Parser edge cases

The parser is well-tested for valid input and basic validation errors, but could benefit from tests for:
- Unusual whitespace or indentation patterns
- Very long node names or paths
- Unicode characters in labels and paths

## Renderer edge cases

The renderer has excellent coverage but doesn't test:
- Very long text that might overflow node boundaries
- Diagrams with many overlapping edges
- SVG output validity when special characters appear in multiple contexts simultaneously

## Open Questions

### Should playground.ts be tested?

#### Yes, refactor to separate logic from DOM and test the logic

Extract parsing, example loading, and theme switching into pure functions that can be tested without a browser. This would be straightforward and catch logic bugs.

#### Yes, use a browser testing tool like Playwright

Test the actual browser behavior end-to-end. More realistic but adds significant tooling complexity.

#### No, it's a development tool and manual testing is sufficient

The playground is primarily for trying things out interactively. The core modules it depends on are already well-tested.

### Which test gaps should be prioritized?

#### Prioritize CLI error handling

The CLI is the primary user interface. Untested error paths could lead to confusing failures or crashes for users.

#### Prioritize layout and renderer edge cases

These affect output quality, which aligns with the **Polished output by default** goal. Edge cases in layout can produce visually broken diagrams.

#### Prioritize parser edge cases

The parser is the entry point for all user input. Robustness here prevents confusing downstream errors.

### Should tests target specific known bugs or focus on general robustness?

#### Focus on edge cases that exercise known code quality issues

The **Make the code better** idea identifies specific fragile areas (regex HTML parsing, approximate text width). Tests targeting these would both document the limitations and provide safety nets for future improvements.

#### Focus on general robustness and coverage

Systematically add tests for untested code paths regardless of known issues. This provides broader protection against regressions.
