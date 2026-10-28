# Writing a skill

Every distributable skill is `skills/<name>/SKILL.md`, with supporting files beside it. The `skills` CLI finds skills under `skills/` and installs each folder on its own into a project's `.agents/skills/<name>/`. Follow the anatomy of Addy's skills (`docs/skill-anatomy.md` in `addyosmani/agent-skills`).

## Front matter

```yaml
---
name: sf-new-module            # must equal the folder name
description: Scaffold a module … Use when a plan task says to run sf-new-module, or …
---
```

- Quote the `description` if it contains `: `. Unquoted, the front matter doesn't parse and the skill is skipped.
- The `description` is the router: Claude Code decides from it when to load the skill. Say what it does, then "Use when…".

## Names and invocation

| Kind | Name | Front matter |
|---|---|---|
| A step the user starts, or that changes state with a gate (`sf-spec`, `sf-plan`, `sf-build`, `sf-ship`, `sf-new-project` …) | `sf-` prefix, so it can't clash with Claude Code's built-in commands | `disable-model-invocation: true` |
| A step another skill runs (`sf-setup` from `sf-new-project`, `sf-new-module` from `sf-build`) | `sf-` prefix | no flag |
| Knowledge Claude loads by description (`frontend-architecture`, forked Addy skills) | plain name | no flag |

## Rules

- **Links are relative to the installed folder.** A skill sits at `.agents/skills/<name>/`, three levels below the project root. Link to another skill as `../<other>/file.md` and to a project file as `../../../docs/…`. Never link outside `skills/` to this repo's own files; they aren't installed.
- **A skill never calls `gh` or writes task files directly.** It says "publish to the tracker" or "fetch the ticket", and the project's `docs/agents/issue-tracker.md` defines what that means.
- **Rules that change over time go in a skill, not a template file.** Skills update with `skills update`; template files are copied once.
- **Interactive skills ask one question at a time** and lead with the recommended answer. Explore first, and skip any question the repo already answers.
- **Show a draft before writing** into a client repo.
- **End with a verification step** that proves the result.
- **A forked skill keeps its `LICENSE.txt`**, and its change goes in [docs/upstream.md](../upstream.md).
- **Adding a skill a template should install:** list it in that template's `skills.txt`.
