---
spec: <slug>
status: draft          # draft | approved
approved-by:
approved-on:
---

# Plan: <Feature name>

> Requires `spec.md` to be `approved`.

## Requirements covered

| Requirement | Where it is satisfied |
|---|---|
| REQ-1 | |

Every requirement in the spec appears here. If one can't be satisfied, go back to the spec.

## Approach

Which layers change in which modules. New query keys, store methods, WS topics. Follow the `frontend-architecture` skill; any departure needs an ADR.

## Alternatives rejected

What else was considered, and why it lost.

## Least confident

The three decisions in this plan you are least sure of, and what would show each one is wrong. A reviewer looks here first.

1. …

## Test list

What will be tested before any code exists, and what each test proves. `prove-test.sh` later checks each one fails without its change.

| Test | Layer | Proves |
|---|---|---|
| `<slug>/REQ-1`: <behaviour> | store | <the bug it catches> |

## Risks

What could go wrong (reconnects, stale cache, high-frequency updates, permissions) and how the plan handles each.

## Tasks

Ordered by dependency. After any scaffolding, the first task is a tracer bullet: the thinnest path from API to screen, with fake or minimal data, proving the shape works end to end. Each later task replaces a fake or adds one behaviour. Each task fits in one session, touches about five files or fewer, stays under 400 changed lines, and ends with `pnpm check` green. Name any `loadBearing` path (`factory.json`) a task must change; `/sf-build auto` stops before changing one the plan doesn't name. Publish them to the tracker ([issue-tracker.md](../../agents/issue-tracker.md)); this list is the source.

- [ ] **1** <for a new module: "Run `/sf-new-module <name>`"; otherwise the tracer bullet> _(REQ-1)_
- [ ] **2** <tracer bullet, or a small, verifiable change> _(REQ-1, REQ-2)_
