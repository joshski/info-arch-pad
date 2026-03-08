# Route Sitemap Errors Through Shared CLI Formatter

Apply the shared CLI error formatter to sitemap fetch/parse failure paths so sitemap mode emits the same actionable structure as other CLI commands.

This task should deliver one end-to-end slice: running `sitemap` with a failing target URL returns an error message that includes the target URL, preserved cause/status detail, and a concrete recovery hint.

## Principles

- [Easy to try](../principles/easy-to-try.md)
- [Polished output by default](../principles/polished-output-by-default.md)

## Facts

- [Use dust for planning](../facts/use-dust-for-planning.md)

## Decomposed From

- `Preserve CLI error context and next steps` (idea closed by decomposition)

## Blocked By

- [Standardize CLI Error Format For Local File Read Failures](./standardize-cli-error-format-for-local-file-read-failures.md)

## Definition of Done

- [ ] Sitemap fetch/parse failures are surfaced through the shared CLI error formatter
- [ ] Error output includes the sitemap URL that failed
- [ ] HTTP and parse failures preserve useful underlying detail rather than generic `Failed to fetch sitemap: <status>` messaging
- [ ] Error output includes one next-step hint appropriate for sitemap/network issues
- [ ] Tests cover full CLI behavior for at least one failing sitemap scenario
