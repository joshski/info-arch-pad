# Think of more ideas

New ideas building on the existing codebase and goals.

## Ideas

### Diagram annotations and notes
Allow users to attach freeform notes or callouts to specific nodes in the diagram. IA professionals often need to annotate diagrams with design rationale, content types, or status labels (e.g. "needs review", "deprecated"). This could extend the DSL with a note syntax like `-- "This section is being restructured"` beneath a page node.

### Multiple site comparison
Support defining two or more `site` blocks in a single `.ia` file and rendering them side by side. This would be useful for comparing current vs. proposed architectures, or for showing how different products relate to each other. Relevant to the "polished output" goal since comparison diagrams are common in IA deliverables.

### Import from sitemap.xml
Parse standard `sitemap.xml` files and generate `.ia` files from them. Unlike full site crawling (already proposed), this is a simpler, more reliable approach that works with any site that publishes a sitemap. Lowers the barrier for getting started with real site data, supporting the "easy to try" goal.

### Playground examples gallery
Add a set of pre-built example `.ia` files to the playground that demonstrate common IA patterns: e-commerce sites, documentation sites, SaaS dashboards, marketing sites. Users could load these as starting points. Directly supports the "easy to try" goal by giving users something to modify rather than starting from scratch.

### Conditional styling and page status
Allow pages to be marked with a status (e.g. `{draft}`, `{live}`, `{archived}`) that maps to visual styling like color or opacity. IA professionals often need to show which pages exist vs. which are planned. This supports both the "polished output" goal (richer visual communication) and practical IA workflows.

## Open Questions

### Should new DSL extensions (annotations, status markers) be purely visual, or should they also appear in some structured metadata output?

#### Visual only
Keep it simple — annotations and status markers affect rendering but nothing else. This avoids scope creep and keeps the tool focused on diagrams.

#### Visual plus structured metadata
Export annotations and status as JSON or another format alongside the diagram. This would let the tool serve as a lightweight IA documentation system, not just a visualization tool.

### For sitemap import, how should a flat URL list be converted into a hierarchy?

#### Reconstruct tree from URL path segments
Split each URL by `/` and build a tree from the segments. Simple and predictable, but may produce overly deep or awkward trees for sites with non-hierarchical URL schemes.

#### Flat list with manual restructuring
Import all pages as siblings under the site root and let the user reorganize. Simpler to implement and avoids guessing, but creates more work for the user.

### For the playground examples gallery, should examples be bundled into the HTML or fetched separately?

#### Bundled into the HTML
Embed example `.ia` content directly in the playground HTML. Works offline, no extra requests, but increases initial page size.

#### Fetched from a separate source
Load examples on demand from separate files or a URL. Keeps the page lightweight and makes it easier to add new examples, but requires a server or hosting for the example files.
