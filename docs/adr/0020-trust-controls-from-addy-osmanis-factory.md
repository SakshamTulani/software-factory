---
status: accepted
date: 2026-10-30
deciders: sakshamtulani
superseded-by:
---

# 0020. Trust controls from Addy Osmani's factory

## Context

One agent writes the test and the code (ADR 0005), and the same session then reviews it. Nothing proved a new test exercises the change, nothing stopped an agent rewriting an existing test to match broken code, and nothing stopped it merging, force-pushing or editing the lint and architecture rules that hold it. Addy Osmani's `factory` (a reference software factory for unattended agents) addresses each of these with mechanical checks rather than instructions.

## Decision

Adopt these, adapted to interactive use and our develop + main flow:

1. **Prove new tests.** `prove-test.sh` (forked into `test-driven-development`) reverts the non-test part of a branch and fails if the new tests still pass. `/sf-review` runs it.
2. **A person reads changes to existing tests.** `pr-guard.yml` fails a PR that changes, renames or deletes an existing test file until "A person read the changes to existing tests" is ticked.
3. **Agents can't merge or bypass the guardrails.** `.claude/hooks/guard-git.sh` blocks `gh pr merge`, the merge API, plain force pushes, pushes to `main`/`develop`, merges or resets on them, and `--no-verify`. `--force-with-lease` and `git merge` on `merge/*` branches stay allowed, because our recipes use them. `settings.json` asks before any edit to `.claude/`, `.husky/`, workflows, Biome and dependency-cruiser config, `rstest.config.ts`, `CONSTRAINTS.md` and `AGENTS.md`; the hook asks before a shell write to them.
4. **Load-bearing paths.** `factory.json` `loadBearing` lists the shared HTTP client, socket, config, app wiring and the guardrails. `pr-guard.yml` requires a person's read of a PR touching them, read from the base branch so a PR can't edit its own list.
5. **Plans state their doubts.** `plan.md` gains "Least confident" (three decisions and what would show each wrong) and "Test list"; the first task after scaffolding is a tracer bullet; a migration spec names its oracle.
6. **A fresh-context verifier.** `/sf-review` spawns `code-reviewer` with the diff, the spec and the base, and none of the implementer's account. It re-runs the checks itself.
7. **More stops for `/sf-build auto`:** red twice on one task, a task over 400 changed lines, an unplanned load-bearing path, or a change to an existing test.
8. **Claim a spec by pushing its branch** before writing it; the first push wins.
9. **A `critic` agent** argues against load-bearing changes in `/sf-review`, and against plans and specs that touch load-bearing paths.
10. **Checks by cost.** The Stop hook runs `pnpm check:fast` (tests related to changed files), and runs the full check if `check:fast` is missing; each task commits on `pnpm check`; `pnpm check:deep` adds the build and `pnpm audit` for load-bearing changes.
11. **A periodic constraint review**, `/sf-retro 30d`: tighten the check behind each escaped bug, turn repeated review findings into checks, loosen only with a named run of evidence, and record decisions in `CONSTRAINTS.md`.

## Alternatives considered

- **Install Addy's factory.** Lost because it is built around unattended routines, a GitHub-label queue and his own spec gates, which overlap our lifecycle. We took its controls, not its orchestration.
- **Block edits to guardrail files outright, as Addy does.** Lost because `/sf-retro` adds checks to exactly those files with the user's approval; asking keeps the user in control without making the change impossible.
- **Run the test proof in CI.** Lost for now: reverting a whole PR proves that some test fails, not that each new test does. It belongs in review, per change.

Not taken: autonomy tiers (every project of ours is client production), the issue queue and triage dispositions, run records, review-queue back-pressure and the scheduled monitor. They matter once agents run unattended.

## Consequences

- A PR that edits an existing test or a load-bearing path waits for a person to read it and tick a box.
- `/sf-review` is slower: it re-runs the checks in a fresh context and proves the tests.
- Template files (`pr-guard.yml`, hooks, `settings.json`, `package.json` scripts) reach only new projects. Existing projects adopt them by hand; the skills work without them.
- `prove-test.sh` needs a clean, committed tree.
