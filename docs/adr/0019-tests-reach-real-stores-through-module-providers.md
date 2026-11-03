---
status: superseded
date: 2026-10-30
deciders: sakshamtulani
superseded-by: 0024
---

# 0019. Tests reach real stores through module providers, with standard helpers

## Context

`frontend-testing` said UI tests use MSW and the fake socket and never mock hooks, but nothing let a test do that. Hooks imported a module-level store singleton, so a test had no way to give it a fresh cache or the fake socket. The template installed MSW without starting a server, had no render helper, and left naming, queries, interaction and test data to each author. The reference demo's tester guide (behaviour over implementation, no snapshots, every test must catch a bug) was already in the skill, but nothing enforced the mechanical parts.

## Decision

- **No store singletons.** Each module's `module.tsx` has a `Provider` that builds the store once from `AppDeps` (`{ qc, realtime }`), and hooks read it with `use<Pascal>Store()` from `hooks/<module>StoreContext.tsx`. `ModuleProviders` nests every module's `Provider`; `App.tsx` passes the real cache and socket.
- **Helpers in `src/test/`:** `server` and `apiUrl` (MSW, no default handlers, unhandled requests fail), `renderWithProviders` and `renderHookWithProviders` (fresh `QueryClient` without retries, the fake socket, the listed modules' real stores, a router, a `userEvent`), `createTestQueryClient`. Builders live in each module's `testing.ts`.
- **One way to write a test**, in `frontend-testing`: arrange-act-assert, sentence names prefixed with `<slug>/REQ-<n>` on the full path, role queries first, `userEvent` not `fireEvent`, `findBy` not sleeps, only the network faked.
- **Enforced:** Biome `noFocusedTests`, `noSkippedTests` and a GritQL plugin banning snapshots and `fireEvent`; dependency-cruiser `testing-only-in-tests`.
- Shown working on a throwaway module in a generated project: repository, store, hook and UI tests through MSW and the fake socket, including live updates and retry after failure; each lint and dependency rule fired on a deliberate violation.

## Alternatives considered

- **Keep singletons and swap dependencies in test setup** (`rs.mock("@/shared/realtime")`, clear the app's cache after each test). Lost because the state stays global across a file's tests and the fake is hidden in setup.
- **Default MSW handlers for every endpoint.** Lost because a test should show the responses it depends on, and an unhandled request failing loudly finds missing ones.
- **The coder/tester agent split from the demo.** Still rejected (ADR 0005); its benefit now comes from the proof and the human read of changed tests (ADR 0020).

## Consequences

- A UI test runs the real store, repository and mappers, so it fails when any layer breaks.
- `AppModule` requires a `Provider`. Existing projects keep their singletons until they adopt this by hand; the skills describe the new shape.
- `src/shared/lib/app-module.tsx` and `src/test/` may import TanStack Query; dependency-cruiser exempts them.
- MSW 3 renamed `onUnhandledRequest` to `onUnhandledFrame`.
