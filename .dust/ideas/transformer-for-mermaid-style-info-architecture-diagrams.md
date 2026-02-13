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

## Codebase Context

The project (`info-arch-pad`) is a fresh Bun/TypeScript project with no application code yet — just `console.log("Hello via Bun!")`. This means the format and transformer can be designed from scratch with no constraints from existing code. The project uses TypeScript with strict mode and ESNext targets.

## Open Questions

### Should nesting use indentation or braces?

#### Indentation (like YAML/Python)

More readable for simple trees and feels natural for hierarchical IA content. Matches how sitemaps are typically sketched. Downside: harder to parse reliably, error-prone with mixed tabs/spaces.

#### Braces (like D2/JSON)

Unambiguous parsing, no whitespace sensitivity. Works better with copy-paste and code generation. Downside: more verbose, less visually clean for deeply nested trees.

#### Both (indentation as default, braces as escape hatch)

Maximizes ergonomics for simple cases while allowing precision when needed. Adds parser complexity but provides the best developer experience.

### How should containment and navigation be distinguished?

#### Implicit containment via nesting, explicit navigation via arrows

Indentation means "is a child of" automatically. Navigation links use `-->` syntax. This is the most intuitive mapping: structure = tree, links = arrows.

#### Both explicit

Require explicit syntax for both relationships (e.g., `contains:` and `links:`). More verbose but completely unambiguous — useful if the same pair of nodes can have both a containment and a navigation relationship.

### What should the primary rendering target be?

#### SVG output (CLI-generated)

Parse the DSL → compute layout → emit SVG. Works everywhere, easy to embed in docs and READMEs, composable with CI pipelines. Can be served statically.

#### Interactive browser app

Render in a web app with pan/zoom, click-to-expand, hover-for-metadata. Richer experience but requires a runtime environment. Could use a dev server approach like Mermaid Live Editor.

#### SVG-first with optional interactive viewer

Start with static SVG generation as the core pipeline. Layer an optional browser-based viewer on top that reuses the same parser and layout. Best of both worlds, and the SVG path keeps the tool useful in non-browser contexts.

### How much of the Garrett visual vocabulary should the MVP support?

#### Minimal: pages, sections, and navigation links only

Enough to express sitemaps and basic navigation flows. Keeps the DSL simple and the parser small. Can always add more node types later.

#### Moderate: add page stacks and decision points

Page stacks cover the common "template generates many pages" pattern (e.g., product detail). Decision points cover conditional flows (logged-in vs. anonymous). These two additions cover most real-world IA diagrams.

#### Full vocabulary from day one

Include page stacks, decision points, conditional branches, clusters, areas, and connectors. Comprehensive but risks over-engineering the MVP and slowing iteration.

### Should one model support multiple diagram views?

#### Single view per file

One DSL file = one diagram. Simple mental model, easy to implement. If you want different views, you write different files (possibly importing shared definitions).

#### Multiple views from one model (Structurizr-style)

Define the full IA model once, then declare views that filter/focus on subsets: a full sitemap view, a section-detail view, a navigation-flow view. More powerful but significantly more complex to implement.

### What syntax should be used for metadata?

#### Inline parenthetical annotations

`home / (landing-page) [live]` — compact, stays on one line. Good for a small number of attributes. Gets unwieldy with many properties.

#### Block properties

```
home / {
  type: landing-page
  status: live
  owner: content-team
}
```

More structured, supports arbitrary key-value pairs. Verbose but scalable.

#### Front-matter style per node

Use a YAML-like front-matter block at the top of each node definition. Familiar to developers but might clash with the indentation-based hierarchy.

### Should dynamic routes render as page stacks?

#### Yes, dynamic routes automatically become page stacks

`/products/:id` implies "many pages from one template" — render as a stacked/shadowed rectangle (Garrett convention). Simple rule, no extra syntax needed.

#### No, page stacks are explicitly declared

Dynamic routes and page stacks are separate concepts. A route parameter is about URL structure; a page stack is about visual representation. Keep them independent and let the author choose.

### What parser implementation should be used?

#### PEG grammar (peggy)

Declarative grammar definition, generates a fast parser, good error messages with some effort. Well-suited to DSL parsing. peggy is actively maintained and works with TypeScript.

#### Hand-written recursive descent

Full control over parsing, error messages, and incremental parsing. More code to write but no build step or external dependency. Easier to evolve the grammar iteratively.

#### Tree-sitter grammar

Designed for editor integration — syntax highlighting, folding, incremental reparsing. More complex to author but enables first-class editor support from day one. Overkill if editor integration isn't a priority.

### How should cross-links between distant hierarchy nodes be handled?

#### Inline at the source node

`--> /products/detail` declared inside the blog post node. Keeps links close to where they originate but can clutter deeply nested nodes.

#### Separate links section

A top-level `links:` block that declares connections between any two nodes by path. Cleaner separation of structure and navigation, easier to see all cross-cutting links at once. But splits the mental model across two locations.

#### Both

Allow inline links for local navigation and a separate section for cross-cutting links. Most flexible, but adds cognitive load around which style to use when.

### Should the initial output be static or interactive?

#### Static only (SVG/PNG)

Simplest to implement. Output can be used anywhere — docs, slides, PRs, wikis. No runtime dependency. Good enough for most IA documentation use cases.

#### Interactive only (browser-based)

Pan, zoom, expand/collapse sections, hover for metadata. Better for exploring large IAs. But limits where the output can be used.

#### Static by default, interactive as opt-in

Generate static SVG as the primary output. Provide a `--serve` flag or companion viewer for interactive exploration. This avoids forcing interactivity on users who just want an image in their README.
