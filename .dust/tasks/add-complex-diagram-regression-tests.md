# Add complex diagram regression tests

Add a shared high-complexity IA fixture to the existing test suites. Use it to extend parser, layout, and renderer coverage for edge cases that are called out in the idea but not covered today.

Target the existing root-level test files: `parser.test.ts`, `layout.test.ts`, and `renderer.test.ts`. Prefer assertions that catch visible regressions such as parse acceptance, bounded layout dimensions, edge generation for dense links, and correct XML escaping in the rendered SVG.

## Goals

- [Polished output by default](../goals/polished-output-by-default.md)
- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] A single reusable complex fixture is added to the tests and exercises parser, layout, and renderer behavior
- [ ] `parser.test.ts` covers unusual whitespace or Unicode input without introducing parser-only helper code
- [ ] `layout.test.ts` and `renderer.test.ts` assert stable behavior for dense diagrams, including non-empty edge output and valid escaped SVG text
