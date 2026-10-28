---
status: superseded
date: 2026-10-28
deciders: sakshamtulani
superseded-by: 0010
---

# 0007. Fork Addy's skills and copy them into every project

Supersedes [0001](0001-distribute-the-factory-as-a-plugin.md) and [0002](0002-use-addy-agent-skills-for-the-lifecycle.md) on how the lifecycle skills reach a project.

## Context

ADR 0002 installed `agent-skills@addy-agent-skills` directly, so every upstream change would reach every project. Two problems:

- Upstream changes we didn't choose would alter how our projects work.
- Addy's `/build auto` only looks for a spec at `SPEC.md`, `docs/SPEC.md` or under `spec/`, and assumes one `tasks/plan.md`. That doesn't fit our per-feature `docs/specs/NNN-slug/` layout.

## Decision

We forked `addyosmani/agent-skills` at `aeac41d` (v0.6.13) into `plugins/factory/project-kit/.claude/`, and adapted it to our conventions. `plugins/factory/project-kit/UPSTREAM.md` lists every change. `/factory:new-project` copies the kit into each new project's `.claude/`, so each project owns its lifecycle skills.

The factory plugin still provides `new-project`, `setup` and `new-module`. The approach taken from Matt and intqueuev2 in ADR 0002 is unchanged.

## Alternatives considered

- **Install Addy's plugin, pinned to a version.** Lost because pinning protects against upstream changes but still leaves us unable to change the skills, and the path problem remains.
- **Ship the fork in the factory plugin instead of copying it.** This is still available. It insulates projects from Addy, and our own fixes reach every project. It lost to the requirement that each project's skills don't change underneath it.

## Consequences

- Upstream fixes reach us only when we merge them, using the procedure in `UPSTREAM.md`.
- A fix to the factory's kit does not reach existing projects. Updating one is a deliberate copy, which `/factory:sync-kit` should automate later.
- Each project carries about 600 KB of skills, commands and references.
- A project may adapt its copy further. That divergence is allowed, and a sync has to respect it.
