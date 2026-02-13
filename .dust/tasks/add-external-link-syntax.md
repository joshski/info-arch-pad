# Add external link syntax

Extend the DSL to support external URLs as link targets, e.g. `---> https://stripe.com/api`. This lets diagrams represent integrations with third-party services and external dependencies.

## Goals

- [Easy to try](../goals/easy-to-try.md)

## Blocked By

(none)

## Definition of Done

- [ ] The parser accepts `---> <url>` syntax for external links
- [ ] External links render as dashed arrows with the URL as a label
- [ ] Tests cover parsing and rendering of external links
