---
status: accepted
date: 2026-10-28
deciders: sakshamtulani
superseded-by:
---

# 0012. Save the conversation after every turn, not at session end

Amends [0011](0011-conversation-logs-chosen-per-project.md): the automatic save moves from a `SessionEnd` hook to a `Stop` hook.

## Context

ADR 0011 saved transcripts from a `SessionEnd` hook. That event doesn't fire when a terminal is killed or a session is left open and later resumed, so the log could be missing or stale. intqueuev2 records after every exchange instead, by an instruction in its `CLAUDE.md` telling the model to append a row to a monthly log, which depends on the model remembering to.

## Decision

When a project turns on automatic saving, `sf-setup` adds `sf-transcribe --from-hook` to the `Stop` hooks, next to `check-on-stop.sh`. It rewrites the session's file after every turn, so the log is always current, and no instruction to the model is needed. Hook mode never fails a turn: it prints nothing to stdout, reports a skipped save on stderr, and exits 0. A topic set with `--topic` renames the file once and sticks; later automatic saves reuse the file's existing topic.

## Alternatives considered

- **Keep `SessionEnd`.** Lost because it misses killed and resumed sessions.
- **intqueuev2's model-written log of every exchange.** Not taken now: it relies on the model following an instruction every turn, and costs tokens each time. It records decisions in a form a transcript doesn't, so it can be added alongside later.

## Consequences

The transcript is rewritten every turn, about 0.2 seconds for a long session. In `committed` projects the transcript changes with every turn, so it shows up in `git status` throughout the work.
