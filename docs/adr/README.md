# Factory decision records

Decisions that shape the factory and every project it generates. Numbered and never edited after acceptance: supersede instead. Format: [the template's ADR template](../../skills/sf-new-project/templates/frontend/react-rspack/docs/adr/_template.md).

| ADR | Status | Decision |
|---|---|---|
| [0001](0001-distribute-the-factory-as-a-plugin.md) | superseded by 0007 | Client repos install the factory as a Claude Code plugin; templates are copied once, skills are not |
| [0002](0002-use-addy-agent-skills-for-the-lifecycle.md) | superseded by 0007 | The lifecycle is Addy's agent-skills; the factory adds project glue only |
| [0003](0003-tanstack-query-as-the-store-owned-cache.md) | accepted | Frontend stores write REST and WebSocket data into TanStack Query |
| [0004](0004-data-access-never-imports-business-logic.md) | accepted | Three-tier modules with `types.ts` split from `model.ts`, enforced by dependency-cruiser |
| [0005](0005-single-agent-tdd-with-test-review.md) | accepted | One agent writes test then code; a test-engineer reviews |
| [0006](0006-specs-with-requirement-ids-and-an-index.md) | accepted | Addy's spec format plus permanent `REQ-NNN` ids and a specs index |
| [0007](0007-fork-addy-skills-into-every-project.md) | superseded by 0010 | Addy's skills are forked into the factory and copied into every new project |
| [0008](0008-design-systems-as-design-md-with-a-forked-shadcn-skill.md) | accepted | Design systems are `DESIGN.md` files chosen at project creation; the shadcn skill is forked and pinned |
| [0009](0009-fms-ui-git-flow-as-the-default.md) | accepted | fms-ui's develop + draft-main flow, without client lines, is the default git strategy |
| [0010](0010-distribute-with-the-skills-cli.md) | accepted | Everything ships as skills via the `skills` CLI; `sf-` prefix; Stop hook runs `pnpm check`; no session-start router |
| [0011](0011-conversation-logs-chosen-per-project.md) | accepted | Conversation logs are chosen per project (`local` default, `committed`, `off`), saved by `sf-transcribe` with date-author-topic names |
| [0012](0012-save-the-conversation-after-every-turn.md) | accepted | Automatic conversation saving runs from the `Stop` hook after every turn, not `SessionEnd` |
| [0013](0013-the-app-shell.md) | accepted | The react-rspack shell ships with no modules; stores import from `@tanstack/react-query`; dependency-cruiser 18 for TypeScript 6 |
