---
name: frontend-testing
description: What each layer of a react-rspack module is tested with (Vitest, RTL, MSW, fake socket), test naming after REQ ids, and the test-quality rules. Use when writing, fixing or reviewing tests.
---

# Testing

Vitest + React Testing Library + MSW. Tests sit next to the source: `commandCenterMappers.ts` → `commandCenterMappers.test.ts`.

## The loop

Every task is test-first, by the same agent: write a failing test, watch it fail for the right reason, make it pass, then refactor (`test-driven-development`). A bug fix starts with a test that reproduces the bug.

Before review, the `test-engineer` agent checks the tests against the rules on this page.

## What each layer is tested with

| Layer | Test | Fakes |
|---|---|---|
| `mappers`, `model.ts` | unit | none; pure functions |
| `repository` | unit | MSW for REST |
| `store` | unit, the most important one | real `QueryClient`, fake repository, fake socket. Push socket events, assert `qc.getQueryData(...)` |
| `hooks` | `renderHook` | store with a real `QueryClient` + fake socket |
| `ui` and user flows | integration (RTL) | MSW for REST + fake socket; never mock hooks |

The fake socket lives in `src/shared/realtime/testing.ts`. Every store test uses it.

## Rules

- **Name each test after the requirement it proves.** Cite the spec's id: `it("REQ-004: shows the immobilised badge when a WS update sets mode 2")`. `grep REQ-004` must find the test.
- **Assert on behaviour the user or caller can see**: rendered text, returned values, cache contents. Never assert which internal function was called.
- **Every test must catch a real bug if it fails.** If you can't name the bug, delete the test.
- **Cover empty, error and boundary states**: empty lists, a failed request, a socket disconnect, a delta for an unknown id.
- **No snapshot tests.** Don't assert CSS classes unless the style is the feature.
