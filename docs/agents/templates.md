# Templates and design systems

A template is a complete starting repo at `skills/factory/sf-new-project/templates/<repo-type>/<name>/`. `/sf-new-project` asks for the repo type, the template and the design system, copies the template and `common/`, and installs the skills its `skills.txt` lists.

| Template | Stack |
|---|---|
| `frontend/react-rspack` | Rspack, React 19, class stores over a shared cache in `src/data/` (no TanStack Query), WebSocket client, Tailwind v4 + shadcn, AG Grid Community 36, React Router 7, Rstest + happy-dom + RTL + MSW, Biome, dependency-cruiser |

Adding a template means a row here and a row in `sf-new-project`'s template table.

## What a template contains

- `skills.txt`: the skills it installs (not copied into the project). A frontend template lists every skill in `skills/core/` and `skills/frontend/`; a backend template would list `skills/core/` and `skills/backend/`.
- A root `AGENTS.md` (essentials and a "read when relevant" table only), plus `CLAUDE.md` holding just `@AGENTS.md`.
- `docs/agents/issue-tracker.md` and `docs/agents/git.md`: placeholders that `/sf-setup` replaces with an adapter (tracker `github`, `local` or `hybrid`; git `develop-main` or `main`). `docs/agents/upstream.md`: a placeholder `/sf-setup` replaces with the project's upstream sources (ADR 0022).
- `docs/specs/` and `docs/adr/`, each with `_template` and a `README.md` index; `docs/client.md`, `docs/product.md`, `GLOSSARY.md`.
- `DESIGN.md` (frontend): a placeholder that `sf-new-project` replaces with the chosen design system; `components.json` for shadcn.
- `.github/workflows/pr-guard.yml` (branch flow, plus a person's read of changed existing tests and of `factory.json` `loadBearing` paths) and `.github/pull_request_template.md`.
- `.claude/settings.json` and `.claude/hooks/`: `check-on-stop.sh`, the Stop hook that refuses to end a turn while `pnpm check:fast` is red, `guard-git.sh`, which blocks merging, force-pushing, pushing to `main`/`develop` and `--no-verify`, and asks before a shell write to a guardrail file; and `guard-load-bearing.sh`, which asks before any Edit or Write to a `factory.json` `loadBearing` path or to `factory.json` (ADR 0023). `settings.json` asks before any edit to the guardrails.
- `pnpm-workspace.yaml`: pnpm settings only (the allowed happy-dom peer, ADR 0021); the template is a single package.
- `.dependency-cruiser.cjs`, and the `check` script that is the Definition of Done, with `check:fast` (Stop hook) and `check:deep` (load-bearing changes).
- The app shell (react-rspack): `package.json` with exact versions, `pnpm-lock.yaml`, the Rspack, Rstest, TypeScript and Biome configs, `src/app/` (`App.tsx` builds the stores and app state once, router, `modules.ts` registry, `syncFleetWithUrl.ts`), `src/data/` (the shared cache in `core/`, `events.ts`, `createStores()` in `stores.ts`), `src/state/` (app state), `src/bindings/react/` (the only React glue for stores and state) and `src/shared/` (HTTP client, env, `cn`, `lib/format.ts` (the only place values are formatted for display), the realtime connection and its fake, shadcn components, and `ui/data-grid/`, the AG Grid wrapper), plus `biome-plugins/` (the lint rules that keep formatting in `format.ts` and ban snapshots and `fireEvent`), and `src/test/` (the MSW `server`, `renderWithProviders` and `renderHookWithProviders`, which build real stores over MSW with the fake socket). One worked example: the `commands` and `vehicles` domains in `src/data/`, talking through an event, and the `command-center` module reading both and the selected fleet. A project replaces it with its own domains and modules (ADR 0024).

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
- Changing `package.json`: generate a project, run `pnpm install`, and copy its `pnpm-lock.yaml` back into the template. Then check a fresh project passes `pnpm install --frozen-lockfile`, `pnpm check` and `pnpm build`, and that `pnpm depcruise` reports a non-zero module count.
- Pick versions at least a week old; pnpm 11 rejects very fresh releases and writes exemptions into the project.
- Root `AGENTS.md` stays essentials-only.

## Design systems

`skills/factory/sf-new-project/design-systems/<name>/DESIGN.md`, indexed in that folder's `README.md`. A design system's colour pairs must pass WCAG AA in both themes; check them with a script before merging, not by eye.
