---
spec: NNN-slug
status: draft          # draft | approved
approved-by:
approved-on:
---

# Plan NNN: <Feature name>

> Requires `spec.md` to be `approved`.

## Requirements covered

| Requirement | Where it is satisfied |
|---|---|
| REQ-001 | |

Every requirement in the spec appears here. If one can't be satisfied, go back to the spec.

## Approach

Which layers change in which modules. New query keys, store methods, WS topics. Follow the `frontend-architecture` skill; any departure needs an ADR.

## Alternatives rejected

What else was considered, and why it lost.

## Risks

What could go wrong (reconnects, stale cache, high-frequency updates, permissions) and how the plan handles each.

## Tasks

Ordered by dependency. Each task fits in one session, touches about five files or fewer, and ends with `pnpm check` green. Publish them to the tracker ([issue-tracker.md](../../agents/issue-tracker.md)); this list is the source.

- [ ] **1** <for a new module: "Run `/sf-new-module <name>`"; otherwise a small, verifiable change> _(REQ-001)_
- [ ] **2** <small, verifiable change> _(REQ-001, REQ-002)_
