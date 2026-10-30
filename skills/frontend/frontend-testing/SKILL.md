---
name: frontend-testing
description: How tests are written in a react-rspack project — what each layer is tested with (Rstest, happy-dom, Testing Library, MSW, the fake socket), the src/test helpers (renderWithProviders, server, apiUrl), builders in testing.ts, naming after requirement ids, query and interaction rules, and proving a test fails without the change. Use when writing, fixing or reviewing tests.
---

# Testing

Rstest (Rspack-based, configured in `rstest.config.ts`, which reuses `rspack.config.ts`) with happy-dom, React Testing Library and MSW. `pnpm test` runs it. Tests sit next to the source: `vehiclesMappers.ts` → `vehiclesMappers.test.ts`.

- Import test APIs explicitly from `@rstest/core` (`describe`, `it`, `expect`, `rs`); there are no globals. `restoreMocks` is on, so spies reset between tests.
- `src/test/setup.ts` registers the jest-dom matchers and runs the MSW server for every test file.
- For configuration and CI follow `rstest-best-practices`; for a test that won't start, hangs or is slow, `rstest-debugging`.

## The loop

Every task is test-first, by the same agent: write a failing test, watch it fail for the right reason, make it pass, then refactor (`test-driven-development`). A bug fix starts with a test that reproduces the bug.

- **Prove it.** Before review, run `prove-test.sh` (in the `test-driven-development` skill) on the branch. It removes the non-test part of the change and checks the new tests then fail. `status=FAILED` means a test passes without the change, so it proves nothing about it: fix the test.
- **Don't edit an existing test to get to green.** Changing, renaming or deleting a test that already exists needs a person's read; `pr-guard.yml` blocks the PR until one ticks the box. Add a new test instead, or say why the old one is wrong.
- Before review, the `test-engineer` agent checks the tests against this page.

## What each layer is tested with

| Layer | Test | Fakes |
|---|---|---|
| `mappers`, `model.ts`, `src/shared/lib` | unit | none; pure functions |
| `repository` | unit | MSW for REST |
| `store` | unit, the most important one | `createTestQueryClient()`, a plain-object fake repository, the fake socket. Push socket events, assert `qc.getQueryData(...)` |
| `hooks` | `renderHookWithProviders`, when no component test covers the hook well | the module's real store, MSW, the fake socket |
| `ui` and user flows | integration (RTL) via `renderWithProviders` | MSW for REST + the fake socket. Never mock hooks, the store or `httpClient` |

Only the network is fake. Everything between a component and the network runs for real, so a test fails when any layer breaks.

## The helpers

| Helper | From | Use |
|---|---|---|
| `renderWithProviders(ui, { modules, route })` | `@/test/render` | Renders like the app: a fresh `QueryClient` (no retries), the fake socket, the real store of each module in `modules`, a router at `route`. Returns `{ user, qc, socket, …render result }` |
| `renderHookWithProviders(hook, { modules })` | `@/test/render` | The same providers around `renderHook`. Returns `{ result, qc, socket, … }` |
| `createTestQueryClient()` | `@/test/render` | The cache for a store test |
| `server`, `apiUrl(path)` | `@/test/server` | MSW. `server.use(http.get(apiUrl("/vehicles"), …))` in the test that needs it. No default handlers, and an unhandled request fails the test |
| `createFakeRealtimeConnection()` | `@/shared/realtime/testing` | The fake socket: `emit(channel, topic, payload)`, `setStatus()`, `subscriptions()` |
| `build<Entity>()`, `buildApi<Entity>()` | the module's `testing.ts` | Valid data with overrides: `buildVehicle({ speedKmh: 81 })`. Only tests import `testing.ts` (dependency-cruiser) |

If a project from before these helpers lacks one, add it to `src/test/` in the shape above before writing the test that needs it.

## How a test reads

```tsx
describe("VehicleList", () => {
  it("vehicles/REQ-2: updates a speed live when the socket reports it", async () => {
    server.use(http.get(apiUrl("/vehicles"), () => HttpResponse.json([buildApiVehicle()])))
    const { socket } = renderWithProviders(<VehicleList />, { modules: [vehiclesModule] })
    await screen.findByText("Truck 1: 0 km/h")

    socket.emit("pubsub", "vehicle.speed", { id: "v1", speedKmh: 30 })

    expect(await screen.findByText("Truck 1: 30 km/h (moving)")).toBeInTheDocument()
  })

  it("recovers from a failed load when the user retries", async () => {
    server.use(
      http.get(apiUrl("/vehicles"), () => new HttpResponse(null, { status: 500 }), { once: true }),
      http.get(apiUrl("/vehicles"), () => HttpResponse.json([buildApiVehicle()]))
    )
    const { user } = renderWithProviders(<VehicleList />, { modules: [vehiclesModule] })

    await user.click(await screen.findByRole("button", { name: "Retry" }))

    expect(await screen.findByText("Truck 1: 0 km/h")).toBeInTheDocument()
  })
})
```

```ts
it("vehicles/REQ-2: patches a vehicle's speed in the cache when the socket reports it", async () => {
  const qc = createTestQueryClient()
  const realtime = createFakeRealtimeConnection()
  const repo = { list: async () => [buildVehicle({ id: "v1", speedKmh: 0 })] }
  const store = new VehiclesStore({ qc, repo, socket: createVehiclesSocket(realtime) })
  await qc.fetchQuery(store.listOptions())

  realtime.emit("pubsub", "vehicle.speed", { id: "v1", speedKmh: 55 })

  expect(qc.getQueryData(keys.list())).toEqual([buildVehicle({ id: "v1", speedKmh: 55 })])
})
```

## Rules

**Shape**
- One `describe` per unit (component, store, function); one behaviour per `it`.
- Arrange, act, assert, separated by blank lines. The setup a reader needs is in the test, not hidden in a `beforeEach`; helpers only do plumbing (providers, builders).
- Builders override only the fields the test is about, so the test shows what matters.
- No comments in tests. If a test needs one, rename it.

**Names**
- On the full path, start with the requirement id the test proves, in full: `it("vehicles/REQ-2: …")`. `grep -w vehicles/REQ-2` must find it. Other tests (light path, edge cases, shared code) have no id.
- The name is a sentence about behaviour, and the assertion checks exactly that: "shows the empty state when the fleet has no vehicles", not "works" or "renders correctly".

**Assertions**
- Assert what the user or caller sees: rendered text and roles, returned values, cache contents. Never assert which internal function was called, or component state.
- Every test must catch a real bug if it fails. If you can't name the bug, delete the test. A test without an assertion is not a test.
- Cover empty, error and boundary states: an empty list, a failed request, a socket disconnect, a delta for an unknown id, `null` from the API.
- No snapshots. Don't assert CSS classes unless the style is the feature. Don't test that React, TanStack Query or a library works.

**Queries and interaction**
- Find elements as a user would, in this order: `getByRole` (with `name`), `getByLabelText`, `getByText`, then the rest. `getByTestId` only when nothing visible identifies the element. Never `container.querySelector`.
- Interact through `user` from `renderWithProviders` (`await user.click(…)`, `await user.type(…)`), never `fireEvent`.
- Wait with `findBy…` for something that appears. Use `waitFor` only for an assertion that has no `findBy` form, and never put an action inside it. Never sleep.
- `queryBy…` only to assert something is absent.

**Network, time and mocks**
- REST only through MSW handlers declared in the test. Never mock `httpClient`, a repository used by a component, a hook or the store.
- Socket traffic only through the fake socket.
- Fixed time: `rs.useFakeTimers()` and `rs.setSystemTime(...)` when behaviour depends on now; pass `{ advanceTimers: rs.advanceTimersByTime }` to `userEvent.setup` if a UI test also uses fake timers. Never depend on the real clock or time zone.
- `rs.mock` only for a third-party boundary that has no fake, and say which in the test name's subject.

## Enforced by `pnpm check`

| Rule | Check |
|---|---|
| No `.only`, no `.skip` | Biome `noFocusedTests`, `noSkippedTests` |
| No snapshots, no `fireEvent` | Biome plugin `biome-plugins/test-conventions.grit` |
| Unhandled requests fail | MSW `onUnhandledFrame: "error"` in `src/test/setup.ts` |
| Production code never imports `testing.ts` | dependency-cruiser `testing-only-in-tests` |
| Changing an existing test needs a person's read | `pr-guard.yml`, on the PR |

`it.todo("…")` is allowed: the scaffold uses it until a task writes the test.
