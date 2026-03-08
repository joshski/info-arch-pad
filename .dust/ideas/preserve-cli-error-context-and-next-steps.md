# Preserve CLI error context and next steps

Several CLI paths flatten rich errors into generic messages. In [index.ts](../../index.ts#L265), a failed `readFileSync()` is reduced to `Could not read file` with no `ENOENT`, permission, or path detail. In [sitemap.ts](../../sitemap.ts#L17), HTTP failures become `Failed to fetch sitemap: <status>` without the URL or any recovery hint, and [index.ts](../../index.ts#L87) just echoes that generic message back to stderr.

Pattern: missing error context and non-actionable error messages.

Impact: users cannot tell whether they should fix a bad path, add a URL scheme, retry a transient network request, or inspect a server-side 404/500. Agents lose the original signal needed to choose a corrective action automatically.

Suggestion: keep the original error message or cause when available, include the failing path or URL, and add one next-step hint for common cases (for example, "check that the file exists" or "verify the sitemap URL returns XML").

## Open Questions

### Should the CLI standardize error formatting?

#### Add a shared formatter
Route file, network, parse, and render failures through one helper so every command includes the same level of detail and recovery guidance.

#### Improve only the worst offenders
Patch the read and sitemap code paths first, and leave the rest of the CLI messages as-is until they cause real confusion.
