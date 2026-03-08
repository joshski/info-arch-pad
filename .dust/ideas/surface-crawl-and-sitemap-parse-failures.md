# Surface crawl and sitemap parse failures

The crawler and sitemap import paths currently discard several parsing and fetch errors without any trace. In [crawl.ts](../../crawl.ts#L29), failed `fetch()` calls fall through `catch { continue; }`, and malformed links inside [crawl.ts](../../crawl.ts#L74) are skipped the same way. The sitemap parser does the same in [sitemap.ts](../../sitemap.ts#L30) and [sitemap.ts](../../sitemap.ts#L123).

Pattern: silently swallowed errors and inconsistent recovery.

Impact: a crawl or sitemap import can return partial data, or even `Error: No pages were crawled` / `Error: No URLs found in sitemap`, without exposing whether the root cause was a network failure, invalid XML contents, or malformed URLs. That makes failures hard to debug for both humans and agents.

Suggestion: collect skipped-error counts plus a few representative samples, then surface them in a warning or returned diagnostic object. For fully failed runs, include the underlying cause in the final error instead of collapsing everything into an empty result.

## Open Questions

### How noisy should invalid-link reporting be?

#### Summarize failures
Count skipped URLs and print a compact summary with a few examples. This keeps normal runs readable while still surfacing the cause.

#### Fail fast on malformed input
Abort when the first malformed sitemap entry or crawl link is found. This is stricter, but it may reject otherwise usable inputs too aggressively.
