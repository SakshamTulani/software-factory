---
name: sf-new-module
description: Scaffold a module under src/modules/ with every layer from the frontend-architecture skill, empty test stubs and its index.ts. Use when a plan task says to run sf-new-module, or when the user asks to add a module.
---

# New module

Creates `src/modules/<name>/` with every layer and nothing else. Behaviour comes later, test first, in the plan's next tasks.

## Inputs

- `<name>`: kebab-case, from the approved spec (`command-center`). If the user or task gives none, stop and ask.
- `<camel>` = camelCase of the name (`commandCenter`); `<Pascal>` = PascalCase (`CommandCenter`).

Stop and ask if `src/modules/<name>/` already exists.

## Files

Follow the `frontend-architecture` skill for every rule; this is the empty shape of it.

```
src/modules/<name>/
├── types.ts                         export type <Pascal>Placeholder = never   (replace with the spec's entities)
├── model.ts                         import type only from ./types; no functions yet
├── api/<camel>Api.ts                imports only from @/shared/api; DTO types named Api<Entity>
├── mappers/<camel>Mappers.ts
├── mappers/<camel>Mappers.test.ts
├── repository/<camel>Repository.ts
├── repository/<camel>Repository.test.ts
├── realtime/<camel>Socket.ts
├── store/<camel>Store.ts            the keys object + a class taking { qc, repo, socket }
├── store/<camel>Store.test.ts
├── hooks/<camel>StoreContext.tsx    the store's context: <Pascal>StoreProvider and use<Pascal>Store() (frontend-architecture)
├── ui/                              empty until a task adds a component
├── testing.ts                       test builders, one per entity as the spec adds them: build<Entity>(overrides), buildApi<Entity>(overrides)
├── module.tsx                       <Pascal>Provider builds the store from deps; export const <camel>Module: AppModule =
│                                    { featureId: "<name>", title: "<Title>", routes: [], Provider: <Pascal>Provider }
│                                    (AppModule, AppDeps from "@/shared/lib/app-module")
└── index.ts                         export { <camel>Module } from "./module"; nothing else yet
```

Each `*.test.ts` stub holds one `describe` naming the layer and a single `it.todo("…")`. Never write a passing test with no assertion; the plan's tasks replace the todos.

The empty `ui/` folder gets a `.gitkeep`. `testing.ts` starts with a comment saying what it is for and no exports.

## Register it

In `src/app/modules.ts`, import `<camel>Module` from `"@/modules/<name>"` and add it to the `modules` list. The router mounts it at `/<name>/*` and adds it to the navigation.

## Verify

Run `pnpm check`. It must be green: types compile, and `pnpm depcruise` accepts every import. Then report the files created. Under `sf-build`, commit them as the task's commit (`chore(<name>): scaffold module`).
