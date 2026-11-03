---
status: accepted
date: 2026-11-03
deciders: sakshamtulani
superseded-by:
---

# 0024. A store-first data layer over a shared cache, separate from the UI

## Context

ADR 0003 put every store's data in a TanStack Query cache and 0019 built one store per module through a React `Provider`. A value passed through six layers on its way to a component (api, mappers, repository, store, the TanStack cache, a hook), and the store only worked through React: it exposed `queryOptions`, and only a `Provider` could build it. The goal is a data layer in plain TypeScript, so the UI framework can be swapped without touching it, that stays easy to test. Two needs came up in review. Several features read the same backend data, so a store per module duplicated caches and sockets. A write in one store sometimes changes data another store caches. Intellicar's earlier frontend already had a store-owned cache library (about 800 lines, `QueryCache`, `QueryObserver`, `BaseCacheStore`), and each new project would otherwise write its own.

## Decision

- **`src/data/` is the data layer**, one folder per backend domain (`<domain>Store.ts`, `<domain>Mappers.ts`, `types.ts`, `testing.ts`, `index.ts`). It imports no React, UI library, app state or feature. Outside it, code imports only `@/data`.
- **A store is a class extending `BaseCacheStore`.** It combines the old api and repository layers. In file order: `<domain>Keys` and `TTL` constants, public queries (`get<X>()` returning a `QueryObserver`), public mutations that invalidate what they change, private live streams, then private API methods, one per endpoint, HTTP only. Mappers stay a separate file of pure functions.
- **The cache is copied into the template** at `src/data/core/` from the earlier frontend's library (commit 56ecc9d, 2026-10-22), with its React hooks at `src/bindings/react/`. Changes from the source are listed in `src/data/core/index.ts`: GC timers no longer remove a query a component re-mounted under StrictMode, `any` became `unknown`, and an axios cancellation counts as an abort. TanStack Query and Zustand are removed from the template.
- **Only the store that owns a query invalidates it.** A write that affects another domain emits a typed event from `src/data/events.ts`; the owning store listens in its constructor and invalidates its own query. A store that reads another store's data receives it in its constructor. `createStores()` builds every store around one event bus.
- **Live data** is a query with `ttl: Infinity` whose `onSubscribe` fetches a snapshot, then opens one socket topic per item, buffers deltas and applies them in one update per flush. It refetches on reconnect and when it is watched again, and closes its topics when the last watcher leaves.
- **Write inputs have a zod schema** in the domain's `schemas.ts`, typed against `types.ts`. Mutations parse with it before posting; form hooks in modules validate with it (extending it for form-only rules) and components show its messages.
- **App state** (what the user picked, such as the selected fleet) lives in `src/state/` as plain `State<T>` values, not in a store. Hooks pass it to stores as arguments. View state stays in `useState`.
- **`src/bindings/react/`** is the only React code that knows about stores and state: `DataProvider`, `useStores`, `useAppState`, `useQuery`, `useQuerySelector`, `useMutation`, `useInfiniteQuery`, `useValue`. Modules keep `ui → hooks → model.ts`; components may import entity types only.
- **New skill `sf-new-store`** scaffolds a domain; `sf-new-module` scaffolds only a feature. `frontend-architecture`, `frontend-testing` and `.dependency-cruiser.cjs` describe and enforce the layout.
- **The template ships a worked example**: the `commands` and `vehicles` domains talking through `command/sent`, the selected fleet kept in the URL, and a `command-center` module reading both, with tests of every kind. Projects replace it.

## Alternatives considered

- **Keep TanStack Query behind the stores.** Lost because its cache and `queryOptions` tie the store to React Query's API, and the layers it needed are what this change removes. `@tanstack/query-core` alone would still be a second cache beside the one Intellicar already runs.
- **Stores inside each feature module.** Lost because features share backend data; one store per domain gives one cache and one socket stream, and cross-feature imports of stores would break the module boundary.
- **Stores in `src/shared/`.** Lost because `shared/` is infrastructure with no domain knowledge; domain stores are a layer of their own.
- **A store calls another store's `invalidate` directly.** Lost because the writer would need to know who caches what, and two stores invalidating each other form an import cycle. Events keep each store responsible for its own cache.
- **Selected fleet inside a data store.** Lost because a store that knows a "current" fleet can't show two fleets, must reset its cache on every switch, and needs the selection set up in every test.
- **Signals or a reducer/event store** in place of the cache. Lost because they mean writing and maintaining a new cache, when a working one exists.

## Consequences

- Supersedes ADR 0003 and ADR 0019. ADR 0004 still holds: data never imports business logic. ADR 0013's note that stores import `@tanstack/react-query` no longer applies.
- `AppModule` loses `Provider`; `AppDeps` and `ModuleProviders` are gone. `renderWithProviders` builds real stores over MSW with the fake socket and takes `route`, `appState` and `flushMs` instead of `modules`.
- Store tests use the real `httpClient` through MSW instead of a fake repository, and start queries with `observer.mount()`.
- The cache is now the factory's to maintain. A fix belongs in the template too, and in the earlier frontend if it still uses the library.
- `factory.json` `loadBearing` adds `src/data/core/**`, `src/data/events.ts`, `src/data/stores.ts` and `src/bindings/**`, and drops `src/app/queryClient.ts`.
- Existing projects are not migrated by this decision: the skills describe the new shape, and their template files stay as they were copied.
