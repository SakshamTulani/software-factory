# Templates and design systems

A template is a complete starting repo at `skills/sf-new-project/templates/<repo-type>/<name>/`. `/sf-new-project` asks for the repo type, the template and the design system, copies the template and `common/`, and installs the skills its `skills.txt` lists.

| Template | Stack |
|---|---|
| `frontend/react-rspack` | Rspack, React 19, TanStack Query (store-owned cache), WebSocket client, Tailwind v4 + shadcn, React Router 7, Zustand, Vitest + RTL + MSW, Biome, dependency-cruiser |

Adding a template means a row here and a row in `sf-new-project`'s template table.

## What a template contains

- `skills.txt`: the skills it installs (not copied into the project).
- A root `AGENTS.md` (essentials and a "read when relevant" table only), plus `CLAUDE.md` holding just `@AGENTS.md`.
- `docs/agents/issue-tracker.md` and `docs/agents/git.md`: placeholders that `/sf-setup` replaces with an adapter (tracker `github`, `local` or `hybrid`; git `develop-main` or `main`).
- `docs/specs/` and `docs/adr/`, each with `_template` and a `README.md` index; `docs/client.md`, `docs/product.md`, `GLOSSARY.md`.
- `DESIGN.md` (frontend): a placeholder that `sf-new-project` replaces with the chosen design system; `components.json` for shadcn.
- `.github/workflows/pr-guard.yml` and `.github/pull_request_template.md`.
- `.claude/settings.json` and `.claude/hooks/check-on-stop.sh`: the Stop hook that refuses to end a turn while `pnpm check` is red.
- `.dependency-cruiser.cjs`, and a `check` script that is the Definition of Done.

Placeholders `sf-new-project` fills: `{{PROJECT_NAME}}`, `{{CLIENT_NAME}}`, `{{PRODUCT_NAME}}`, `{{ONE_SENTENCE_DESCRIPTION}}`.

## What updates, and what doesn't

| Lives in | Reaches existing projects |
|---|---|
| A skill (lifecycle, `frontend-architecture`, `frontend-testing`, `project-workflow`, `sf-setup` adapters, `sf-transcribe`) | Yes, at `npx skills update` |
| A template file (configs, workflows, hooks, agents, `DESIGN.md`) | No, copied once |

So put rules that will change into a skill. Keep template files to what tools need as files.

## Changing a template

- Change the enforcement and the skill that describes it together. `frontend-architecture` and `.dependency-cruiser.cjs` must not disagree.
- Run the dependency-cruiser config against a fixture: one valid module that must pass, plus one deliberate violation per rule that must fail.
- Root `AGENTS.md` stays essentials-only.

## Design systems

`skills/sf-new-project/design-systems/<name>/DESIGN.md`, indexed in that folder's `README.md`.
