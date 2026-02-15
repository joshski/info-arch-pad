# Add crawl command to generate .ia from website

Add a `crawl` subcommand that takes a URL, crawls the site's pages, and generates a `.ia` file representing the discovered page hierarchy and links. This lets users visualize existing site architectures without manually writing the DSL.

## Goals

- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] CLI accepts a `crawl <url>` subcommand
- [ ] Crawler discovers pages by following internal links from the start URL
- [ ] Discovered pages are organized into a hierarchy based on URL path segments
- [ ] Internal links between pages are represented as `-->` edges
- [ ] Output is valid `.ia` syntax written to stdout or a file
- [ ] Crawl depth or page count is bounded by a `--max-pages` flag (default: 50)
- [ ] Tests cover the .ia generation from a known page structure
