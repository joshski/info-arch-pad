# Run the tests in github

Add GitHub Actions CI configuration to run the test suite automatically on push and pull requests.

## Context

- The project uses **Bun** as its runtime and test runner (tests use `bun:test`)
- There are currently **34 tests across 5 test files**: `parser.test.ts`, `layout.test.ts`, `model.test.ts`, `renderer.test.ts`, and `index.test.ts`
- Tests run via `bun test` and complete in ~178ms
- The project also uses `bunx dust check` which runs markdown linting and tests
- No CI configuration exists yet

## Approach

Add a `.github/workflows/test.yml` workflow that:
- Triggers on push to `main` and on pull requests
- Uses `oven-sh/setup-bun` to install Bun
- Runs `bun install` to install dependencies
- Runs `bun test` to execute the test suite

## Open Questions

### Should `bunx dust check` be run in CI instead of (or in addition to) `bun test`?

`dust check` runs both markdown linting and tests, which would provide broader validation but adds a dependency on dust in CI.

#### Just `bun test`

Simpler, no extra dependency beyond Bun itself.

#### `bunx dust check`

Runs markdown linting and tests together, matching local workflow. Adds dust as a CI dependency.

### Which Bun version should be pinned?

The project currently uses Bun 1.3.5 locally.

#### Pin to specific version (1.3.5)

Reproducible builds, but requires manual updates.

#### Use `latest`

Always up to date, but risks unexpected breakage.

### Should the workflow also run on branches other than `main`?

#### Push to `main` and PRs only

Standard setup, keeps CI runs focused.

#### All pushes and PRs

More coverage but more CI usage.
