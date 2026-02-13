# Transformer for "mermaid" style info architecture diagrams

A text-based DSL for defining information architecture diagrams that transforms into a DAG graph with automatic layout. Like Mermaid does for flowcharts and sequence diagrams, but purpose-built for IA — sitemaps, navigation structures, page hierarchies, and content organization.

## The Gap

No existing text-based DSL is specifically designed for information architecture diagrams:

- **General-purpose diagram tools** (Mermaid, D2, Graphviz, PlantUML) can approximate IA diagrams but lack IA-specific semantics — they conflate navigation links with containment, have no concept of page types/stacks, and don't support URL-awareness.
- **IA-specific tools** (Octopus.do, FlowMapp, Slickplan) are visual/GUI-based and not text-based, so they don't version well in git or compose with developer workflows.

## What Makes IA Diagrams Unique

Unlike general flowcharts, information architecture diagrams need:

1. **Dual relationship types** — containment (section contains pages) AND navigation (page links to page)
2. **Page stacks / templates** — one definition generating many pages (e.g., product detail pages)
3. **Content components within pages** — hero, nav, sidebar, etc.
4. **URL structure as a first-class concept** — `/products/:id`
5. **Conditional paths** — based on user state (logged in vs. anonymous)
6. **Metadata** — status (draft/live/deprecated), ownership, content type

## Syntax Ideas

### Minimal example (just hierarchy)

```
site MyApp
  home /
  products /products
    product-list
    product-detail /products/:id
  about /about
    team
    contact /contact
```

### With navigation links and components

```
site MyApp
  home / (landing-page)
    [hero]
    [featured-products]
    --> products
    --> about

  products /products (listing-page)
    [filters]
    [product-card *]
    product-detail /products/:id (detail-page)
      [gallery]
      [specs]
      [reviews]
      --> home

  about /about
    team /about/team
    contact /contact
```

### Syntax inspirations

| Source | What to borrow |
|--------|---------------|
| Mermaid mindmaps | Indentation-based hierarchy for simplicity |
| D2 | Container nesting for pages-within-sections |
| Structurizr DSL | Model-view separation (one model, multiple diagram views) |
| Garrett visual vocabulary | Standard IA shapes: page, page stack, decision point, area |
| Markdown | Familiarity for developers (`#` headings, indentation) |

## Layout Engine Options

| Library | Strengths | Best for |
|---------|-----------|----------|
| **ELK (elkjs)** | Compound graph support, hierarchical layout, 140+ config options, actively maintained | Full IA diagrams with nested containers |
| **dagre** | Simple API, small bundle, fast | MVP / simple sitemaps |
| **d3-hierarchy** | Tree, treemap, partition layouts | Pure tree-structured sitemaps |
| **d3-dag** | Clean DAG-specific algorithms | DAGs without nesting |
| **Cytoscape.js** | Full graph library with multiple layouts and interaction | Interactive exploration |

**Recommendation:** ELK for the primary layout engine (best compound graph support), with d3-hierarchy as a lightweight option for simple tree sitemaps.

## Codebase Context

The project (`info-arch-pad`) is a fresh Bun/TypeScript project with no application code yet — just `console.log("Hello via Bun!")`. This means the format and transformer can be designed from scratch with no constraints from existing code. The project uses TypeScript with strict mode and ESNext targets.

## Open Questions

1. **Indentation vs. braces for nesting?** Indentation (like YAML/Python) is more readable for simple trees but harder to parse and error-prone with mixed tabs/spaces. Braces (like D2/JSON) are unambiguous but more verbose. Or both?

2. **How to distinguish containment from navigation?** Should containment be implicit (indentation = parent-child) and navigation explicit (`-->`)? Or should both be explicit?

3. **What rendering target?** SVG in-browser? CLI-generated PNG/SVG? Both? Should it integrate with existing tools (e.g., render inside Mermaid's ecosystem, or output Mermaid-compatible syntax)?

4. **How much of the Garrett visual vocabulary to support?** The full vocabulary includes page stacks, decision points, conditional branches, clusters, and areas. Should the MVP support all of these or start with just pages, sections, and links?

5. **Multiple views from one model?** Like Structurizr, should one IA definition support rendering as a full sitemap, a section overview, a single page's component layout, or a navigation flow? Or is a single view sufficient?

6. **Metadata syntax?** Inline annotations (`home / (landing-page) [live]`) vs. block properties (`home { type: landing-page, status: live }`) vs. front-matter sections?

7. **Should it support parameterized/dynamic routes?** E.g., `/products/:id` or `/blog/:year/:slug`. If so, how should these render in the diagram — as page stacks? With sample data?

8. **Interactive or static output?** Should the rendered diagram be a static image/SVG, or an interactive explorable graph (click to expand sections, hover for metadata)?

9. **Parser implementation?** Hand-written recursive descent parser (full control), PEG grammar (e.g., via pegjs/peggy), or tree-sitter grammar (for editor integration)?

10. **How to handle cross-links between distant parts of the hierarchy?** E.g., a blog post linking to a product page. Should these be declared inline or in a separate "links" section?
