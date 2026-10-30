---
status: accepted
date: 2026-10-30
deciders: sakshamtulani
superseded-by:
---

# 0023. Ask before every load-bearing edit

## Context

ADR 0020 introduced load-bearing paths (`factory.json` `loadBearing`): the shared HTTP client, socket, config, app wiring and the guardrails. Only the guardrail files were protected at edit time, by `settings.json` `ask` rules and `guard-git.sh`. The app-code paths (`src/shared/api/**`, `src/shared/realtime/**`, `src/shared/config/**`, `src/app/App.tsx`, `src/app/queryClient.ts`, `src/shared/lib/app-module.tsx`, `package.json`, `rspack.config.ts`) were covered only by `/sf-build auto`'s stop rule and by `pr-guard.yml` at the PR. In an interactive `/sf-build`, `/sf-test` or an ad-hoc request, an agent could change the HTTP client without asking, and a person learned of it only at review. `factory.json` itself, which holds the list, was not protected either.

## Decision

1. **A `PreToolUse` hook on `Edit|Write|MultiEdit|NotebookEdit`**, `.claude/hooks/guard-load-bearing.sh`, reads `factory.json` `loadBearing` on every call and returns `ask` when the file matches a pattern or is `factory.json`. Patterns are matched as git glob pathspecs, the same as `pr-guard.yml`, so the list lives in one place.
2. **The rule is stated, too.** The template's `AGENTS.md` and the `project-workflow` skill say: ask before changing a load-bearing path or `factory.json`, unless an approved plan task names that path.
3. **The hook fails open** when `node` or `factory.json` is missing or the input can't be parsed. `pr-guard.yml` remains the hard gate.

## Alternatives considered

- **Add the paths to `settings.json` `ask`.** Lost because the list would then live in two places and drift; the hook reads the one list.
- **Deny edits outright.** Lost because planned tasks change these paths legitimately; a person approving each edit keeps them in control.
- **Skip the prompt when an approved plan names the path.** Lost for now: the hook would have to know the current task, and a wrong match silently drops the check. The prompt's reason says to approve when a plan task names the path.

## Consequences

- Every edit to a load-bearing path prompts the user, including edits a plan approved. A task in `src/shared/realtime/` may prompt several times.
- Shell writes to app-code load-bearing paths (`sed`, `cp`, scripts) are not caught; `guard-git.sh` covers shell writes only for the guardrail files. `pr-guard.yml` still requires a person's read.
- The hook and `settings.json` are template files, so they reach only new projects. Existing projects copy `.claude/hooks/guard-load-bearing.sh` and its `PreToolUse` entry by hand (an `.claude/` edit, which asks); the `project-workflow` rule reaches them at `skills update`.
