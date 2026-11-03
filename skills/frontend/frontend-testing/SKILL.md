---
name: frontend-testing
description: How tests are written in a react-rspack project — what each layer is tested with (Rstest, happy-dom, Testing Library, MSW, the fake socket), the src/test helpers (renderWithProviders, server, apiUrl), builders in testing.ts, naming after requirement ids, query and interaction rules, and proving a test fails without the change. Use when writing, fixing or reviewing tests.
---

# Testing

Rstest (Rspack-based, configured in `rstest.config.ts`, which reuses `rspack.config.ts`) with happy-dom, React Testing Library and MSW. `pnpm test` runs it. Tests sit next to the source: `vehicleMappers.ts` → `vehicleMappers.test.ts`. The template's worked example (`src/data/commands/`, `src/data/vehicles/`, `src/modules/command-center/`) has a test of every kind below.

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
| mappers, `model.ts`, `src/shared/lib`, `src/state` | unit | none; pure functions |
| a store | unit, the most important one | `createStores({ http: httpClient, realtime: createFakeRealtimeConnection(), flushMs: 20 })`, MSW for REST. `mount()` the query, push socket events, assert `getSnapshot().data` |
| stores together | unit (`src/data/stores.test.ts`) | the same. A write in one store, the other store's query refetched through the event |
| `src/data/core` | unit | none, or `rs.useFakeTimers()` for GC |
| `hooks` | `renderHookWithProviders`, when no component test covers the hook well | real stores, MSW, the fake socket |
| `ui` and user flows | integration (RTL) via `renderWithProviders` | MSW for REST + the fake socket. Never mock hooks, a store or `httpClient` |

Only the network is fake. Everything between a component and the network runs for real, so a test fails when any layer breaks.

## The helpers

| Helper | From | Use |
|---|---|---|
| `renderWithProviders(ui, { route, appState, flushMs })` | `@/test/render` | Renders like the app: every real store from `createStores()` over MSW, the fake socket, fresh app state (`appState: { fleetId: "f1" }`), a router at `route`. `flushMs` defaults to 0. Returns `{ user, socket, stores, state, …render result }` |
| `renderHookWithProviders(hook, options)` | `@/test/render` | The same providers around `renderHook`. Returns `{ result, socket, stores, state, … }` |
| `server`, `apiUrl(path)` | `@/test/server` | MSW. `server.use(http.post(apiUrl("/vehicles/liveinfo"), …))` in the test that needs it. No default handlers, and an unhandled request fails the test |
| `createFakeRealtimeConnection()` | `@/shared/realtime/testing` | The fake socket: `emit(channel, topic, payload)`, `setStatus()`, `subscriptions()` |
| `buildApi<Entity>()` | the domain's `src/data/<domain>/testing.ts` | Valid wire data with overrides: `buildApiVehicleLive({ vehicleid: "v2" })`. Only tests import `testing.ts` (dependency-cruiser) |

If a project from before these helpers lacks one, add it to `src/test/` in the shape above before writing the test that needs it.

## How a test reads

```tsx
describe("CommandPanel", () => {
  it("command-center/REQ-2: shows the vehicle as immobilized when the socket reports it", async () => {
    server.use(http.post(apiUrl("/vehicles/liveinfo"), () => HttpResponse.json([buildApiVehicleLive({ vehicleid: "v1" })])))
    const { socket } = renderWithProviders(<CommandPanel fleetId="f1" vehicleId="v1" />)
    expect(await screen.findByText(/Mobile/)).toBeInTheDocument()

    socket.emit("pubsub", "combinfo/v1", { parsedcandata: { immobilization_status: { pidvalue: 1 } } })

    expect(await screen.findByText(/Immobilized/)).toBeInTheDocument()
  })

  it("lets the user retry when the commands fail to load", async () => {
    server.use(
      http.post(apiUrl("/commands/listcommandsbyvehicle"), () => new HttpResponse(null, { status: 500 }), { once: true }),
      http.post(apiUrl("/commands/listcommandsbyvehicle"), () => HttpResponse.json([buildApiCommand()]))
    )
    const { user } = renderWithProviders(<CommandPanel fleetId="f1" vehicleId="v1" />)

    await user.click(await screen.findByRole("button", { name: "Try again" }))

    expect(await screen.findByRole("button", { name: "Immobilize" })).toBeInTheDocument()
  })
})
```

```ts
it("vehicles/REQ-3: applies a burst of socket messages in one update after the flush", async () => {
  server.use(http.post(apiUrl("/vehicles/liveinfo"), () => HttpResponse.json([buildApiVehicleLive({ vehicleid: "v1" })])))
  const realtime = createFakeRealtimeConnection()
  const { vehicles } = createStores({ http: httpClient, realtime, flushMs: 20 })
  const live = vehicles.getLiveInfo("f1")
  live.mount()
  await waitFor(() => expect(realtime.subscriptions()).toEqual(["pubsub/combinfo/v1"]))
  let updates = 0
  live.subscribe(() => updates++)

  realtime.emit("pubsub", "combinfo/v1", { parsedcandata: { immobilization_status: { pidvalue: 1 } } })
  realtime.emit("pubsub", "combinfo/v1", { utctime: 5000 })

  await waitFor(() => expect(live.getSnapshot().data?.v1?.immobilized).toBe(true))
  expect(updates).toBe(1)
})
```

## Rules

**Shape**
- One `describe` per unit (component, store, function); one behaviour per `it`.
- A store test outside React starts a query with `observer.mount()` and ends it with `unmount()`; `subscribe()` only listens.
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
- No snapshots. Don't assert CSS classes unless the style is the feature. Don't test that React, the cache in `src/data/core` or a library works; test what your store does with them.

**Queries and interaction**
- Find elements as a user would, in this order: `getByRole` (with `name`), `getByLabelText`, `getByText`, then the rest. `getByTestId` only when nothing visible identifies the element. Never `container.querySelector`.
- Interact through `user` from `renderWithProviders` (`await user.click(…)`, `await user.type(…)`), never `fireEvent`.
- Wait with `findBy…` for something that appears. Use `waitFor` only for an assertion that has no `findBy` form, and never put an action inside it. Never sleep.
- `queryBy…` only to assert something is absent.

**Network, time and mocks**
- REST only through MSW handlers declared in the test. Never mock `httpClient`, a store or a hook.
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
