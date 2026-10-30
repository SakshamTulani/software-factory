---
name: sf-build
description: Implement tasks incrementally — build, test, verify, commit. Add "auto" to run the whole plan in one approved pass.
disable-model-invocation: true
---

Invoke the incremental-implementation skill alongside test-driven-development.

## Modes

- **`/sf-build [slug]`** — implement the *next* pending task of that spec's plan, then stop (careful, one slice at a time).
- **`/sf-build auto [slug]`** — implement *every* remaining task of an approved plan without stopping between them.

`$ARGUMENTS` selects the mode and the spec. Treat `auto` or `all` as autonomous mode; anything else is single-task mode. Autonomous mode is not faster *per task*: it runs the same test-driven loop and only removes the human stepping *between* tasks.

## Find the plan

1. The spec is `docs/specs/<slug>/` from `$ARGUMENTS`. Without one, use the spec in `docs/specs/README.md` whose `plan.md` has unchecked tasks. If there are several, ask which one.
2. **Both gates must be passed.** `spec.md` and `plan.md` must each have `status: approved` in front matter. If `spec.md` isn't approved, stop and say so. If `plan.md` is missing or not approved, stop and tell the user to run `/sf-plan` and approve it. Never approve on the user's behalf, and never invent requirements.
3. The next task is the first unchecked task in `plan.md`'s `## Tasks` list. Read it as published in the tracker too (`docs/agents/issue-tracker.md`) for any comments.

## Default: one task

1. Read the task's acceptance criteria and the `REQ-<n>` ids it cites.
2. **If the task says to run `/sf-new-module <name>`, run that skill**, then run `pnpm check` and go to step 7. Scaffolding has no behaviour of its own to test first.
3. Load relevant context: the project's architecture skill (`frontend-architecture`), existing code, patterns, `types.ts`.
4. Write a failing test for the expected behaviour, named after its requirement (RED).
5. Implement the minimum code to pass it (GREEN).
6. Run `pnpm check`. It covers typecheck, lint, dependency-cruiser and the full test suite; the Stop hook only runs `pnpm check:fast` (tests related to changed files), so the full check here is what lets a task commit. Never weaken a rule, skip a test, edit an existing test to fit the code or add a suppression to get it green; stop and ask instead.
7. Commit with a Conventional Commit message and the trailers `Spec: <slug>` and `Task: <n>`. Stage only the files the task touched.
8. Tick the task in `plan.md`, mark it done in the tracker as `docs/agents/issue-tracker.md` defines, and stop.

## Autonomous: the whole plan (`/sf-build auto`)

1. **Gates.** As in "Find the plan": both `spec.md` and `plan.md` must be `approved`. Autonomous mode skips the human stepping between tasks, never the approval gates.
2. **Establish a clean baseline.** Run `git status --porcelain`. If there are uncommitted changes outside `docs/specs/<slug>/`, stop and ask the user to commit, stash, or confirm how to handle them. Per-task commits must not absorb unrelated local work.
3. **Execute every unchecked task in plan order.** Run the default loop above for each one: one task, one commit, so any point is a clean rollback.
4. **Stop and ask the user** (do not push through) when:
   - `pnpm check` can't be made green without an obvious fix → follow debugging-and-error-recovery
   - the spec is ambiguous, or a task needs a decision the spec doesn't cover
   - a task is high-risk or irreversible — auth or permission changes, destructive data migrations, payments, deletions, deploys, anything touching secrets, **or anything you can't undo with `git revert`** → follow doubt-driven-development and get explicit sign-off before continuing
   - `pnpm check` has been red after two fix attempts on the same task. A third attempt at volume is how a wrong assumption gets built in
   - a task would change a path in `factory.json` `loadBearing`, unless the approved plan names that path in the task
   - a task's diff passes 400 changed lines (`git diff --shortstat`): the task is bigger than the plan said, so it needs re-slicing
   - a task needs an existing test changed, renamed or deleted

   After the user resolves a blocker, they re-run `/sf-build auto`, which resumes from the next unchecked task.
5. **Summarise at the end:** tasks completed, tests added (with their `REQ` ids), commits made, and anything skipped, flagged or left for the user.

If any step fails, follow the debugging-and-error-recovery skill.
