---
status: accepted
date: 2026-10-28
deciders: sakshamtulani
superseded-by:
---

# 0006. Addy's specs, with requirement ids and an index

## Context

Addy's spec has free-form success criteria. intqueuev2 numbers each requirement (`REQ-001`) and cites the id in tasks and test names, so "is this requirement tested?" can be answered with grep. Specs also need to be findable without opening every folder.

## Decision

Each feature gets `docs/specs/NNN-slug/spec.md` and `plan.md`, following Addy's sections. Each success criterion is a `REQ-NNN`, permanent once approved. Plan tasks cite the ids, and tests are named after them. `docs/specs/README.md` indexes every spec (status, requirement range, summary) and every requirement, and is updated in the same commit as the spec. Approval is `status: approved` in front matter, set only by a human.

## Alternatives considered

- **Addy's spec as-is.** Lost because there is no link from a requirement to its test.
- **Full EARS with a traceability matrix (intqueuev2).** Lost because it's too heavy for UI work. EARS phrasing is suggested, not required.
- **Specs only in the issue tracker (Matt).** Lost because it doesn't work for projects with a local tracker.

## Consequences

The index must be maintained by hand, so `/spec` updates it. A requirement that changes after approval is superseded with a new id, not edited.
