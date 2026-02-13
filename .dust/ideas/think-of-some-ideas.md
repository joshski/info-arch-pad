# Think of some ideas

What will make info-arch-pad better? After exploring the codebase — a CLI tool that converts a custom `.ia` DSL into SVG information architecture diagrams — here are ideas across usability, output quality, and capability.

## Ideas

### 1. Interactive HTML output
Instead of static SVG, generate an HTML page that embeds the SVG with pan/zoom and click-to-expand sections. Large site maps become hard to read as static images; interactivity would make the tool more practical for real IA work.

### 2. Live preview / watch mode
Add a `--watch` flag that re-renders the SVG whenever the input `.ia` file changes, and optionally serves the result in a browser with auto-reload. This would make the authoring loop much tighter.

### 3. Curved edge routing
Currently edges are straight lines from the bottom of one node to the top of another. These can overlap nodes and each other in complex diagrams. Curved or routed edges (e.g. bezier curves that avoid obstacles) would produce clearer diagrams.

### 4. Color themes and styling
The renderer uses hardcoded colors (#333, #666, #f5f5f5, etc.). Supporting named themes or user-defined color palettes would make the output more visually appealing and adaptable for different contexts (presentations, docs, dark backgrounds).

### 5. Export to other formats
Beyond SVG, support PNG (via a headless renderer or canvas), PDF, or even Mermaid/PlantUML syntax. This would widen the tool's usefulness for people who need raster images or want to paste diagrams into tools that don't support SVG.

### 6. Smarter layout algorithm
The current layout is a simple left-to-right tree. For large diagrams with many cross-links, a force-directed or Sugiyama-style layout could reduce edge crossings and produce more readable results. The `textWidth` function also uses a fixed `CHAR_WIDTH = 8` which doesn't account for proportional fonts.

### 7. Validate links
The parser accepts `-->` links to target names, but there's no validation that the target actually exists in the diagram. Adding a validation pass after parsing could catch typos and broken references early with helpful error messages.

### 8. Support for external links and URLs
Currently links are internal references between nodes. Supporting external URLs (e.g. `---> https://example.com`) would let diagrams represent integrations with third-party services.

### 9. Reverse engineering from a live site
A companion tool that crawls a website and generates a `.ia` file from its actual page structure. This would let people visualize existing site architectures without manually writing the DSL.

### 10. Playground web app
A browser-based editor with the `.ia` source on the left and live SVG preview on the right, similar to the Mermaid live editor. This would lower the barrier to trying the tool and could serve as documentation by example.

## Open Questions

### Who is the primary audience?

#### Developers documenting their own apps

Prioritize developer-friendly features: CLI ergonomics, watch mode, CI integration, Markdown/code-friendly output. Keep the DSL terse and programmable.

#### UX/IA professionals designing new structures

Prioritize designer-friendly features: interactive HTML output, theming, export to PNG/PDF, and possibly a visual playground. The DSL should be approachable for non-developers.

### Should the DSL grow or stay minimal?

#### Grow the DSL with new syntax

Add features like external links, styling hints, grouping, and conditional sections. This makes the tool more powerful for complex real-world site maps.

#### Keep the DSL minimal

Preserve simplicity as a core value. The current syntax is easy to learn and read. Additional capabilities could come through tooling (themes, output formats) rather than language complexity.

### Is SVG the right primary output format?

#### Yes, keep SVG as primary

SVG is scalable, web-native, and can be embedded anywhere. Users who need other formats can convert externally.

#### No, offer multiple first-class formats

Many users need PNG for Slack/Notion or PDF for documentation. Making these first-class outputs would reduce friction.

### How important is layout quality vs. speed?

#### Invest in smarter layout

A Sugiyama-style or force-directed layout would produce clearer diagrams with fewer edge crossings, especially for complex sites with many cross-links.

#### Keep the simple layout

The current left-to-right tree layout is fast, predictable, and easy to debug. It's good enough for most use cases and avoids adding heavy dependencies.
