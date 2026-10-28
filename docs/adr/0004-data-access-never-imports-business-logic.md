---
status: accepted
date: 2026-10-28
deciders: sakshamtulani
superseded-by:
---

# 0004. Data access never imports business logic

## Context

The reference frontend (`advanced-frontend-course-demo`) states the rule "never import upward (Data Access → Business Logic → Presentation)". But its own mappers and api import `model.ts`, because `model.ts` holds both the entity types that data access must return and the business functions. As written, the rule can't be enforced.

## Decision

Split each module's `model.ts` in two:

- **`types.ts`** holds the entity types, with no logic. Every tier may import it.
- **`model.ts`** holds the pure business rules. Only presentation (hooks, ui) may import it.

Data access (`api`, `mappers`, `repository`, `realtime`, `store`) must not import `model.ts`. Merging WebSocket deltas is data transformation, so it lives in `mappers`. dependency-cruiser enforces every layer rule in `pnpm check`. The rules were verified against a fixture: one valid module passes, and one deliberate violation per rule fails.

## Alternatives considered

- **Treat `model.ts` as the bottom layer** that everything imports. Lost because data access then grows business rules over time, and the demo's stated rule becomes meaningless.
- **Allow type-only imports of `model.ts` from data access.** Lost because the boundary would sit inside a file instead of between files, which makes it hard to see in review.
- **Document the rules without a tool.** Lost because an agent can quietly break a written rule; a failing check stops it.

## Consequences

Each module has one more file. Delta-merge logic sits in `mappers`, not next to the business rules. Changing a layer rule means changing `.dependency-cruiser.cjs` and `architecture.md` together.
