---
name: frontend-architecture
description: The folder layout, import rules, data flow (stores in src/data → bindings → hooks → ui), how stores cache, stream and talk to each other, where app state lives, and naming for react-rspack projects. Use when writing, moving or reviewing any code under src/, or when pnpm depcruise fails.
---

# Architecture

Every rule on this page that can be checked is checked by `pnpm depcruise` ([.dependency-cruiser.cjs](../../../.dependency-cruiser.cjs)). If a rule here and the config disagree, the config wins. Fix this page.

The template ships a worked example of everything below: the `commands` and `vehicles` domains in `src/data/`, the selected fleet in `src/state/`, and the `command-center` module. Read it before writing a store or a module. Replace it with the project's own domains as the first specs land.

## Source layout

```
src/
├── app/          # composition root: builds stores and app state once, mounts modules, router
├── bindings/
│   └── react/    # the only React code that knows about stores and app state
├── data/         # server state, plain TypeScript, one folder per backend domain
│   ├── core/     # the shared cache: QueryCache, QueryObserver, BaseCacheStore
│   ├── events.ts # what stores tell each other after a write
│   ├── stores.ts # createStores(): builds every store around one event bus
│   ├── index.ts  # the data layer's public API: everything outside data/ imports "@/data"
│   └── <domain>/ # commands/, vehicles/, …
├── state/        # app state: what the user picked (selected fleet), plain TypeScript
├── modules/      # features: one folder per product area (command-center, live-tracking, …)
├── shared/       # infrastructure with no domain knowledge: api, realtime, ui, lib
└── main.tsx
```

`data/` and `state/` import no React, no UI library and nothing from `modules/`, `app/` or `bindings/`. Swapping the UI framework replaces `bindings/` and the modules' `ui/` and `hooks/`; `data/` and `state/` stay as they are.

## A domain: store, mappers, types

```
data/<domain>/
├── <domain>Store.ts        # one class per backend domain, extends BaseCacheStore
├── <domain>Mappers.ts      # wire types (Api<Entity>) and pure conversion both ways
├── <domain>Mappers.test.ts
├── schemas.ts              # zod schemas of valid write inputs, typed against types.ts
├── <domain>Store.test.ts
├── types.ts                # entities, no logic
├── testing.ts              # buildApi<Entity>() builders; only tests import it
└── index.ts                # what the rest of the app may use
```

Domains follow the backend, not the screens. Many features read vehicles, so one `VehicleStore` serves all of them, with one cache and one socket stream. Add a domain with `/sf-new-store <name>`.

| File | May import |
|---|---|
| `<domain>Store.ts` | its mappers and types, `../core`, `../events`, another domain's `index.ts`, `@/shared/api`, `@/shared/realtime` |
| `<domain>Mappers.ts` | its `types.ts` only |
| `schemas.ts` | `zod` and its `types.ts` only |
| `types.ts` | nothing |
| `core/` | nothing outside `core/` |

### The shape of a store

A store file reads top to bottom: constants, constructor, queries, mutations, live, then the private API.

```ts
// data/commands/commandStore.ts
export const commandKeys = {                       // every cache key; invalidateQueries takes these or a prefix
  commands: (fleetId: string, vehicleId: string) => ["commands", fleetId, vehicleId] as const,
  history: (fleetId: string, vehicleId: string) => ["commands", "history", fleetId, vehicleId] as const,
}
const TTL = { commands: 30_000, history: 15_000 }   // how long each read stays fresh

export class CommandStore extends BaseCacheStore {
  constructor(deps: CommandStoreDeps) { super(); this.deps = deps }

  // ── Queries: cached reads, wire → entity ──
  getCommands(fleetId: string, vehicleId: string): QueryObserver<Command[]> {
    return this.queryCache.getQuery(
      commandKeys.commands(fleetId, vehicleId),
      async ({ signal }) => (await this.listCommandsByVehicle(fleetId, vehicleId, { signal })).map(toCommand),
      { ttl: TTL.commands }
    )
  }

  // ── Mutations: write, then invalidate ──
  async sendCommand(input: SendCommandInput): Promise<void> {
    await this.sendCommandToVehicle(toApiSendCommand(input))
    this.invalidateQueries(commandKeys.history(input.fleetId, input.vehicleId))  // its own query
    this.deps.events.emit({ type: "command/sent", ...ids })                       // other stores' data
  }

  // ── API: one method per endpoint. HTTP only; wire types in and out ──
  private listCommandsByVehicle(fleetId: string, vehicleId: string, opts: { signal: AbortSignal }) {
    return this.deps.http.post<ApiCommand[]>("/commands/listcommandsbyvehicle", { fleetid: fleetId, vehicleid: vehicleId }, opts)
  }
}
```

- **Queries** are public `get<X>(args)` methods returning a `QueryObserver<T>`. The same arguments return the same observer, so every caller shares one cache entry. Pass `signal` to the API method so a forced refetch cancels the old request.
- **Mutations** are public `<verb><X>(input)` methods returning a Promise. They invalidate what they change. Components and hooks never invalidate.
- **API methods** are private, one per endpoint, named after it. They call `this.deps.http` and return wire types. Nothing else in the store calls `http`.
- **Live streams** are private and start from a query's `onSubscribe` (below).
- Deps come through the constructor. No store singletons; `createStores()` builds them.

### The cache

`src/data/core/` is the cache every project shares. Don't write another, and don't add TanStack Query or Zustand.

- `getQuery(key, fetcher, { ttl, gcTime, onSubscribe, onUnsubscribe })` returns the observer for `key`, creating it once.
- An observer starts fetching when the first watcher mounts it (`mount()`), if its data is older than `ttl`. Concurrent fetches share one request.
- `invalidateQueries(prefix)` refetches watched queries under the prefix and drops unwatched ones.
- After the last watcher leaves, the observer is removed after `gcTime` (default 2 min).
- `setQueryData(key, …)` on a key nobody has asked for creates a placeholder that never fetches. Write socket data with `observer.setData()` on the observer from your own `get<X>()`.

A fix to `core/` is a factory change: make it in the template too, so every project gets it.

### Live data: REST snapshot, then socket deltas

A live query is an ordinary query with `ttl: Infinity` (the socket keeps it fresh), plus `onSubscribe`/`onUnsubscribe` that open and close its socket topics. Components never touch the socket.

```ts
getLiveInfo(fleetId: string): QueryObserver<LiveInfoMap> {
  return this.queryCache.getQuery(vehicleKeys.liveInfo(fleetId), fetchSnapshot, {
    ttl: Number.POSITIVE_INFINITY,
    onSubscribe: () => this.streams.set(fleetId, this.streamLiveInfo(fleetId)),
    onUnsubscribe: () => { this.streams.get(fleetId)?.(); this.streams.delete(fleetId) },
  })
}
```

`streamLiveInfo` in `data/vehicles/vehicleStore.ts` is the pattern to copy:

1. **Snapshot first, then topics.** Fetch the snapshot, then subscribe one topic per item in it, so no delta lands before the data it patches. Force the fetch if data is cached: the topics were closed while nobody watched.
2. **Buffer, then flush.** Each message is parsed by a mapper (`toLiveInfoDelta`) into a `pending` map keyed by id. A timer started by the first message (`flushMs`, default 1000) applies all of `pending` in one `setData`.
3. **Merge without touching unchanged items.** The mapper's merge (`mergeLiveInfo`) keeps the object of every item without a delta, so a component selecting one item re-renders only when it changes.
4. **Reconnect means refetch.** On socket status inactive → active, refetch the snapshot and re-sync topics; messages sent while it was down are lost.
5. **Cleanup** closes every topic and clears the timer. It runs when the last watcher leaves.

### Stores talk through events

**Only the store that owns a query invalidates it.** When a write in one store changes data another store caches, the writer emits an event from `data/events.ts`; the owner listens in its constructor and invalidates its own query.

```ts
// CommandStore.sendCommand
this.deps.events.emit({ type: "command/sent", fleetId, vehicleId, commandId })

// VehicleStore constructor
deps.events.on("command/sent", (e) => this.invalidateQueries(vehicleKeys.vehicle(e.fleetId, e.vehicleId)))
```

- Add a new event to the `DataEvent` union: past tense, `<domain>/<what happened>`, carrying ids, not data.
- A store that needs to **read** another store's data receives that store in its constructor, wired in `createStores()`. One direction only; a cycle fails `no-circular`.
- `createStores()` builds every store around one `DataEvents`. Tests call it too, so events work there.

### Write inputs, schemas and forms

Each write input (`SendCommandInput`) is a type in `types.ts` and a zod schema in the domain's `schemas.ts`, written `satisfies z.ZodType<SendCommandInput>` so the two can't drift. The schema validates the entity (`Date`, numbers), not the wire format; the mapper still converts to wire.

- **The store parses before it posts.** A mutation starts with `const valid = sendCommandInputSchema.parse(input)`, so a bad input never reaches the server, whoever called it.
- **The form validates with the same schema.** A form hook in the module (`use<Feature>Form.ts`) holds the field values, turns them into the input (strings to numbers and dates), runs `schema.safeParse`, and returns errors per field plus a `submit` that calls the write hook. The component renders the fields and those errors and nothing else.
- **Form-only rules extend the schema in the hook**, never in `data/`: `sendCommandInputSchema.extend({ … })` or `.refine(…)` for a confirm field or a cross-field check only this form has.
- Messages in a schema are written for the user ("Choose a vehicle."), because forms show them as they are.

```ts
// modules/<module>/hooks/useSendCommandForm.ts
const result = sendCommandInputSchema.safeParse({ fleetId, vehicleId, commandId: Number(commandId), validTill })
if (!result.success) return setErrors(z.flattenError(result.error).fieldErrors)
await send.mutateAsync(result.data)
```

## App state: what the user picked

`src/state/` holds choices more than one screen needs and that decide which data to show: the selected fleet, a date range, filters that change what's fetched. Each is a `State<T>`, built by `createAppState()`.

- Stores never read app state. Hooks read it and pass the value as an argument: `vehicles.getLiveInfo(fleetId)`. A store keyed by argument can show two fleets at once and needs no setup in tests.
- Switching fleet needs no coordinator. The hook asks for a different key; the old query loses its last watcher, which closes its topics.
- A value worth a URL (the fleet) is kept in step with it by a small adapter in `app/` (`syncFleetWithUrl.ts`).
- View state that only one component cares about (a dropdown open, a hovered row) stays in `useState`.

## Bindings

`src/bindings/react/` is the only React code that knows about stores and app state.

| Export | Use |
|---|---|
| `DataProvider` | `app/App.tsx` renders it once with `createStores()` and `createAppState()`; `src/test/render.tsx` with fresh ones per test |
| `useStores()`, `useAppState()` | inside hooks only |
| `useQuery(observer)` | `{ data, error, isLoading, isPending, dataUpdatedAt, refetch }`; mounts the observer while the component is mounted |
| `useQuerySelector(observer, select)` | one slice; re-renders only when it changes. `select` must return a stored reference, never a new object |
| `useMutation(fn)` | `{ mutate, mutateAsync, isPending, error }` for a store mutation |
| `useInfiniteQuery(observer)` | paged reads from `getInfiniteQuery` |
| `useValue(state)` | the current value of a `State<T>` |

Code outside React (a test, another framework) calls `observer.mount()` to start a query and `observer.unmount()` when done; `observer.subscribe()` only listens.

## A module: ui, hooks, model.ts

```
modules/<module>/
├── ui/          # components: render and handle input, nothing else
├── hooks/       # data hooks, business hooks, write hooks, state hooks
├── model.ts     # pure business rules over entity types
├── module.tsx   # an AppModule: featureId, title, routes
└── index.ts     # the module's public API
```

| Layer | May import |
|---|---|
| `ui` | its `hooks`, `model`, other `ui`; entity types from `@/data` (type-only); `@/shared` |
| `hooks` | `@/bindings/react`, `@/data`, its `model` |
| `model.ts` | entity types from `@/data` (type-only) |

- Components get data only through hooks. They never import `@/bindings` or call a store.
- **Data hooks** wrap one query: `useQuery(useStores().commands.getCommands(fleetId, vehicleId))`.
- **Business hooks** apply `model.ts` to data hooks' results. Data never imports business logic: stores and mappers never import `model.ts`. A rule two modules share moves to `data/<domain>/rules.ts`, which only hooks import.
- **Write hooks** wrap a mutation with `useMutation`. They never refresh anything after it; the stores do.
- **State hooks** read and set app state: `useSelectedFleet()`.
- A page reads app state once and passes it to its children as props.
- Another module is imported only through its `index.ts`. Add a module with `/sf-new-module <name>`.

## Entities hold raw values

`types.ts` entities carry values in the form you compute, compare and sort with. Formatting for people happens only in `ui/` (and in a grid column's formatter).

- Dates and times: `Date` or epoch milliseconds. Durations: milliseconds. Quantities: numbers, in one stated unit. States: their code.
- The mapper converts what the API sends (numeric strings, `"29/10/2026"`, `"1h 20m"`) into those. If the API's format is ambiguous, the mapper parses it explicitly and a mapper test pins the result.
- Missing is `null`, never `"—"`, `"NA"` or `""`.

Tables, charts and filters depend on this: a grid sorts and filters the raw value (`ag-grid` skill), so a date formatted in the mapper sorts as text.

## Formatting for display

Turning a raw value into text happens only through `@/shared/lib/format` (`formatDate`, `formatDateTime`, `formatTime`, `formatRelative`, `formatDuration`, `formatNumber`, `formatPercent`), as `DESIGN.md` "Formats" specifies. Call them in `ui/` and in grid formatters. Never call `date-fns`, `toLocaleDateString`, `toLocaleString` or `Intl` formatters elsewhere. To change how a value looks across the product, change `format.ts`. A value it doesn't cover gets a new function there, with a test.

## Also enforced

- Outside `src/data/`, import the data layer only through `@/data`. A domain imports another only through its `index.ts`.
- Only `src/shared/realtime/` imports the WS client. Stores get the connection from `createStores()`.
- `shared/` imports no data, state, bindings, module or app.
- Only tests and `src/test/` import a `testing.ts` (builders and fakes).
- Only `src/shared/ui/data-grid/` imports AG Grid; `ag-grid-enterprise` is never imported (it needs a licence).
- Only `src/shared/lib/format.ts` imports `date-fns`, and only it may call `toLocale*String` or `Intl` formatters (the Biome rule in `biome-plugins/no-raw-formatting.grit`; shadcn's generated primitives in `src/shared/ui/*.tsx` are exempt).
- No circular imports.

## Naming

| Kind | Pattern | Example |
|---|---|---|
| Store | `data/<domain>/<domain>Store.ts`, class `<Domain>Store` | `commandStore.ts`, `CommandStore` |
| Mappers | `data/<domain>/<domain>Mappers.ts`, `to<Entity>`, `toApi<Entity>`, `to<Entity>Delta` | `toCommand` |
| Wire type | `Api<Entity>` | `ApiCommand` |
| Input schema | `<verb><Entity>InputSchema` in `schemas.ts` | `sendCommandInputSchema` |
| Form hook | `use<Feature>Form.ts` | `useSendCommandForm.ts` |
| Keys | `<domain>Keys` | `commandKeys.history(fleetId, vehicleId)` |
| Query method | `get<Entity>(args)` | `getHistory` |
| API method | after the endpoint, private | `listCommandsByVehicle` |
| Event | `<domain>/<past tense>` | `command/sent` |
| Component | `PascalCase.tsx` | `CommandPanel.tsx` |
| Data hook | `use<Name>Query.ts` | `useVehicleCommandsQuery.ts` |
| Business hook | `use<Feature><Result>.ts` | `useCanSendCommand.ts` |
| Write hook | `use<Verb><Entity>.ts` | `useSendCommand.ts` |
| State hook | `useSelected<Thing>.ts` | `useSelectedFleet.ts` |

One hook per file. A module's `index.ts` exports only what other modules or `app/` use.

## Related skills

| When you are… | Also use |
|---|---|
| Writing components or hooks, or fixing slow renders | `react-best-practices` (re-renders, waterfalls, bundle size) |
| Designing a component's API (variants, compound components, avoiding boolean props) | `composition-patterns` |
| Showing tabular data (sorting, filtering, many rows, live rows, export) | `ag-grid`: always through `DataGrid` from `@/shared/ui/data-grid` |
| Building or styling UI | `DESIGN.md`, `frontend-ui-engineering`, `shadcn`; review with `web-design-guidelines` |
| Changing `rspack.config.ts`, or a build is slow or too big | `rspack-best-practices`, `rspack-split-chunks` |
| Writing or debugging tests | `frontend-testing`, `rstest-best-practices`, `rstest-debugging` |

Where one of them conflicts with this skill (for example a rule that fetches inside a component, or uses TanStack Query or Zustand), this skill wins: data reaches components only through hooks over the stores.

## Adding code

- A new backend domain: `/sf-new-store <name>`, as a task of an approved plan (the `project-workflow` skill).
- A new feature: `/sf-new-module <name>`.
- Both create the files with test stubs and register them (`createStores()`, `app/modules.ts`).
