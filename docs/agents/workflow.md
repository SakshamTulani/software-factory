# Workflow

The factory follows the lifecycle it ships ([`project-workflow`](../../skills/core/project-workflow/SKILL.md)), with the same full and light paths.

- **Full path:** a new skill or template, or any change to a template's architecture, enforcement or lifecycle skills. Every project receives it at its next update, so it gets a spec and an ADR.
- **Light path:** a wording fix in a skill, or a template bug.

## Before merging

1. Every `skills/*/SKILL.md` has front matter that parses, and `name` equals its folder.
2. Every skill a template lists in `skills.txt` exists.
3. Install from the working copy into a throwaway project and check the result:

```bash
cd "$(mktemp -d)" && git init -q
DISABLE_TELEMETRY=1 npx -y skills@1.7.4 add /path/to/sf-factory -a claude-code codex -y -s $(grep -v '^#' /path/to/sf-factory/skills/factory/sf-new-project/templates/frontend/react-rspack/skills.txt)
ls .agents/skills && cat skills-lock.json
```

## Releasing

Merge to `main`. Projects take the change with `npx -y skills@1.7.4 update` on a branch, as a reviewed PR. `skills check` in 1.7.4 applies updates as well, so it can't serve as a read-only CI gate.
