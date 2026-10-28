---
status: accepted
date: 2026-10-28
deciders: sakshamtulani
superseded-by:
---

# 0003. Frontend stores write into TanStack Query

## Context

Projects rely heavily on WebSockets. Each module has a store that owns its data. When a WebSocket update arrives, the UI must re-render without the component refetching. Intellicar's earlier frontend solved this with an in-house query library, about 800 lines: a store-owned cache with `useQuery` over `useSyncExternalStore`. It works, but it applies the pattern inconsistently: `command-center-store.ts` exposes three different ways to read its data.

## Decision

The store is the only writer to a TanStack Query cache. The store gets the `QueryClient` injected. It exposes `queryOptions` factories; it applies WebSocket deltas with `queryClient.setQueryData`; and it invalidates after mutations. Components read only through hooks that call `useQuery(store.xOptions())`, using `select` for slices. Socket-fed keys use `staleTime: Infinity`.

## Alternatives considered

- **Keep the in-house query library.** Lost because it has no `select`, so every subscriber re-renders on every batch. It also has no devtools, retries or optimistic rollback; streams with no REST source use a placeholder observer whose fetcher never resolves; and we would maintain it ourselves.
- **Zustand for server data.** Lost because we would rebuild loading and error state, dedupe and invalidation by hand.

## Consequences

Stores depend on `@tanstack/query-core` and receive the `QueryClient`, so store tests use a real `QueryClient` with a fake socket. Large, fast-changing maps need `structuralSharing: false`. Existing apps are not migrated by this decision.
