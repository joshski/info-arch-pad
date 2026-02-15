# Add sitemap.xml import

Parse standard `sitemap.xml` files and generate `.ia` files from them. Reconstruct the page hierarchy from URL path segments. This is a simpler, more reliable alternative to full site crawling that works with any site that publishes a sitemap.

## Goals

- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] A new CLI command (e.g. `bun run index.ts sitemap <url-or-file>`) accepts a sitemap.xml URL or local file
- [ ] URLs are parsed and organized into a hierarchy based on path segments
- [ ] Output is a valid `.ia` file that can be rendered by the existing pipeline
- [ ] Tests cover sitemap parsing and hierarchy reconstruction
