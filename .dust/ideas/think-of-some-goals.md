# Think of some goals

Here are suggested high-level goals for info-arch-pad. These are informed by the current codebase (parser, layout, renderer pipeline), the existing ideas backlog, and the open questions about audience and direction.

## Suggested Goals

### 1. Make info-arch-pad useful for real-world site maps

The core pipeline works, but practical use on real projects would expose gaps: the simple left-to-right tree layout doesn't handle cross-links well, link targets aren't validated, and the fixed `CHAR_WIDTH` in layout produces inaccurate sizing with proportional fonts. A goal of "useful for real projects" would drive targeted improvements to layout quality, error messages, and edge cases in the parser.

### 2. Provide a fast authoring feedback loop

Right now, generating a diagram requires running the CLI and opening the output file. A watch mode with live preview would make it much more practical to iterate on `.ia` files. This goal would encompass ideas like watch mode (#2 in the ideas list) and the playground web app (#10), prioritized by impact.

### 3. Make the output look good by default

The renderer uses hardcoded colors and a single visual style. Diagrams should look polished out of the box — good enough to drop into documentation or a presentation without post-processing. This goal covers theming (#4), curved edges (#3), and generally raising the visual quality of the default output.

### 4. Lower the barrier to trying the tool

Someone encountering info-arch-pad for the first time should be able to understand what it does and try it within minutes. This could mean a playground web app, better README with examples, or published npm package. The goal is adoption and discoverability rather than new features.

### 5. Support common output workflows

SVG works well for embedding in web pages, but many users need PNG for Slack/Notion, PDF for documentation, or Mermaid syntax for interoperability. Supporting the most common output paths would make the tool practical in more contexts without requiring external conversion steps.

## Open Questions

### Which audience should goals prioritize?

#### Developers documenting their own apps

Goals should emphasize CLI ergonomics, fast feedback loops, CI-friendly output, and keeping the DSL terse. "Useful for real-world site maps" means handling the structures developers encounter in their own apps.

#### UX/IA professionals designing new structures

Goals should emphasize visual quality, export flexibility, and approachability. "Lower the barrier" becomes especially important since non-developers need a gentler onramp.

### How many goals should the project carry at once?

#### Focus on one or two

Pick the most impactful goals and finish them before starting new ones. This keeps the project focused and avoids spreading effort too thin across the codebase.

#### Carry three to five in parallel

Multiple goals provide variety and let work on one unblock naturally when another is stuck. The risk is slower progress on each individual goal.

### Should goals be scoped to the CLI tool, or include ecosystem?

#### CLI tool only

Keep goals focused on the core `info-arch-pad` binary — parsing, layout, rendering, and CLI UX. Ecosystem pieces like a web playground or site crawler are separate projects.

#### Include ecosystem

Goals like "lower the barrier" and "support common output workflows" naturally extend beyond the CLI. Defining them broadly allows the project to grow into a suite of related tools.
