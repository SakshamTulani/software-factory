---
spec: <slug>
status: draft          # draft | approved | superseded
approved-by:
approved-on:
---

# Spec: <Feature name>

## Objective

What we're building, for whom, and why now. What does success look like for the user?

## Assumptions

What this spec takes as given. Each one is something a reviewer can correct.

## Requirements

Ids are permanent and local to this spec. Tasks cite them; tests and other docs cite them as `<slug>/REQ-<n>`. Once approved, supersede a requirement; never renumber it.

- **REQ-1**: <testable criterion. "When <trigger>, the <screen/module> shall <observable response>" where that reads naturally.>
- **REQ-2**: …

## Modules touched

Which modules in `src/modules/` change, and any new module. Which REST endpoints and WS topics are consumed.

## Upstream contract

What this spec takes from upstream ([docs/agents/upstream.md](../../agents/upstream.md)), cited, not decided here. One row per source; `sf-upstream` fills it.

| Source | SHA or version | Read on | Used |
|---|---|---|---|
| <!-- backend --> | <!-- 3f2a9c1 --> | <!-- 2026-11-02 --> | <!-- `GET /vehicles/{id}`, `VehicleStatus`; `docs/specs/immobilise/spec.md` REQ-3 --> |

Gaps go to Open questions as `Waiting on <owner/repo>#<n>: <gap>`.

## Boundaries

- **Always:** …
- **Ask first:** …
- **Never:** …

## Out of scope

What this spec deliberately does not do.

## Migration oracle

Migrations only; delete otherwise. What proves the new code behaves like the old: recorded responses, a side-by-side run, a list of screens compared by a person. Green tests alone don't, because the old code is often barely tested.

## Open questions

Anything that must be answered before approval. An approved spec has none left.
