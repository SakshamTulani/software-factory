# Upstream sources

Most of `skills/` is forked from other repos and adapted. Projects install it from here with the `skills` CLI, so upstream changes never reach a project unless we merge them in this repo ([ADR 0010](adr/0010-distribute-with-the-skills-cli.md)). Each forked folder carries its upstream `LICENSE.txt` (or a `NOTICE.txt` where upstream ships no licence file), because the CLI copies folders one at a time; the originals are in [licenses/](licenses/). Paths below are in this repo: `skills/<group>/<name>/`.

## addyosmani/agent-skills

| | |
|---|---|
| Forked from | `aeac41d4d005999432bb7312f7ff06383a91d59d` (v0.6.13, 2026-10-13), MIT |
| Forked on | 2026-10-28 |
| Taken | `skills/*` (25 skills, same names), `.claude/commands/*` (now skills `sf-*`), `references/` (now `skills/core/engineering-checklists/`), `agents/` (now `skills/factory/sf-new-project/common/.claude/agents/`, copied once per project) |
| Left out | `hooks/` (its session-start router is meant only for hosts without native skill routing), `evals/`, `docs/`, other hosts' command formats |

### Our changes

| File | Change |
|---|---|
| all | `agent-skills:<skill>` → `<skill>`; command invocations `/spec` … `/webperf` → `/sf-spec` … `/sf-webperf`, `/code-simplify` → `/sf-simplify`, to avoid clashing with Claude Code's built-in commands |
| all | `../../references/<file>` → `../engineering-checklists/<file>`, because each skill installs as its own folder |
| `sf-*` (were commands) | `name` and `disable-model-invocation: true` added to the front matter |
| `sf-spec` | writes `docs/specs/<slug>/spec.md` from the template, with per-spec `REQ-<n>` ids and an alphabetical index row ([ADR 0017](adr/0017-named-specs-and-dated-adrs.md)); stops at the approval gate |
| `sf-plan` | requires an approved spec, asks when several have no plan; tracer-bullet task, test list, three least-confident decisions, `critic` on load-bearing plans; writes `plan.md` beside it; publishes tasks through `docs/agents/issue-tracker.md`; task 1 of a new module is `/sf-new-module` |
| `sf-build` | finds the plan under `docs/specs/`; both gates required, also in `auto`; runs `/sf-new-module` when a task names it; `pnpm check` is the verification; `Spec:`/`Task:` trailers; `auto` also stops on red twice, over 400 lines, an unplanned load-bearing path or a changed existing test ([ADR 0020](adr/0020-trust-controls-from-addy-osmanis-factory.md)) |
| `spec-driven-development` | spec location by slug, per-spec `REQ-<n>` ids cited as `<slug>/REQ-<n>`, index, human-only approval |
| `planning-and-task-breakdown` | plan beside the spec; tasks go to the tracker the project defines instead of `tasks/todo.md` |
| `documentation-and-adrs` | ADRs in `docs/adr/YYYY-MM-DD-<slug>.md` with the project's template and index; overrides "continue the existing sequence" |
| `test-driven-development` | points to the project's testing skill; tests named after `<slug>/REQ-<n>` ids; `prove-test.sh` (from addyosmani/factory, below) and never editing an existing test to pass |
| `frontend-ui-engineering` | "This project" section: `DESIGN.md` wins, components via `shadcn`, module `ui/` layout from `frontend-architecture`, `composition-patterns` and `react-best-practices` for components, done only after `DESIGN.md`'s checklist and a `web-design-guidelines` review |
| `using-agent-skills` | starts from `project-workflow`; `frontend-architecture` and `frontend-testing` beside implementing and testing; backend-only skills marked; router branch suggesting `/sf-retro` after a bad session; router branches for `shadcn`, `composition-patterns`, `react-best-practices`, `web-design-guidelines`, `rspack-*` and `rstest-*`; backend-only skills marked "(backend projects)" |
| `code-review-and-quality` | applies `docs/agents/review.md` when it exists; Architecture axis checks `DESIGN.md`, `web-design-guidelines` and shared-component restyling |
| `engineering-checklists` | new `SKILL.md` indexing the reference files |
| agents | links to upstream's `docs/agents.md` (not taken) point to `engineering-checklists/orchestration-patterns.md`; `code-reviewer` reads the diff cold, re-runs checks and treats a failed test proof or weakened test as Critical, and is spawned by `/sf-review`; `test-engineer` follows the project's testing skill and `prove-test.sh` |
| `git-workflow-and-versioning`, `shipping-and-launch`, `ci-cd-and-automation`, `incremental-implementation`, `debugging-and-error-recovery`, `constraint-driven-development` | a "This project" section that overrides the generic text: `docs/agents/git.md` and its branch prefixes (not trunk-based, not `feature/`), releases through the main PR, the template's CI and `pr-guard`, a slice is a plan task with `pnpm check` and trailers, Rstest commands, and the existing `check:fast`/`check`/`check:deep` scripts |
| `sf-constraints` | adds checks to the existing scripts by cost instead of `check:task`/`check:full`; points agents at `CONSTRAINTS.md` from `AGENTS.md`, not `CLAUDE.md` |
| `sf-ship` | runs on a release candidate; `pnpm check:deep` and outstanding PR boxes are blockers; personas are the project's `.claude/agents/` |
| `sf-test` | the light path's step: tests per the project's testing skill, never editing an existing test, `prove-test.sh` then `/sf-review` |
| `sf-review` | spawns `code-reviewer` with a fresh context as verifier (checks re-run, `prove-test.sh`, changed tests), and `critic` on load-bearing changes; was a single in-session review |
| `sf-spec` | slug claimed by pushing `feat/<slug>` first; `critic` on specs that touch load-bearing paths |

## rstackjs/agent-skills

`skills/frontend/rspack-best-practices`, `rspack-split-chunks`, `rstest-best-practices` and `rstest-debugging`, unchanged, from `2ee8100ab8efb6d6c3c4c6d901fcb665b10163fc` (2026-10-22), MIT. Not taken: `rspack-debugging` and `rspack-tracing` (native-crash and compiler-trace work, rare in a client app), `rsdoctor-analysis` (needs the Rsdoctor plugin, which the template doesn't install), `migrate-to-*` (the template starts on Rstest), and the Rsbuild, Rslib, Rspress and Storybook skills (not our stack).

## vercel-labs/agent-skills

From `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` (2026-10-27). MIT as declared in each skill's front matter and the README; the repo ships no licence file, so each folder has a `NOTICE.txt` saying so.

| Skill | Changes |
|---|---|
| `skills/frontend/react-best-practices` | `name` `vercel-react-best-practices` → `react-best-practices`, to match the folder. Removed the 14 rules that need a server or SWR (`server-*`, `async-api-routes`, `rendering-hydration-*`, `client-swr-dedup`) and the compiled `AGENTS.md`, which would have kept them. Rewrote `bundle-dynamic-imports` and `bundle-defer-third-party` from `next/dynamic` to `React.lazy`; removed the Next.js passages from `bundle-barrel-imports`, `bundle-analyzable-paths`, `rendering-script-defer-async` and `rendering-resource-hints`. New "This project" section: data through the store, `select` for re-renders, lazy module routes. 56 rules kept. |
| `skills/frontend/composition-patterns` | `name` `vercel-composition-patterns` → `composition-patterns`; README removed. Rules unchanged. |
| `skills/frontend/web-design-guidelines` | Upstream fetches its rules from GitHub at every review; ours reads `guidelines.md`, a pinned copy of `vercel-labs/web-interface-guidelines` `command.md` at `434b7f91364665f2f733b310ec54809bf8f37937` (MIT, `LICENSE.txt` copied), and checks `DESIGN.md` too. |

Not taken: `react-view-transitions` (motion beyond what `DESIGN.md` allows), `react-native-skills`, `writing-guidelines`, and the Vercel deployment skills.

## Design references (rules borrowed, not forked)

`skills/factory/sf-new-project/design-systems/intellicar-default/DESIGN.md` (the Intellicar theme) takes values and rules, rewritten in our own words, from:

- `nextlevelbuilder/ui-ux-pro-max-skill` at `28b3b8d` (MIT): the z-index scale, duration tokens, state priority order and table row heights from `.claude/skills/design-system/references/`.
- `leonxlnx/taste-skill` at `12af471` (MIT): KPI, table, status-pill, chart-axis, density and empty/loading/error rules and the list of generated-dashboard tells, from `skills/taste-skill/references/app-screens.md`.

Neither skill is installed: both are built to choose a style for marketing sites, need Python or Chrome, and would compete with a fixed `DESIGN.md`.

## AG Grid

`skills/frontend/ag-grid` is our own skill; nothing is forked. The template's `src/shared/ui/data-grid/` is written against AG Grid Community 36.2.0 (MIT) and its docs at https://www.ag-grid.com/react-data-grid/ (Markdown via `.md`).

## shadcn-ui/ui

`skills/frontend/shadcn` from `skills/shadcn` at `96da9cc7f1aa10580a3741664e2a77c721206c00` (2026-10-27), MIT. Without `evals/` and `agents/`; `skills/migrate-radix-to-base` not taken.

- Every CLI call pinned to `pnpm dlx shadcn@4.23.0` (the CLI version at that commit) instead of `@latest`.
- Added a "This project" section: `DESIGN.md`, `src/shared/ui/`.

## mattpocock/skills

`skills/core/sf-retro` from `skills/engineering/retro` at `a496f5513d4a4cf889bc48e189e579f4b0bdf6aa` (2026-10-30), MIT (`LICENSE.txt` copied). Rewritten for this stack ([ADR 0018](adr/0018-sf-retro-from-matt-pocock.md)):

- Renamed `sf-retro`. The `writing-for-agents` step is removed (not shipped).
- Reads `sf-transcribe`'s conversation log as well as the current session.
- Categories point at `pnpm check` (Biome, GritQL plugins, dependency-cruiser), `docs/agents/review.md` instead of `CODING_STANDARDS.md`, and `CONSTRAINTS.md`.
- New category: a factory skill at fault becomes a drafted issue on `SakshamTulani/sf-factory`, filed with `gh` only on a yes.
- Applies the fixes the user picks, and verifies a new check fails on the original mistake.

Not taken: the rest of the repo (its lifecycle overlaps Addy's), `agents/openai.yaml`.

## addyosmani/factory

From `8af116567166a0a16588b7ab1b9934ece0b775bc` (2026-08-18), MIT (`docs/licenses/addyosmani-factory.txt`; a `LICENSE-factory.txt` beside each forked file). Controls taken, orchestration left out ([ADR 0020](adr/0020-trust-controls-from-addy-osmanis-factory.md)).

| Ours | From | Changes |
|---|---|---|
| `skills/core/test-driven-development/prove-test.sh` | `template/.factory/scripts/prove-test.sh` | Header; the empty `test_paths` loop guarded so it runs under `set -u` in macOS bash 3.2 |
| `skills/factory/sf-new-project/common/.claude/agents/critic.md` | `template/.claude/agents/factory-critic.md` | Renamed `critic`; points at our `code-reviewer` and `/sf-review` instead of the factory verifier; no `WebFetch` |
| the template's `.claude/hooks/guard-git.sh` | `template/.claude/hooks/block-merge.sh` | Allows `--force-with-lease` and merges off `main`/`develop` (our recipes use both); blocks merge, rebase and reset on them, refspec pushes into them and `--no-verify`; asks, rather than blocks, before shell writes to our guardrail files |

Ideas taken without code: the human read of changed tests (`TESTS_ARE_LOAD_BEARING`) and of load-bearing paths, enforced in `pr-guard.yml`; `settings.json` rules on guardrail files (as `ask`, not `deny`); the spec gates' "three decisions you're least confident about", test list, tracer-bullet slice and migration oracle; `STOP_IF` limits in `/sf-build auto`; fast, full and deep gate levels; `factory-tune` as `/sf-retro 30d`; claiming work by pushing its branch.

Not taken: the charter and autonomy tiers, the GitHub-label queue, triage, run records, review back-pressure, the scheduled monitor and the Codex adapter.

## Intellicar conventions

- `skills/core/file-pr`: Intellicar's PR conventions (problem-first descriptions, `type(scope): summary` titles), for one repo per client. Keeps the develop + draft-main PR pair under `develop-main`, one PR into `main` under `main`, read from the project's `docs/agents/git.md`.
- `skills/core/sf-setup/git-develop-main.md`, the template's `.github/workflows/pr-guard.yml` and `skills/core/sf-setup/workflows/back-merge.yml`: Intellicar's develop + main branching rules and their guard workflows, for one repo per client ([ADR 0009](adr/0009-develop-main-git-flow-as-the-default.md)).
- `skills/factory/sf-new-project/design-systems/intellicar-default/DESIGN.md`: values from Intellicar's product style guide, with colours chosen so every pair passes WCAG AA.

## Saksham's `transcribe-conversation`

`skills/core/sf-transcribe` is the user-level `transcribe-conversation` skill, renamed. Changes: files named `YYYY-MM-DD-<author>-<topic>-<id6>.md` (topic from `--topic`, the branch, the title, then the first message) instead of `<title>-<id8>.md`; one file per session kept by id; output folder and on/off from `factory.json`; a `--from-hook` mode for the `Stop` hook that never fails a turn; an explicit topic that sticks; a regenerated `README.md` index; the transcript's absolute source path dropped from the header.

## Pulling a later upstream version

1. Clone upstream at the new commit and diff it against the commit above for the folders taken.
2. Apply only the changes you want. Re-apply the rows above where upstream touched the same lines.
3. Update the commit in this file. Projects pick the change up with `npx skills update`.
