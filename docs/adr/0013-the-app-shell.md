---
status: accepted
date: 2026-10-28
deciders: sakshamtulani
superseded-by:
---

# 0013. The react-rspack app shell, with no modules

Corrects one detail of [0003](0003-tanstack-query-as-the-store-owned-cache.md) and the dependency-cruiser version behind [0004](0004-data-access-never-imports-business-logic.md).

## Context

The template had docs and configs but no app: no `package.json`, `src/`, or `pnpm check`. A worked reference module was considered and rejected, because a client project should start empty and get its first module from its first spec.

## Decision

- The template ships a shell with no modules. It has `src/app/` (providers, `queryClient.ts`, `router.tsx`, and `modules.ts`, the registry `sf-new-module` adds to) and `src/shared/` (`api/httpClient`, `config/env` validated with zod, `lib/` with `cn` and the `AppModule` type, `realtime/` wrapping `fmswsclientjs`, plus the fake connection every store test uses). `pnpm check` and `pnpm build` are green on a fresh project.
- Versions match fms-ui where both use a package, and every version is pinned exactly. Where fms-ui's range allowed a release less than a week old, an older one was chosen: pnpm 11 rejects very fresh releases.
- `realtime/` routes messages by (channel, topic) and reference-counts subscriptions. It doesn't re-subscribe on reconnect, because `fmswsclientjs` already re-sends its subscriptions itself.
- **Correction to 0003:** `queryOptions` is exported by `@tanstack/react-query`, not `@tanstack/query-core`. Stores import `QueryClient` and `queryOptions` from `@tanstack/react-query`; `queryOptions` is a typing helper and the store still never renders or calls hooks. `@tanstack/query-core` is not a direct dependency.
- **dependency-cruiser 18.7.0, not 16.** Version 16 supports TypeScript below 6 only; with TypeScript 6 it skipped every `.ts` file and reported "0 modules cruised" as a pass. Version 18 cruises them, and each rule was re-verified to fail on a deliberate violation.

## Alternatives considered

- **A working reference module.** Lost because it would be deleted or copied without thought in every client project. The pattern lives in the `frontend-architecture` skill and in what `sf-new-module` writes.
- **Open the WebSocket at startup.** Lost because a new project has no backend; the app connects after sign-in.

## Consequences

A green `pnpm depcruise` must show a non-zero module count. `sf-new-project` now runs `pnpm install`, which needs git access to `intellicars/fmswsclientjs`, and CI needs a read-only `GH_PAT` secret for the same reason.
