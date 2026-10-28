---
name: file-pr
description: File a concise pull request. Use when the user asks to file, open, or create a PR.
---

# File PR

Which PRs to open comes from [`docs/agents/git.md`](../../../docs/agents/git.md), written by `/sf-setup`. Read it first. This repo serves one client, so there are no client branches.

| Strategy in `git.md` | Branch | PRs to open |
|---|---|---|
| `develop-main` | `feat/` `fix/` `chore/` `refactor/` `perf/` `docs/` | PR 1 into `develop` (real), and PR 2 into `main` as a **draft** that links PR 1 |
| `develop-main` | `hotfix/` | into `main`, and a second PR into `develop` |
| `develop-main` | `merge/` | into `develop` only |
| `main` | any allowed prefix | one PR into `main` |

If the branch name fits no row, stop and ask; `pr-guard-flow` would reject it.

Before filing:

1. Check which of those PRs already exist: `gh pr list --head <branch> --state all`. Open only the missing ones; update an open one instead of opening another.
2. Run `pnpm check`. If it fails, stop and report; never file a red PR.
3. Review the diff against each PR's base (`origin/develop` or `origin/main`) to make sure its contents match the goal, and nothing unrelated came along.

PR titles usually become commit messages. Use `type(scope): summary` (types `feat`, `fix`, `chore`, `refactor`, `perf`, `docs`, `hotfix`, `enhance`, `test`, `style`, `build`, `ci`, `revert`; lowercase scope = module) and look at recently merged PRs for examples. Prefer a concise, human-readable title that explains why the change matters:

BAD

> ❌ perf(live-tracking): batch websocket deltas with requestAnimationFrame

GOOD

> ✅ perf(live-tracking): stop the map stuttering when 500 vehicles update at once

Open the description with a simple explanation of the problem based on the user's original prompt, then briefly explain the solution. Do not lead with an implementation inventory:

BAD

> ❌ Moved liveInfo merge from CommandCenterStore into commandCenterMappers, added applyLiveInfoDeltas, switched useVehicleLiveInfo to select, set structuralSharing false on the liveInfo query.

GOOD

> ✅ Every vehicle card re-rendered whenever any vehicle moved, so the panel lagged on large fleets. Each card now re-renders only for its own vehicle.

Write the body into the sections of [`.github/pull_request_template.md`](../../../.github/pull_request_template.md): Summary (with the Ticket and Spec lines), Changes, Screenshots (UI only, else delete), How to test, Backend, Checklist. On the full path, the Spec line names `docs/specs/NNN-slug/` and the `REQ` ids the PR covers. A main PR fills the "Develop PR" line with PR 1's link. Keep the two backend checkbox lines word for word, because `pr-guard.yml` reads them. Never tick "Backend change is live in production" yourself.

Pass `--base <base>` and `--assignee @me` on every `gh pr create`, and `--draft` for a feature branch's main PR. Do not add labels, and do not merge, approve or mark a draft ready; a human does that.

When the project's tracker is GitHub or hybrid (`docs/agents/issue-tracker.md`), put `Closes #<issue>` in the Summary so merging closes the issue.
