# Guard watch mode against unhandled render failures

Watch mode registers an async callback in [index.ts](../../index.ts#L321). The returned promise is not explicitly observed. If `renderFile()` or any future code in that callback throws before converting the failure into `false`, the rejection can escape the `fs.watch()` callback path.

Pattern: fire-and-forget promise without explicit error handling.

Impact: unexpected render failures in watch mode can become unhandled promise rejections, which are easy to miss and can leave the process in a bad state while it appears to still be watching.

Suggestion: move the async body into a named handler and invoke it with `void handler().catch(...)`, or make the callback synchronous and call an async helper that always logs and contains its own failure path.

## Open Questions

### What should watch mode do after an unexpected render exception?

#### Log and keep watching
Report the failure loudly, then continue watching for the next file change. This matches the current "recover on next edit" workflow.

#### Stop the watcher
Exit after an unexpected exception so broken watcher state cannot linger silently. This is safer, but it makes transient issues more disruptive.
