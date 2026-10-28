---
status: accepted
date: 2026-10-28
deciders: sakshamtulani
superseded-by:
---

# 0005. One agent does test-first; a test-engineer reviews

## Context

The reference frontend splits a coder agent, which may not touch tests, from a tester agent, which may only touch tests. Addy's `test-driven-development` has one agent write the failing test and then the code. The two approaches conflict.

## Decision

One agent runs red → green → refactor for each task. Before review, `agent-skills:test-engineer` checks the tests against the template's `docs/agents/testing.md`, which carries the demo's tester rules: test behaviour not implementation, no snapshot tests, every test must catch a real bug.

## Alternatives considered

- **The coder/tester split.** Lost because every task needs two agent handoffs. Its real benefit, that tests can't be weakened to get to green, is covered by review and by the rule against weakening checks.

## Consequences

Test quality depends on the review step running. If agents are later seen weakening tests, revisit this and enforce the split for high-risk modules.
