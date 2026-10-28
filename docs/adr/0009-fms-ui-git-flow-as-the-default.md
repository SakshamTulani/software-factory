---
status: accepted
date: 2026-10-28
deciders: sakshamtulani
superseded-by:
---

# 0009. fms-ui's git flow, without client lines, is the default

## Context

`/factory:setup` asks each project for a git strategy. A `dev` → `main` promotion model was considered as the test-environment option. Promotion ships everything in `dev` at once, so a half-finished feature blocks a release. fms-ui instead gives each branch a PR into `develop` now and a draft PR into `main` at release, enforced by `pr-guard.yml`. Most of fms-ui's complexity comes from serving every client from one repo; the factory gives each client its own repo.

## Decision

The default strategy is `develop-main`: fms-ui's rules 1–3, 7 and 8 (two PRs per branch, never pull develop in, develop never merges into main, hotfixes flow down, back-merge after release), without `client/*` branches, `main-to-<client>` syncs or client scopes. `pr-guard.yml` is ported with its client steps removed and ships in every template. It also serves the `main` strategy, because its develop checks skip themselves when there is no `develop` branch. `back-merge.yml` is added only for `develop-main`. `main` (one production line) remains the option for projects with no test environment.

## Alternatives considered

- **`dev` → `main` promotion.** Lost because features can't be released one at a time.
- **`main` only as the default.** Lost because most client projects have a shared test environment.

## Consequences

Each branch needs two PRs, and develop conflicts are resolved on `merge/*` branches. `file-pr` and the git adapter carry the recipes. `back-merge.yml` depends on the Intellicars bot GitHub App's org variable and secret.
