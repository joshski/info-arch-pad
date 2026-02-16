# Test image upload

The dust framework supports image uploads when creating ideas via its UI. This idea was created as a test of that functionality — the entire idea description was a screenshot image (`Screenshot 2026-02-12 at 17.04.17.png`) uploaded via the "Add Idea" dialog and referenced as an asset (`/assets/4f8789fa-25bd-4677-9832-cd2dfcb4c843`).

Currently, when an idea's description consists solely of an uploaded image, the asset reference may not resolve correctly for downstream consumers (e.g., agents processing the task). The `bunx dust check` lint step flags the asset path as a broken link, which means image-only idea descriptions cannot pass validation.

This surfaces a broader question about how the dust framework handles image assets in idea and task files, and whether the info-arch-pad project needs to account for image content in its workflows.

## Open Questions

### Should dust asset references be excluded from broken-link validation?

#### Exclude asset paths from link checking
Asset paths like `/assets/<uuid>` are managed by the dust UI and may only be resolvable within that context. The markdown linter should recognize these as a special case and skip validation.

#### Require assets to exist on disk
If assets are expected to be committed to the repository or stored locally, the linter is correct to flag missing ones. This would require a convention for where assets live (e.g., a `.dust/assets/` directory).

### How should agents handle image-only idea descriptions?

#### Treat images as opaque — rely on the title
When an idea's description is only an image, the agent should work from the title alone and note that the visual context was unavailable. This is the current practical outcome.

#### Require a text description alongside images
Enforce that image uploads are supplementary, not the sole description. This would ensure agents and text-based consumers always have actionable context.

### Is this idea a one-off test or does it point to a real workflow need?

#### One-off test — no further action needed
The user was simply verifying that image upload works. The idea can be closed after confirming the behavior and documenting any issues found.

#### Real workflow need — support image-rich ideas
Users of info-arch-pad may want to capture screenshots of existing site architectures or whiteboard sketches as ideas. This would require robust image handling in the dust pipeline.
