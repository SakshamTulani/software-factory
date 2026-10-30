---
status: accepted
date: 2026-10-30
deciders: sakshamtulani
superseded-by:
---

# 0021. happy-dom 21 ahead of Rstest's declared range

## Context

`pnpm check:deep` runs `pnpm audit --audit-level high`, and it failed on the template: happy-dom 20.14.6, the DOM every test runs in, has two high advisories (a host code execution through an import alias, and SSRF when parsing untrusted HTML). The fixes are in 21.0.4 and later. Rstest 0.12.4, and 0.12.5, the newest, declare `happy-dom ^20.8.3` as a peer.

## Decision

The template pins happy-dom 21.0.4 (published 2026-10-20) and allows it for Rstest in `pnpm-workspace.yaml` (`peerDependencyRules.allowedVersions`), with a comment to drop the rule once Rstest's range includes 21. A fresh project installs with `--frozen-lockfile` and no peer warnings, all 26 template tests pass, and `pnpm check:deep` is green with one low advisory left.

## Alternatives considered

- **Stay on 20.14.6 until Rstest moves.** Lost because every load-bearing review would fail `check:deep`, which teaches people to ignore it.
- **Raise the audit level to `critical`.** Lost because it hides real high advisories to clear one known one.
- **jsdom instead of happy-dom.** Lost for now: a larger change to the test environment than a version bump.

## Consequences

- Projects created before this keep 20.14.6 and should bump by hand.
- If Rstest relies on a happy-dom 20 behaviour that 21 changed, a test may fail in a way the template's suite doesn't cover; `rstest-debugging` is the first stop.
