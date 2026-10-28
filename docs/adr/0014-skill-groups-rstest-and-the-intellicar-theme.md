---
status: accepted
date: 2026-10-29
deciders: sakshamtulani
superseded-by:
---

# 0014. Skill groups, Rstest, and the Intellicar theme

## Context

- Frontend projects installed every skill, including backend ones such as API design.
- The template tested with Vitest while building with Rspack.
- Rstack, Vercel and two UI-design repos publish skills or rules that fit the frontend stack.
- The Intellicar theme's DESIGN.md had no spacing, motion, z-index or state specifications, and several colour pairs below WCAG AA.

## Decision

- **Skills are grouped by who needs them:** `skills/core/`, `skills/frontend/`, `skills/backend/`, `skills/factory/`. A frontend template's `skills.txt` lists core plus frontend (47 skills), so backend skills are no longer installed. Groups exist only in this repo; installed skills stay flat.
- **Tests run on Rstest:** `@rstest/core` with `@rstest/adapter-rspack`, so tests reuse `rspack.config.ts`. happy-dom 20.x is the version range `@rstest/core` 0.12.4 declares support for. The jest-dom matchers get their types from a small module augmentation, since jest-dom ships none for Rstest. `passWithNoTests` is gone: the shell has its own tests, including one component test.
- **New forked frontend skills,** pinned:
  - rstack: `rspack-best-practices`, `rspack-split-chunks`, `rstest-best-practices`, `rstest-debugging`.
  - Vercel: `react-best-practices`, pruned of its server and Next.js rules; `composition-patterns`; `web-design-guidelines`, with its rules copied in rather than fetched at review time.
  - `frontend-architecture` maps when to use each one, and its data-flow rule wins any conflict.
- **The Intellicar theme** (`intellicar-default/DESIGN.md`) specifies spacing, sizing, motion, z-index, breakpoints, density, typography with line heights, interaction states, data visualisation, empty/loading/error/live/stale states, accessibility, dark mode, generated-dashboard bans and a pre-delivery checklist.
  - The rules are borrowed from ui-ux-pro-max and taste-skill, not forked. Neither skill is installed.
  - All 62 declared colour pairs pass AA, checked with the WCAG formula in both light and dark. The template's `index.css` carries the tokens.

## Alternatives considered

- **Install ui-ux-pro-max or taste-skill.** Lost because both choose styles for marketing sites, need Python or Chrome, and would compete with a fixed DESIGN.md.
- **Keep Vitest.** Lost because it means a second bundler pipeline beside Rspack.
- **Prune skills per project at install time instead of grouping.** Lost because groups make the choice visible in the repo and reusable for a backend template.

## Consequences

- A backend template will list core plus backend.
- Rstest is pre-1.0 (0.12.4), so expect upgrades to need care; `rstest-best-practices` points to its docs.
