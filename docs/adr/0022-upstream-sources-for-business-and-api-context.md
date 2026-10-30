---
status: accepted
date: 2026-10-30
deciders: sakshamtulani
superseded-by:
---

# 0022. Upstream sources for business and API context

## Context

A frontend project consumes an API and business rules it doesn't own. Its backend is upstream: the backend decides endpoints, data shapes and rules, and the frontend builds on them. Until now, `/sf-spec` asked the user which endpoints a feature uses and wrote whatever came back into the frontend spec. Business and backend detail ended up restated in frontend docs, where it went stale and looked like a frontend decision, and a missing endpoint was discovered during build. The detail usually lives somewhere already: one or more backend repos with their own specs and ADRs, an OpenAPI/Swagger document, product docs.

## Decision

1. **Projects list their upstream sources.** `/sf-setup` gains Section D, asked by default for frontend projects, and writes `docs/agents/upstream.md`: one row per source (`github-repo`, `openapi` or `doc`), its location, how it authenticates and where requests for it go, plus the read and request operations per kind. Any number of sources.
2. **A frontend's specs and ADRs record only frontend decisions.** Business rules and the API contract are cited from upstream by link and SHA or version, never restated as ours. `project-workflow` states this; the spec template gains "Upstream contract" (source, SHA or version, date, what was used).
3. **`sf-upstream` reads and requests.** **Read** fetches each source fresh, takes only what the feature needs, records SHA or version and date, and lists gaps instead of guessing. **Request** drafts a `Spec request: …` issue on the owning backend repo, label `spec-request`, and files it only after the user says yes. The frontend never writes the backend's spec or files the request in its own tracker. **Drift check** re-reads the cited contract and stops if it changed.
4. **The lifecycle uses it.** `/sf-spec` runs Read before asking about endpoints; each gap becomes an Open question `Waiting on <owner/repo>#<n>`, which blocks approval until the backend answers. `/sf-plan` runs the drift check first, and test data and MSW handlers follow the cited contract.
5. **Live fetch, cite the SHA.** Nothing upstream is copied into the frontend repo. Repos are shallow-cloned into a temporary folder; OpenAPI is fetched with `curl` and read with `jq`.
6. **Tokens by name only.** `upstream.md` names the environment variable holding a source's token; each developer sets it in their shell or `.env`, without `PUBLIC_`, so it never reaches the browser.

Only the frontend side ships now. A backend template, when one exists, will triage `spec-request` issues into its own `/sf-spec`.

## Alternatives considered

- **Commit a snapshot of the contract** (`docs/upstream/openapi.json`). Lost because it goes stale silently and needs its own refresh step; a cited SHA plus a drift check gives the same reviewability. Worth revisiting if we generate API types from OpenAPI.
- **A gitignored cache** in `.scratch/`. Lost because it hides staleness the same way and isn't shared.
- **Requests in the frontend's own tracker**, labelled for the backend to watch. Lost because the backend team owns its backlog and is more likely to act on an issue in its own repo.
- **A request channel per source** (Jira, Linear, email). Deferred: every Intellicar backend is on GitHub today, and `upstream.md` can grow another channel without changing the skill.
- **Keep asking the user.** Lost because it is what put stale backend detail into frontend specs.

## Consequences

- A frontend spec can't be approved while it waits on a backend request. That is deliberate; the alternative is building against a guessed contract.
- Reading a private repo or authenticated Swagger needs `gh` access and the named token on every developer's machine. A source that can't be read is reported, never skipped.
- `/sf-spec` and `/sf-plan` make network calls and take longer.
- Existing projects get the skills at their next `skills update`. `/sf-setup` creates `docs/agents/upstream.md` and the `AGENTS.md` row for them; the spec template's new section reaches only new projects, so `/sf-spec` adds it when missing.
