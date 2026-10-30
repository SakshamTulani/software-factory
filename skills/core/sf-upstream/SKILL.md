---
name: sf-upstream
description: "Read business and API context from this project's upstream sources (backend repos, OpenAPI/Swagger, doc links) and request a new or changed contract from the team that owns it. Use when a spec, plan or task needs an endpoint, WS topic, data shape or business rule this repo doesn't own, when the contract looks missing or different from what the UI needs, or when the user runs /sf-upstream."
---

# Upstream

An upstream is a repo or document that owns something this project consumes: the backend that owns an API, its OpenAPI/Swagger, the product or business docs behind a feature. The project lists its upstreams in [docs/agents/upstream.md](../../../docs/agents/upstream.md), written by `/sf-setup`, which also says how to read each one and where requests go.

**This repo records only its own decisions.** A frontend's specs and ADRs cover what the frontend does: screens, modules, state, and how it calls the API. Business rules and the API contract belong upstream. Cite them by link and commit or version; never restate them as if this repo decided them, and never write or approve a spec or ADR for an upstream. When the upstream lacks something, **request** it.

If `docs/agents/upstream.md` is missing or still the placeholder, say so and offer `/sf-setup` to configure it. Without sources, ask the user for the detail and mark it in the spec as an assumption.

## Read

Use when a spec or task needs context about a feature from upstream.

1. List the endpoints, WS topics, data shapes and business rules the feature touches. Read each source through the operations `docs/agents/upstream.md` defines for its kind. Fetch fresh every time; never trust an earlier session's copy.
2. Read what is relevant to the feature, not the whole source: the matching OpenAPI paths and the schemas they reference, the upstream's specs and ADRs that mention the feature, and its code only to settle what a doc leaves unclear.
3. Record what you read so a reviewer can check it: for each source, its name, the commit SHA or API `info.version`, the date, and what you used (`GET /vehicles/{id}`, `VehicleStatus`, `docs/specs/immobilise/spec.md#REQ-3`).
4. Compare it with what the feature needs. Each difference is a **gap**: a missing endpoint or field, a different shape, an undocumented rule, two sources that disagree. Never fill a gap by guessing; list it.

Report the contract you found, the record from step 3 and the gaps. `/sf-spec` puts these in the spec's "Upstream contract" section.

A source that can't be read (no access, unset token, a private doc with no connector) is reported as unreadable with the error, never skipped silently. Ask the user to fix access or paste the content, and record pasted content as "pasted by <user>, <date>".

## Request

Use for each gap the upstream must close: a new endpoint, a contract change, a missing rule.

1. Find where requests for that source go, in `docs/agents/upstream.md`.
2. Search for an existing open request on the same subject; comment on it instead of opening a duplicate.
3. Draft the request:
   - **Title:** `Spec request: <what is needed>`
   - **Body:** what this project needs and why (link the spec and its `REQ-<n>` ids); the current contract with the SHA or version it was read at; the gap; a suggested shape, marked as a suggestion because the upstream decides; whether it blocks this project's spec.
4. Show the draft and ask before filing. A request reaches another team, so file it only after a yes, then give the link.
5. In this project's spec, add an Open question: `Waiting on <owner/repo>#<n>: <gap>`. Never file a request in this project's own tracker, and never write the upstream's spec for it.

The question is resolved when the upstream answers on the request, either by accepting a shape or by shipping it. Cite that answer in the spec and re-run **Read** for the changed part.

## Check for drift

`/sf-plan`, and any task that calls an upstream endpoint, re-reads the parts of the contract the spec cites. If the SHA or version moved and anything the spec used changed, stop and show the difference: the spec may need revising before work continues.

## Verify

- Every endpoint, topic and rule the spec relies on is cited with source, SHA or version, and date, or listed as a gap.
- Every gap has a filed request linked from an Open question, or the user has decided to leave it.
- Nothing this repo wrote decides an upstream's contract or business rule.
