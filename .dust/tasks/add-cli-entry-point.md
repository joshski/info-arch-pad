# Add CLI entry point

Create a CLI that reads an IA DSL file and writes SVG output.

Usage: `bun run index.ts <input-file> [--output <file>]`

The CLI should:
- Read the input file path from argv
- Parse the DSL using the parser module
- Compute layout using the layout module
- Render SVG using the renderer module
- Write SVG to stdout by default, or to a file if `--output` is specified
- Print helpful error messages for parse failures

Keep CLI-specific code (file I/O, argv parsing) separate from the core modules so the parser/layout/renderer remain browser-compatible.

## Goals

(none)

## Blocked By

- Implement PEG parser for IA DSL
- Implement SVG renderer

## Definition of Done

- [ ] CLI reads a .ia file and outputs SVG
- [ ] `--output` flag writes to a file instead of stdout
- [ ] Parse errors show line/column information
- [ ] Core modules have no Node/Bun-specific imports
- [ ] End-to-end test: input DSL file produces valid SVG output
