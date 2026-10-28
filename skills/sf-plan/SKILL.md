---
name: sf-plan
description: Break work into small verifiable tasks with acceptance criteria and dependency ordering
disable-model-invocation: true
---

Invoke the planning-and-task-breakdown skill.

Find the spec: the `docs/specs/NNN-slug/spec.md` named in `$ARGUMENTS`, or else the most recent spec in `docs/specs/README.md` with no plan. If its front matter is not `status: approved`, stop and say the spec needs human approval first.

Read the spec, the project's architecture skill (`frontend-architecture` for frontend projects) and the relevant code. Then:

1. Enter plan mode — read only, no code changes
2. Identify the dependency graph between components
3. Slice work vertically (one complete path per task, not horizontal layers)
4. Write tasks with acceptance criteria, verification steps and the `REQ-NNN` ids they advance. If the spec adds a module, task 1 is "Run `/sf-new-module <name>`"
5. Add checkpoints between phases
6. Present the plan for human review

Write the plan to `docs/specs/NNN-slug/plan.md` from `docs/specs/_template/plan.md` with `status: draft`. Publish its tasks as `docs/agents/issue-tracker.md` defines.

If that `plan.md` already exists with unchecked tasks, stop and ask before writing. Never silently overwrite an incomplete plan.

Then stop and say: a human must set `status: approved` on `plan.md` before `/sf-build` will run.
