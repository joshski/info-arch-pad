# Add GitHub Actions CI workflow

Add a `.github/workflows/test.yml` workflow that runs `bunx dust check` on push to `main` and on pull requests.

## Details

- Trigger on push to `main` and on pull requests
- Use `oven-sh/setup-bun` to install Bun, pinned to version 1.3.5
- Run `bun install` to install dependencies
- Run `bunx dust check` to execute markdown linting and tests

## Goals

(none)

## Blocked By

(none)

## Definition of Done

- [ ] `.github/workflows/test.yml` exists with correct configuration
- [ ] Workflow triggers on push to `main` and pull requests
- [ ] Bun 1.3.5 is pinned in the workflow
- [ ] `bunx dust check` is the CI command
