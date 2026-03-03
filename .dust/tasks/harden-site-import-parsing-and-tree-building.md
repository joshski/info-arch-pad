# Harden Site Import Parsing And Tree Building

Improve the sitemap and crawler import path so real-world site structures are converted into IA text more reliably. This should replace the crawler's fragile regex-only link extraction, remove duplicated path/tree helpers shared by `crawl.ts` and `sitemap.ts`, and preserve an end-to-end flow that starts from fetched site data and ends with stable IA output.

## Goals

- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] `crawl.ts` uses a more robust HTML link extraction approach than the current `href` regex
- [ ] Shared path normalization, naming, or tree-building logic used by both `crawl.ts` and `sitemap.ts` is extracted into one place
- [ ] Tests cover at least one realistic import case for both crawl and sitemap flows
