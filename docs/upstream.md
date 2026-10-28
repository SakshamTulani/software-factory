# Upstream sources

Most of `skills/` is forked from other repos and adapted. Projects install it from here with the `skills` CLI, so upstream changes never reach a project unless we merge them in this repo ([ADR 0010](adr/0010-distribute-with-the-skills-cli.md)). Each forked folder carries its upstream `LICENSE.txt`, because the CLI copies folders one at a time; the originals are in [licenses/](licenses/).

## addyosmani/agent-skills

| | |
|---|---|
| Forked from | `aeac41d4d005999432bb7312f7ff06383a91d59d` (v0.6.13, 2026-10-13), MIT |
| Forked on | 2026-10-28 |
| Taken | `skills/*` (25 skills, same names), `.claude/commands/*` (now skills `sf-*`), `references/` (now `skills/engineering-checklists/`), `agents/` (now `skills/sf-new-project/common/.claude/agents/`, copied once per project) |
| Left out | `hooks/` (its session-start router is meant only for hosts without native skill routing), `evals/`, `docs/`, other hosts' command formats |

### Our changes

| File | Change |
|---|---|
| all | `agent-skills:<skill>` → `<skill>`; command invocations `/spec` … `/webperf` → `/sf-spec` … `/sf-webperf`, `/code-simplify` → `/sf-simplify`, to avoid clashing with Claude Code's built-in commands |
| all | `../../references/<file>` → `../engineering-checklists/<file>`, because each skill installs as its own folder |
| `sf-*` (were commands) | `name` and `disable-model-invocation: true` added to the front matter |
| `sf-spec` | writes `docs/specs/NNN-slug/spec.md` from the template, with `REQ-NNN` ids and an index row; stops at the approval gate |
| `sf-plan` | requires an approved spec; writes `plan.md` beside it; publishes tasks through `docs/agents/issue-tracker.md`; task 1 of a new module is `/sf-new-module` |
| `sf-build` | finds the plan under `docs/specs/`; both gates required, also in `auto`; runs `/sf-new-module` when a task names it; `pnpm check` is the verification; `Spec:`/`Task:` trailers |
| `spec-driven-development` | spec location, `REQ-NNN` ids, index, human-only approval |
| `planning-and-task-breakdown` | plan beside the spec; tasks go to the tracker the project defines instead of `tasks/todo.md` |
| `documentation-and-adrs` | ADRs in `docs/adr/` with the project's template and index |
| `test-driven-development` | points to the project's testing skill; tests named after `REQ` ids |
| `frontend-ui-engineering` | "This project" section: `DESIGN.md` wins, components via `shadcn`, module `ui/` layout from `frontend-architecture` |
| `using-agent-skills` | router branch for `shadcn` under UI work |
| `code-review-and-quality` | Architecture axis checks `DESIGN.md` and shared-component restyling |
| `engineering-checklists` | new `SKILL.md` indexing the reference files |
| agents | links to upstream's `docs/agents.md` (not taken) point to `engineering-checklists/orchestration-patterns.md` |

## shadcn-ui/ui

`skills/shadcn` from `skills/shadcn` at `96da9cc7f1aa10580a3741664e2a77c721206c00` (2026-10-27), MIT. Without `evals/` and `agents/`; `skills/migrate-radix-to-base` not taken.

- Every CLI call pinned to `pnpm dlx shadcn@4.23.0` (the CLI version at that commit) instead of `@latest`.
- Added a "This project" section: `DESIGN.md`, `src/shared/ui/`.

## intellicars/fms-ui

- `skills/file-pr`: fms-ui's `file-pr` without its multi-client flow. Keeps the develop + draft-main PR pair under `develop-main`, one PR into `main` under `main`, read from the project's `docs/agents/git.md`.
- `skills/sf-setup/git-develop-main.md`, the template's `.github/workflows/pr-guard.yml` and `skills/sf-setup/workflows/back-merge.yml`: fms-ui's `docs/BRANCHING.md` and workflows without client lines ([ADR 0009](adr/0009-fms-ui-git-flow-as-the-default.md)).
- `skills/sf-new-project/design-systems/intellicar-default/DESIGN.md`: from fms-ui's style guide, CSS tokens and white-label config.

## Saksham's `transcribe-conversation`

`skills/sf-transcribe` is the user-level `transcribe-conversation` skill, renamed. Changes: files named `YYYY-MM-DD-<author>-<topic>-<id6>.md` (topic from `--topic`, the branch, the title, then the first message) instead of `<title>-<id8>.md`; one file per session kept by id; output folder and on/off from `factory.json`; a `--from-hook` mode for the `Stop` hook that never fails a turn; an explicit topic that sticks; a regenerated `README.md` index; the transcript's absolute source path dropped from the header.

## Pulling a later upstream version

1. Clone upstream at the new commit and diff it against the commit above for the folders taken.
2. Apply only the changes you want. Re-apply the rows above where upstream touched the same lines.
3. Update the commit in this file. Projects pick the change up with `npx skills update`.
