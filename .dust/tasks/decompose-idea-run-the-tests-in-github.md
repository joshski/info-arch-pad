# Decompose Idea: Run the tests in github

Create one or more well-defined tasks from this idea. Prefer smaller, narrowly scoped tasks -- split the idea into multiple tasks if it covers more than one logical change. Review `.dust/goals/` to link relevant goals and `.dust/facts/` for design decisions that should inform the task. See [Run the tests in github](../ideas/run-the-tests-in-github.md).

## Resolved Questions

### Should `bunx dust check` be run in CI instead of (or in addition to) `bun test`?

**Decision:** `bunx dust check`

### Which Bun version should be pinned?

**Decision:** Pin to specific version (1.3.5)

### Should the workflow also run on branches other than `main`?

**Decision:** Push to `main` and PRs only


## Goals

(none)

## Blocked By

(none)

## Definition of Done

- [ ] One or more new tasks are created in .dust/tasks/
- [ ] Task's Goals section links to relevant goals from .dust/goals/
- [ ] The original idea is deleted or updated to reflect remaining scope
