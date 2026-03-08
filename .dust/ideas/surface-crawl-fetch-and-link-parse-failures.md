# Surface crawl fetch and link parse failures

The crawl pipeline still suppresses some failures without surfacing diagnostics. In [crawl.ts](../../crawl.ts#L29), failed `fetch()` calls are dropped with `catch { continue; }`, and malformed discovered links near [crawl.ts](../../crawl.ts#L74) are skipped similarly.

Pattern: silently swallowed errors.

Impact: crawl mode can return partial results, or fail with `Error: No pages were crawled`, without showing if network failures or malformed links caused the issue. That limits recovery guidance for users.

Suggestion: capture skipped-error counts with representative samples and route full-failure cases through the shared CLI error formatter with a concrete next-step hint.
