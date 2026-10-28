---
status: accepted
date: 2026-10-29
deciders: sakshamtulani
superseded-by:
---

# 0015. AG Grid Community through one DataGrid wrapper

## Context

Intellicar's products show most of their data in large, sortable, filterable tables with live rows. The team already builds them with AG Grid. Its current major is 36. The `@ag-grid-community/*` packages older code uses stopped at 32 (now the long-term-support line), and from 33 onwards themes are configured in code and features must be registered as modules. AG Grid Enterprise features need a commercial licence.

## Decision

- The template ships `ag-grid-community` and `ag-grid-react` 36.2.0. Only `src/shared/ui/data-grid/` imports them, enforced by dependency-cruiser.
- That folder holds:
  - `DataGrid`, the wrapper: typed columns with `numeric` and `checkboxFilter` shortcuts, `rowId` for live in-place updates, density, an empty-state sentence, a displayed-row count and a `gridOptions` escape hatch.
  - The module list. It contains Community modules only, plus development validations outside production.
  - The theme, mapped to the `DESIGN.md` CSS variables so dark mode follows the app.
  - A checkbox set filter written for the v36 filter-handler API: the free replacement for Enterprise's set filter.
  - A date filter input built on shadcn's Calendar.
  - A comparator that sorts numbers numerically, text naturally, and missing values last.
- `ag-grid-enterprise` is banned by a dependency-cruiser rule.
- shadcn's button, checkbox, input, popover and calendar join the template, since the filters use them. Every new dependency is pinned exactly and is at least a week old.
- A new `ag-grid` skill (frontend group) holds the conventions and points to AG Grid's Markdown docs for version 36.
- **Fix found on the way:** the dependency-cruiser config excluded `(^|/)(dist|coverage)/`, which also hid every npm package that ships from `dist/`. Rules about those packages, including the new AG Grid ones, passed without checking anything. The pattern is now `^(dist|coverage)/`, and the AG Grid rules were shown to fire on deliberate violations.

## Alternatives considered

- **Port the version 32 packages and wrapper as-is.** Lost because those packages are frozen at 32, use CSS theme classes and global module registration, and use the legacy custom-filter API.
- **AllCommunityModule.** Lost because it ships every Community feature in the bundle. A short explicit list keeps size down, and development validations name any missing module.
- **TanStack Table.** Lost because the team already knows AG Grid, and it virtualises, filters and exports out of the box.

## Consequences

- A feature outside the module list needs one line in `modules.ts`.
- A module needing a grid option the wrapper lacks either gets a new prop or uses `gridOptions`.
- `AG Grid: error #200` in development means a module is missing.
- The layer and package rules now see packages under `dist/`, so code that was passing them may start failing. That's intended.
