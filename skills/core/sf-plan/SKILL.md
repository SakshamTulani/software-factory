---
name: sf-plan
description: Break work into small verifiable tasks with acceptance criteria and dependency ordering
disable-model-invocation: true
---

Invoke the planning-and-task-breakdown skill.

Find the spec: the `docs/specs/<slug>/spec.md` named in `$ARGUMENTS`, or else the approved spec in `docs/specs/README.md` with no plan. If there are several, ask which one. If its front matter is not `status: approved`, stop and say the spec needs human approval first.

Read the spec, the project's architecture skill (`frontend-architecture` for frontend projects) and the relevant code. Then:

1. Enter plan mode — read only, no code changes
2. Identify the dependency graph between components
3. Slice work vertically (one complete path per task, not horizontal layers)
4. Write tasks with acceptance criteria, verification steps and the `REQ-<n>` ids they advance. If the spec adds a module, task 1 is "Run `/sf-new-module <name>`". The next task is a tracer bullet: the thinnest end-to-end path, with fake data, proving the shape works. Keep each task under 400 changed lines, and name any `factory.json` `loadBearing` path a task must change
5. Write the test list (each test, its layer, the bug it catches) and the three decisions you are least confident about, each with what would show it's wrong
6. Add checkpoints between phases
7. If the plan changes a load-bearing path, run the `critic` agent on it and include its output
8. Present the plan for human review

Write the plan to `docs/specs/<slug>/plan.md` from `docs/specs/_template/plan.md` with `status: draft`. If the project's template predates the "Least confident" and "Test list" sections, add them anyway. Publish its tasks as `docs/agents/issue-tracker.md` defines.

If that `plan.md` already exists with unchecked tasks, stop and ask before writing. Never silently overwrite an incomplete plan.

Then stop and say: a human must set `status: approved` on `plan.md` before `/sf-build` will run.
