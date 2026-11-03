---
name: sf-new-store
description: Scaffold a backend domain under src/data/ (store class, mappers, types, builders, index) with empty test stubs, and register its store in createStores(). Use when a plan task says to run sf-new-store, or when a spec needs server data no existing store covers.
---

# New store

Creates `src/data/<name>/` with the shape from the `frontend-architecture` skill and nothing else. Queries, mutations and streams come later, test first, in the plan's next tasks.

A store follows a backend domain (the API's resource), not a screen. Check `src/data/` first: if an existing store already owns these endpoints, add to it instead and stop.

## Inputs

- `<name>`: plural, lowercase, after the backend resource (`alerts`, `geofences`). If the user or task gives none, stop and ask.
- `<singular>` = the singular (`alert`); `<Pascal>` = PascalCase of it (`Alert`).

Stop and ask if `src/data/<name>/` already exists.

## Files

`src/data/commands/` (plain REST) and `src/data/vehicles/` (REST plus a live socket stream) are the worked examples.

```
src/data/<name>/
├── types.ts                       a comment saying it holds entities; no types yet
├── <singular>Mappers.ts           import type only from ./types; wire types named Api<Entity>; no functions yet
├── <singular>Mappers.test.ts      describe("<singular>Mappers") with a single it.todo("…")
├── <singular>Store.ts             export const <singular>Keys = {} and export const TTL = {} at the top (exported, so
│                                  noUnusedLocals passes while empty), then export class <Pascal>Store extends
│                                  BaseCacheStore, taking { http: HttpClient; events: DataEvents } (add realtime only
│                                  when it streams), stored as protected readonly deps until the first API method
│                                  uses it (then private), with empty "Queries", "Mutations" and "API" sections
├── <singular>Store.test.ts        describe("<Pascal>Store") with a single it.todo("…")
├── testing.ts                     a comment saying only tests import it; no builders yet
└── index.ts                       export { <Pascal>Store, <singular>Keys } from "./<singular>Store"
```

Add `schemas.ts` with the first write: one zod schema per input type, `satisfies z.ZodType<Input>` (see `frontend-architecture`).

Never write a passing test with no assertion; the plan's tasks replace the todos.

## Register it

- In `src/data/stores.ts`, build it in `createStores()` beside the others, passing `http` and `events` (and `realtime` if it streams): `<name>: new <Pascal>Store({ http: deps.http, events })`.
- In `src/data/index.ts`, add `export * from "./<name>"`.

## Verify

Run `pnpm check`. It must be green: types compile, and `pnpm depcruise` accepts every import. Then report the files created. Under `sf-build`, commit them as the task's commit (`chore(<name>): scaffold store`).
