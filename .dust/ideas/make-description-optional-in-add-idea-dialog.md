# Make description optional in "Add Idea" dialog

The "Add Idea" flow should not force users to enter a description. When creating a new idea via `bunx dust new-idea`, the agent template (`agent-new-idea.txt`) instructs the AI to "Write a brief description" as a numbered step. This makes it feel required, even though no validation enforces it. If the title is self-explanatory, a description adds unnecessary friction.

Currently, the dust library's idea validation (`validateIdeaOpenQuestions` in `dust.js`) only checks the structure of the `## Open Questions` section. It does not validate or enforce the presence of a description. The change would be in the template wording to make it clear that a description is optional.

This aligns with the **Easy to try** goal: reducing friction in the idea creation flow means fewer required fields and a lower barrier to capturing quick thoughts.

## Open Questions

### Should a description-less idea file have any placeholder text or just be empty after the title?

#### Empty after title
The file would just have the H1 heading followed by any optional sections. Cleanest approach and avoids noise.

#### Placeholder prompt
Include something like "_(No description provided)_" to signal the omission is intentional. Could help distinguish "forgot to add" from "chose not to add".

### Is this change scoped to the dust library template, or should the consuming project also adjust its workflow?

#### Upstream change in dust library only
Update `agent-new-idea.txt` in the `@joshski/dust` package to reword step 4 (e.g., "Optionally write a brief description..."). This is the source of the "forced" feeling.

#### Local project workaround
Override or supplement the template behavior in this project's `CLAUDE.md` or similar instructions. Less ideal since other dust users would still experience the same friction.
