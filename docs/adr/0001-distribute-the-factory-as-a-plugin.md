---
status: superseded
date: 2026-10-28
deciders: sakshamtulani
superseded-by: 0007
---

# 0001. Distribute the factory as a Claude Code plugin

## Context

Intellicar creates one repo per client, often around the same core product. Each repo needs the same structure, lifecycle and gates. If each repo gets a copy, the copies drift: within months, every client has a slightly different process.

## Decision

The factory is a Claude Code plugin marketplace. Each client repo's `.claude/settings.json` enables `factory@sf-factory`, so a teammate who clones the repo gets the same skills, and improvements reach every client when it updates. A template's files (code layout, docs skeleton, configs) are copied once at `/factory:new-project`, because after that they belong to the client project.

## Alternatives considered

- **A GitHub template repo copied per client.** Lost because skills and process copied into each repo drift, and a fix has to be applied N times.
- **A git submodule of the factory in each repo.** Lost because submodules are a known source of friction for teammates, and plugins are the mechanism Claude Code already resolves.

## Consequences

Skills improve everywhere at once, so a breaking skill change needs a major version bump. Template files don't update after generation; adopting a template change in an existing client is a manual migration.
