---
status: accepted
date: 2026-10-28
deciders: sakshamtulani
superseded-by:
---

# 0010. Distribute the factory with the skills CLI, not a Claude plugin

Supersedes [0007](0007-fork-addy-skills-into-every-project.md). Keeps its fork of Addy's skills; changes how the fork and the factory skills reach a project.

## Context

ADR 0007 copied a project kit into each project once. That kept projects safe from upstream changes, but factory fixes never reached existing projects either. The factory itself was a private Claude Code plugin, which needed a marketplace, managed settings and per-machine installs, worked only in Claude Code, and updated for everyone at once when auto-update was on. Intellicar teams already use the `skills` CLI (`vercel-labs/skills`): skills committed in `.agents/skills/`, pinned by `skills-lock.json`, updated with an explicit `skills update`.

## Decision

- Everything distributable is a skill under `skills/` in this repo, the private `SakshamTulani/sf-factory`. Projects install it with `npx -y skills@1.7.4 add SakshamTulani/sf-factory`, using each developer's own git access.
- `sf-new-project` is installed globally. It carries the templates, design systems and `common/` files in its own folder, copies them, and installs the skills the chosen template lists in `skills.txt` at project scope.
- Installed skills are committed. A project changes only when someone runs `npx -y skills@1.7.4 update`, and the diff is reviewed in a PR.
- Commands become user-invoked skills, and everything we ship gets an `sf-` prefix (`/sf-spec`, `/sf-build`, `/sf-new-project` …), so names can't clash with Claude Code's built-ins.
- Rules that will change (architecture, testing, workflow) are skills, so they update too. Template files stay for what tools need as files: configs, CI workflows, the Stop hook, subagent personas.
- The template ships a Stop hook that refuses to end a turn while `pnpm check` is red. We don't add Addy's session-start router hook: Claude Code already routes skills from their descriptions, and the hook would add a second router plus about 2,500 tokens to every session.

## Alternatives considered

- **Keep the Claude plugin.** Lost because it's Claude-only, needs a marketplace and managed settings, and pushes updates rather than letting each project pull them.
- **Copier for the whole project.** Lost for now because it needs Python and would add Jinja templating for a gain (updating template files) we may not need. Revisit if the template files change often.
- **GitHub template repos.** Lost because there are no questions at creation and no updates.

## Consequences

- Factory fixes reach existing projects as reviewable updates.
- Template files (configs, workflows, hooks, agents) still don't update after creation.
- Editing a factory skill inside a project gets overwritten by the next update; projects copy it to a new name instead.
- Pinning a project to a factory tag isn't documented by the CLI; projects pin by content hash in `skills-lock.json`, and update only on purpose.
- Developers need Node 22.20 or later and git access to this repo.
