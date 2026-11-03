---
name: sf-new-module
description: Scaffold a feature module under src/modules/ (ui, hooks, model.ts, module.tsx) with empty test stubs, and register it in src/app/modules.ts. Use when a plan task says to run sf-new-module, or when the user asks to add a module or screen.
---

# New module

Creates `src/modules/<name>/` with every layer from the `frontend-architecture` skill and nothing else. Behaviour comes later, test first, in the plan's next tasks.

A module is a feature: screens and rules. Its data comes from stores in `src/data/`. If the spec needs a backend domain no store covers yet, run `/sf-new-store` for it first.

## Inputs

- `<name>`: kebab-case, from the approved spec (`command-center`). If the user or task gives none, stop and ask.
- `<camel>` = camelCase of the name (`commandCenter`); `<Title>` = the spec's name for it (`Command center`).

Stop and ask if `src/modules/<name>/` already exists.

## Files

Follow `frontend-architecture` for every rule; this is the empty shape of it. `src/modules/command-center/` is the worked example.

```
src/modules/<name>/
├── ui/              .gitkeep, until a task adds a component
├── hooks/           .gitkeep, until a task adds a hook
├── model.ts         a comment saying it holds pure business rules; no functions yet
├── model.test.ts    one describe("<name> model") with a single it.todo("…")
├── module.tsx       export const <camel>Module: AppModule = { featureId: "<name>", title: "<Title>", routes: [] }
│                    (AppModule from "@/shared/lib/app-module")
└── index.ts         export { <camel>Module } from "./module"; nothing else yet
```

Never write a passing test with no assertion; the plan's tasks replace the todo.

## Register it

In `src/app/modules.ts`, import `<camel>Module` from `"@/modules/<name>"` and add it to the `modules` list. The router mounts it at `/<name>/*` and adds it to the navigation.

## Verify

Run `pnpm check`. It must be green: types compile, and `pnpm depcruise` accepts every import. Then report the files created. Under `sf-build`, commit them as the task's commit (`chore(<name>): scaffold module`).
