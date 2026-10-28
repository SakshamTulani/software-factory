---
status: superseded
date: 2026-10-28
deciders: sakshamtulani
superseded-by: 0007
---

# 0002. Use Addy Osmani's agent-skills for the lifecycle

## Context

Three references were evaluated: `addyosmani/agent-skills` (a phase-by-phase lifecycle with human gates), `mattpocock/skills` (a run-once setup skill, tracker adapters, a glossary) and `intellicars/intqueuev2` (three document gates, EARS requirements, traceability, a conversation log). They conflict on the number of gates, the spec format, the ADR weight and the test-agent roles.

## Decision

The lifecycle is Addy's: spec → plan → tasks → build (TDD) → review → ship, installed as `agent-skills@addy-agent-skills`. Each project's `docs/agents/workflow.md` sets the locations and paths, which Addy's skills defer to. The factory plugin adds only what a client project needs on top:

- From Matt: the interactive `/factory:setup` (one question at a time), tracker adapters (`github`, `local`, `hybrid`), `GLOSSARY.md`.
- From intqueuev2: approval recorded in front matter (`status: approved`), permanent requirement ids, architecture enforced by a tool, `Spec:`/`Task:` commit trailers.

## Alternatives considered

- **intqueuev2's full process.** Lost because three document gates plus a verbatim conversation log is right for a distributed queue's control plane, but too heavy for UI modules.
- **Matt's skills as the lifecycle.** Lost because there is a lifecycle preference for Addy's, and Matt's specs live only in the issue tracker, which doesn't work for local-only projects.
- **Curating our own copies of every lifecycle skill.** Lost because we would own a fork's maintenance for little gain.

## Consequences

Upstream changes to Addy's skills reach every project. If an upstream change conflicts with our conventions, override it in `docs/agents/` or pin the plugin. The conversation log and change notes from intqueuev2 are not adopted.
