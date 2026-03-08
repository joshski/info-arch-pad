# Add a "hell yeah" smoke-test command

The CLI in [index.ts](../../index.ts#L1) has three successful entry points today. Users can render an IA file, crawl a site, or parse a sitemap. Each path requires either local input or a network target, and each produces structured output. There is no zero-setup command a new user can run immediately after install to confirm the tool is wired up correctly.

Adding a tiny command that prints exactly `Hell yeah` would create a fast smoke test for local installs, shell scripts, and agent workflows. This fits the [Easy to try](../principles/easy-to-try.md) goal because it removes the need to learn the DSL or prepare a sample file before seeing a successful result. It also matches the CLI's existing convention of reserving stdout for primary command output: successful paths in [index.ts](../../index.ts#L63) and [index.ts](../../index.ts#L252) write their main artifact directly to stdout, while usage and status messages go to stderr.

Because [index.test.ts](../../index.test.ts#L21) already asserts exact stdout behavior for CLI commands, this idea should keep the contract intentionally narrow. The success path should emit only the expected success string so it can be used in shell checks without extra parsing.

## Open Questions

### How should users invoke the "Hell yeah" output?

#### Add a dedicated subcommand

Use a distinct entry point such as `bun run index.ts hell-yeah`. This keeps the behavior explicit and avoids overloading the current "first argument is an input file unless it is `crawl` or `sitemap`" parsing model.

#### Add a top-level flag

Use a flag such as `bun run index.ts --hell-yeah`. This makes the feature easy to discover in `printUsage()`, but it adds another branch to an argument parser that currently assumes the first positional argument is the main mode selector.

### Should the command include a trailing newline?

#### Include a newline

Match normal shell `echo` behavior so the output reads cleanly in a terminal and composes naturally with logs.

#### Print only the literal bytes `Hell yeah`

Treat "...and nothing else" as a strict output contract. This is slightly less friendly in an interactive terminal, but it makes machine assertions maximally precise.
