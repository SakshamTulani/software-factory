---
name: project-workflow
description: "This project's lifecycle — which changes need a spec, the sf-spec → sf-plan → sf-build → sf-review → sf-ship path, approval gates, REQ ids, ADRs and where every artifact lives. Use when starting any feature, fix or refactor, or when unsure which step comes next."
---

# Workflow

The lifecycle skills in `.agents/skills/` come from sf-factory (an adapted fork of Addy Osmani's agent-skills), installed with the `skills` CLI and pinned by `skills-lock.json`. This skill sets which changes need which steps and where the artifacts live.

**Updating factory skills:** `DISABLE_TELEMETRY=1 npx -y skills@1.7.4 check` shows when sf-factory has newer versions; `npx -y skills@1.7.4 update` pulls them in, and the diff goes through a PR like any change. Don't edit a factory skill in place, because the next update overwrites it. To change one for this project only, copy it to a new name (`build-<client>`); to change it for every project, change it in sf-factory.

## Which path a change takes

| Change | Path |
|---|---|
| New module, new screen, new API or WS topic consumed, a change to what the user sees or can do | **Full**: spec → plan → build → review → ship |
| Bug fix, refactor, dependency bump with behaviour risk | **Light**: build (start with a failing test) → review |
| Docs, formatting, copy | Just the PR |

If you're unsure, take the full path.

## The full path

```
/sf-spec ──▶ [HUMAN approves spec] ──▶ /sf-plan ──▶ [HUMAN approves plan] ──▶
/sf-build (one task at a time, TDD, pnpm check green) ──▶ /sf-review ──▶ [HUMAN reviews PR] ──▶ /sf-ship
```

| Step | Skill | Writes |
|---|---|---|
| `/sf-spec` | `spec-driven-development` | `docs/specs/NNN-slug/spec.md` from [the template](../../../docs/specs/_template/spec.md), plus a row in [the index](../../../docs/specs/README.md) |
| `/sf-plan` | `planning-and-task-breakdown` | `docs/specs/NNN-slug/plan.md`; tasks go to the tracker ([issue-tracker.md](../../../docs/agents/issue-tracker.md)) |
| `/sf-build` | `incremental-implementation` + `test-driven-development` | code + tests, one task per commit |
| `/sf-review` | `code-review-and-quality` | review findings before the PR |
| `/sf-ship` | `shipping-and-launch` | release checklist |

**A new module starts with `/sf-spec`, not with scaffolding.** The spec settles the module's name, boundary, endpoints and WS topics. The plan's first task is `/sf-new-module <name>`, run during `/sf-build`.

**Gates are recorded in front matter.** `/sf-plan` does not start until `spec.md` says `status: approved`. `/sf-build` does not start until `plan.md` says `status: approved`. Only a human sets `approved`. Agents never approve their own work.

**Requirement ids.** Each success criterion in a spec is numbered `REQ-NNN` and never renumbered once approved; supersede it instead. Tasks cite the ids they advance, and tests are named after them (the project's testing skill, `frontend-testing` for frontend projects).

## Decisions

Write an ADR (`documentation-and-adrs`) in `docs/adr/` from [the template](../../../docs/adr/_template.md) when a decision is expensive to reverse: a library with lock-in, a data-flow or state pattern, a module boundary, a deliberate departure from the architecture skill. Add it to [the ADR index](../../../docs/adr/README.md).

## Git

Branches, commits, PRs and releases: [git.md](../../../docs/agents/git.md). Full path is `feat/<NNN-slug>`; light path is `fix/<slug>` and similar. Open PRs with `file-pr`.
