---
status: accepted
date: 2026-10-28
deciders: sakshamtulani
superseded-by:
---

# 0011. Conversation logs are chosen per project, local by default

## Context

A record of what was asked and decided in a Claude Code session helps a teammate pick up work or re-open a decision. intqueuev2 commits a verbatim log of every message. A transcript also holds everything pasted into the session, which can include secrets or client-confidential detail. Saksham's `transcribe-conversation` skill already renders sessions to Markdown, but names files after the session title, so they don't sort by date or say who held the session.

## Decision

- `sf-setup` asks each project: `local` (default; saved to `docs/conversations/`, gitignored), `committed` (saved there and committed), or `off`. If on, it asks whether a `SessionEnd` hook saves every session automatically.
- The skill is forked as `sf-transcribe`. Files are named `YYYY-MM-DD-<author>-<topic>-<id6>.md`, where the topic comes from `--topic`, the branch, the session title, or the first message. Each session keeps one file, and `README.md` indexes the folder.
- Choices live in `factory.json`'s `conversations` block, which both the hook and the script read.

## Alternatives considered

- **Always commit, like intqueuev2.** Lost because the privacy cost is real and differs by client; it stays an explicit per-project choice.
- **Keep the title-based names.** Lost because titles are generated and often don't match the work, and the files don't sort by date.

## Consequences

`committed` projects must review each transcript before pushing; `sf-setup` and `sf-transcribe` both say so. The hook gets 30 seconds; rendering a long session took about 0.2 seconds in testing.
