---
name: project-workflow
description: "This project's lifecycle — which changes need a spec, the sf-spec → sf-plan → sf-build → sf-review → sf-ship path, approval gates, REQ ids, ADRs and where every artifact lives. Use when starting any feature, fix or refactor, or when unsure which step comes next."
---

# Workflow

The lifecycle skills in `.agents/skills/` come from sf-factory (an adapted fork of Addy Osmani's agent-skills), installed with the `skills` CLI and pinned by `skills-lock.json`. This skill sets which changes need which steps and where the artifacts live.

**Updating factory skills:** on a branch, run `DISABLE_TELEMETRY=1 npx -y skills@1.7.4 update -y`, review `git diff .agents/skills skills-lock.json`, and merge it through a PR like any change. `skills check` in this CLI version applies updates too, so treat it the same way. Don't edit a factory skill in place, because the next update overwrites it. To change one for this project only, copy it to a new name (`build-<client>`); to change it for every project, change it in sf-factory.

## Which path a change takes

| Change | Path |
|---|---|
| New module, new screen, new API or WS topic consumed, a change to what the user sees or can do | **Full**: spec → plan → build → review → ship |
| Bug fix, refactor, dependency bump with behaviour risk | **Light**: `fix/<slug>` branch → `/sf-test` (failing test first) → `/sf-review` → `file-pr` |
| Docs, formatting, copy | Just the PR |

If you're unsure, take the full path.

## The full path

```
/sf-spec ──▶ [HUMAN approves spec] ──▶ /sf-plan ──▶ [HUMAN approves plan] ──▶
/sf-build (one task at a time, TDD, pnpm check green) ──▶ /sf-review ──▶ file-pr ──▶
[HUMAN reviews and merges PR] ──▶ /sf-ship (release candidate) ──▶ [HUMAN releases]
```

| Step | Skill | Writes |
|---|---|---|
| `/sf-spec` | `spec-driven-development` | `docs/specs/<slug>/spec.md` from [the template](../../../docs/specs/_template/spec.md), plus a row in [the index](../../../docs/specs/README.md) |
| `/sf-plan` | `planning-and-task-breakdown` | `docs/specs/<slug>/plan.md`; tasks go to the tracker ([issue-tracker.md](../../../docs/agents/issue-tracker.md)) |
| `/sf-build` | `incremental-implementation` + `test-driven-development` | code + tests, one task per commit |
| `/sf-review` | `code-review-and-quality` | review findings before the PR |
| `/sf-ship` | `shipping-and-launch` | release checklist |
| `file-pr` | `file-pr` | the PR (both PRs under `develop-main`), from the PR template |
| `/sf-retro` (optional) | `sf-retro` | after a session that was harder than it should have been: proposed checks, pointers and review rules; factory issues for factory skills. `/sf-retro 30d` monthly |

**Other commands**, any time: `/sf-test` (TDD on its own, the light path), `/sf-simplify` (simplify recent changes without changing behaviour), `/sf-constraints` (write or check `CONSTRAINTS.md`), `/sf-webperf` (performance audit), `/sf-transcribe` (save the session), `/sf-upstream` (read business and API context from upstream, or request a contract change), `/sf-setup` (switch tracker, git strategy, conversation log or upstream sources). `/sf-new-module` runs inside `/sf-build` when a plan task names it.

**A new module starts with `/sf-spec`, not with scaffolding.** The spec settles the module's name, boundary, endpoints and WS topics. The plan's first task is `/sf-new-module <name>`, run during `/sf-build`.

**Gates are recorded in front matter.** `/sf-plan` does not start until `spec.md` says `status: approved`. `/sf-build` does not start until `plan.md` says `status: approved`. Only a human sets `approved`. Agents never approve their own work.

**Names, not numbers.** Specs, branches and ADRs are named, never numbered from a shared counter, because two branches would take the same number and clash at merge. A spec is `docs/specs/<slug>/` and its branch `feat/<slug>`; an ADR is `docs/adr/YYYY-MM-DD-<slug>.md`. Older `NNN-` specs and ADRs keep their names.

**This repo records only its own decisions.** Specs and ADRs here cover what this project does: for a frontend, its screens, modules, state and how it calls the API. Business rules and the API contract live upstream (backend repos, OpenAPI, product docs, listed in [upstream.md](../../../docs/agents/upstream.md)) and are cited by link and SHA or version, never restated as our decision. When upstream lacks something, request it there with `sf-upstream`; never write the upstream's spec here.

**Requirement ids.** Each success criterion is numbered `REQ-1`, `REQ-2` … within its spec, and cited as `<slug>/REQ-<n>` outside the spec's folder. Ids are never renumbered once approved; supersede instead. Tasks cite the ids they advance, and tests are named after them (the project's testing skill, `frontend-testing` for frontend projects).

## What a person always reads

Agents implement, check and review; a person decides. Beyond approving the spec and plan, a person reads before merge, and `pr-guard.yml` makes them tick a box for it:

- **any change to an existing test.** An agent can rewrite an assertion to fit broken code. New tests don't need this.
- **any change to a load-bearing path** (`factory.json` `loadBearing`): the shared HTTP client, socket, config, app wiring and the guardrails themselves. `/sf-review` also runs the `critic` agent on these.

Agents never merge, never push to `main` or `develop`, and never skip hooks (`.claude/hooks/guard-git.sh`). Edits to the guardrails (lint, architecture and test config, `.claude/`, `AGENTS.md`, `CONSTRAINTS.md`) ask the user first. So do edits to any load-bearing path or to `factory.json`, unless an approved plan task names that path; `.claude/hooks/guard-load-bearing.sh` asks on every such edit in projects that have it.

**Checks by cost:** the Stop hook runs `pnpm check:fast` after every turn; each task commits on a green `pnpm check`; CI runs `pnpm check` and the build; `/sf-review` runs `pnpm check:deep` when a load-bearing path changed, and proves new tests fail without the change (`prove-test.sh`).

## Decisions

Write an ADR (`documentation-and-adrs`) in `docs/adr/` from [the template](../../../docs/adr/_template.md) when a decision is expensive to reverse: a library with lock-in, a data-flow or state pattern, a module boundary, a deliberate departure from the architecture skill. Add it to [the ADR index](../../../docs/adr/README.md).

## Git

Branches, commits, PRs and releases: [git.md](../../../docs/agents/git.md). Full path is `feat/<slug>`; light path is `fix/<slug>` and similar. Open PRs with `file-pr`.
