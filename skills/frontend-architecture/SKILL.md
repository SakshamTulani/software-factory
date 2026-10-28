---
name: frontend-architecture
description: The module layout, layer import rules, data flow (store → TanStack Query cache → hooks → ui) and naming for react-rspack projects. Use when writing, moving or reviewing any code under src/, or when pnpm depcruise fails.
---

# Architecture

Every rule on this page that can be checked is checked by `pnpm depcruise` ([.dependency-cruiser.cjs](../../../.dependency-cruiser.cjs)). If a rule here and the config disagree, the config wins. Fix this page.

## Source layout

```
src/
├── app/        # the composition root: providers, queryClient.ts, router.tsx, and modules.ts (the module registry)
├── modules/    # one folder per product module (command-center, live-tracking, …)
├── shared/     # used by any module; imports no module
│   ├── api/        # httpClient
│   ├── realtime/   # the one WebSocket connection
│   ├── ui/         # design-system components
│   └── lib/        # pure helpers
└── main.tsx
```

## A module is a vertical slice in three tiers

```
modules/<module>/
│ ── PRESENTATION ──
├── ui/              # components: render and handle input, nothing else
├── hooks/           # data hooks (read the store) + business hooks (apply model.ts)
│ ── BUSINESS ──
├── model.ts         # pure business rules: calculations, validation, derived state
│ ── DATA ACCESS ──
├── store/           # source of truth: owns the cache, wires repository + realtime
├── repository/      # api + mappers → entities
├── realtime/        # WS topic subscribe/unsubscribe → mapped entities
├── mappers/         # DTO → entity, WS delta merges (pure)
├── api/             # raw REST calls + their DTO types
│ ── CONTRACT ──
├── types.ts         # domain entity types, no logic; every tier may import it
├── module.tsx       # exports an AppModule: featureId, title, routes (registered in src/app/modules.ts)
└── index.ts         # the module's public API
```

**A tier imports only from tiers below it.** Data access never imports business logic: `store`, `repository`, `realtime`, `mappers` and `api` must not import `model.ts`. Business rules are applied in hooks.

| Layer | May import from its module |
|---|---|
| `ui` | `hooks`, `model`, `types`, other `ui` |
| `hooks` | `store`, `model`, `types` |
| `model.ts` | `types` |
| `store` | `repository`, `realtime`, `mappers`, `types` |
| `repository` | `api`, `mappers`, `types` |
| `realtime` | `mappers`, `types` |
| `mappers` | `api` (DTO types), `types` |
| `api` | nothing (only `shared/`) |
| `types.ts` | nothing |

Also enforced:
- Another module is imported only through its `index.ts`.
- Only `store/` and `hooks/` import TanStack Query. Only `realtime/` imports the WS client.
- `model.ts` and `types.ts` import no React, TanStack Query or WS client.
- `shared/` imports no module.
- No circular imports.

## Data flow: the store tells the UI

All server data the UI reads lives in the TanStack Query cache, and **only the store writes to it**. REST fills it, WebSocket deltas patch it, and mutations invalidate or patch it. Components never fetch.

```ts
// store/commandCenterStore.ts
// queryOptions is a typing helper from @tanstack/react-query; the store never renders or calls hooks.
import { type QueryClient, queryOptions } from "@tanstack/react-query"

export class CommandCenterStore {
  constructor(private deps: { qc: QueryClient; repo: CommandCenterRepository; socket: CommandCenterSocket }) {
    deps.socket.onLiveInfo(batch((deltas) =>
      deps.qc.setQueryData(keys.liveInfo(), (old) => applyLiveInfoDeltas(old, deltas))))
  }

  liveInfoOptions = () => queryOptions({
    queryKey: keys.liveInfo(),
    queryFn: () => this.deps.repo.getLiveInfo(),
    staleTime: Infinity,        // the socket keeps it fresh
    structuralSharing: false,   // large, fast-changing maps
  })
}

// hooks/useVehicleLiveInfo.ts
export const useVehicleLiveInfo = (id: string) =>
  useQuery({ ...commandCenterStore.liveInfoOptions(), select: (all) => all[id] })
```

- Query keys come from one `keys` object per store. Never write a key inline in a hook.
- Data fed by the socket uses `staleTime: Infinity`. Throttle the socket in the store with `batch()`, not in components.
- Use `select` so a component re-renders only for the slice it shows.
- UI-only state (open panels, map settings) goes in Zustand, not the query cache.

## Naming

| Kind | Pattern | Example |
|---|---|---|
| Component | `PascalCase.tsx` | `CommandDropdown.tsx` |
| Data hook | `use<Name>Query.ts` | `useVehicleCommandsQuery.ts` |
| Business hook | `use<Feature><Result>.ts` | `useCanSendCommand.ts` |
| Form/view hook | `use<Feature>Form.ts` | `useSendCommandForm.ts` |
| API / mappers / repository / store / socket | `<module><Kind>.ts` | `commandCenterApi.ts` |
| DTO type | `Api<Entity>` | `ApiLiveInfo` |

One hook per file. A module's `index.ts` exports only what other modules or `app/` use.

## Adding a module

Run `/sf-new-module <name>` as the first task of an approved plan (the `project-workflow` skill). It creates every layer with test stubs, plus the `module.tsx` route entry.
