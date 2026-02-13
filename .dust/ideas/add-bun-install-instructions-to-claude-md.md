# Add bun install instructions to CLAUDE.md

Add a note to CLAUDE.md telling agents to run `bun install` before working on the project, so dependencies are always available.

## Context

- The project uses **Bun** as its runtime and package manager (`@types/bun` in devDependencies, `bun.lock` committed)
- Dependencies include `@joshski/dust` and `peggy`
- Tests use `bun:test` and run via `bun test`
- CLAUDE.md currently only instructs agents to run `bunx dust agent` — it does not mention installing dependencies
- If `node_modules` is missing or stale, `bun test`, `bunx dust check`, and other commands may fail
- AGENTS.md has the same content as CLAUDE.md and may also need updating

## Open Questions

### Should the instruction be conditional or unconditional?

#### Unconditional — always run `bun install`

Simple and safe. `bun install` is fast and a no-op when dependencies are already up to date.

#### Conditional — only if `node_modules` is missing

Avoids unnecessary work, but adds complexity to the instructions and agents may not check reliably.

### Should AGENTS.md be updated alongside CLAUDE.md?

Both files currently have identical content. Updating only CLAUDE.md would create drift.

#### Update both files

Keeps them in sync.

#### Update only CLAUDE.md

AGENTS.md may be intended for a different audience or purpose.

### Where in CLAUDE.md should the instruction go?

#### Before the `bunx dust agent` instruction

Dependencies must be installed before dust can run, so this ordering makes logical sense.

#### After the `bunx dust agent` instruction

Keep the dust instruction first since it's the primary workflow entry point; dust itself runs via `bunx` which may not need local deps.
