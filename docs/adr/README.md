# Factory decision records

Decisions that shape the factory and every project it generates. Numbered and never edited after acceptance: supersede instead. Format: numbered title, otherwise [the template's ADR template](../../skills/factory/sf-new-project/templates/frontend/react-rspack/docs/adr/_template.md).

| ADR | Status | Decision |
|---|---|---|
| [0001](0001-distribute-the-factory-as-a-plugin.md) | superseded by 0007 | Client repos install the factory as a Claude Code plugin; templates are copied once, skills are not |
| [0002](0002-use-addy-agent-skills-for-the-lifecycle.md) | superseded by 0007 | The lifecycle is Addy's agent-skills; the factory adds project glue only |
| [0003](0003-tanstack-query-as-the-store-owned-cache.md) | accepted | Frontend stores write REST and WebSocket data into TanStack Query |
| [0004](0004-data-access-never-imports-business-logic.md) | accepted | Three-tier modules with `types.ts` split from `model.ts`, enforced by dependency-cruiser |
| [0005](0005-single-agent-tdd-with-test-review.md) | accepted | One agent writes test then code; a test-engineer reviews |
| [0006](0006-specs-with-requirement-ids-and-an-index.md) | superseded by 0017 | Addy's spec format plus permanent `REQ-NNN` ids and a specs index |
| [0007](0007-fork-addy-skills-into-every-project.md) | superseded by 0010 | Addy's skills are forked into the factory and copied into every new project |
| [0008](0008-design-systems-as-design-md-with-a-forked-shadcn-skill.md) | accepted | Design systems are `DESIGN.md` files chosen at project creation; the shadcn skill is forked and pinned |
| [0009](0009-develop-main-git-flow-as-the-default.md) | accepted | The develop + draft-main flow is the default git strategy |
| [0010](0010-distribute-with-the-skills-cli.md) | accepted | Everything ships as skills via the `skills` CLI; `sf-` prefix; Stop hook runs `pnpm check`; no session-start router |
| [0011](0011-conversation-logs-chosen-per-project.md) | accepted | Conversation logs are chosen per project (`local` default, `committed`, `off`), saved by `sf-transcribe` with date-author-topic names |
| [0012](0012-save-the-conversation-after-every-turn.md) | accepted | Automatic conversation saving runs from the `Stop` hook after every turn, not `SessionEnd` |
| [0013](0013-the-app-shell.md) | accepted | The react-rspack shell ships with no modules; stores import from `@tanstack/react-query`; dependency-cruiser 18 for TypeScript 6 |
| [0014](0014-skill-groups-rstest-and-the-intellicar-theme.md) | accepted | Skills grouped core/frontend/backend/factory; tests on Rstest; rstack and Vercel frontend skills forked; the Intellicar theme with AA-checked colours |
| [0015](0015-ag-grid-through-one-wrapper.md) | accepted | AG Grid Community 36 only through `DataGrid` in `src/shared/ui/data-grid`; Enterprise banned; depcruise no longer hides packages that ship from `dist/` |
| [0016](0016-one-format-module-for-displayed-values.md) | accepted | Dates, times, durations and numbers are formatted only in `src/shared/lib/format.ts`, enforced by dependency-cruiser and a Biome rule |
| [0017](0017-named-specs-and-dated-adrs.md) | accepted | Specs named by slug (`docs/specs/<slug>/`, `feat/<slug>`), `REQ-<n>` per spec cited as `<slug>/REQ-<n>`, project ADRs named by date; no shared counters |
| [0018](0018-sf-retro-from-matt-pocock.md) | accepted | `/sf-retro`, forked from Matt Pocock's `retro`, proposes environment fixes and drafts sf-factory issues for factory ones |
| [0019](0019-tests-reach-real-stores-through-module-providers.md) | accepted | No store singletons: each module's `Provider` builds its store, so tests use real stores with a fresh cache and the fake socket; `src/test/` helpers; one way to write a test, lint-enforced |
