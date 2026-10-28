---
status: accepted
date: 2026-10-29
deciders: sakshamtulani
superseded-by:
---

# 0016. One format module for every displayed value

## Context

Dates, times, durations and numbers appear on every screen, in grids, charts and exports. When each component formats its own values, the product shows the same value several ways, and changing a format means finding every call site.

## Decision

- `src/shared/lib/format.ts` is the only code that turns a raw value into display text. It provides:
  - functions: `formatDate`, `formatDateTime`, `formatTime`, `formatRelative`, `formatDuration`, `formatNumber`, `formatPercent`, and the date-input pair `formatDateInput`/`parseDateInput`
  - the `MISSING` dash
  - the patterns, as constants
  - one number-locale setting

  Every function takes a raw value (`Date`, epoch ms or ISO string; milliseconds; numbers; `null`). DESIGN.md "Formats" lists each function and what it shows.
- The data grid's column kinds and its date filter input format and parse through it.
- **Enforced two ways:**
  - dependency-cruiser rule `date-fns-only-in-format`: only `format.ts` imports `date-fns`.
  - a Biome GritQL rule (`biome-plugins/no-raw-formatting.grit`): `toLocaleDateString`, `toLocaleTimeString`, `toLocaleString` and the `Intl` date, number and relative-time formatters are errors outside `format.ts`. It reports in the editor as well as in `pnpm check`.
  - shadcn's generated primitives in `src/shared/ui/*.tsx` are exempt, so `shadcn add` can still update them.
- Each rule was shown to fire on a deliberate violation, and `format.ts` has tests for every function.

## Alternatives considered

- **Document the formats and rely on review.** Lost because the rule is easy to forget and nothing would catch a one-off `toLocaleDateString`.
- **A source-scanning test instead of a Biome rule.** Lost because Biome reports in the editor as code is typed, and its patterns match syntax rather than text.
- **Format in mappers.** Lost because display text in entities breaks sorting and filtering (ADR 0015).

## Consequences

- Changing a format everywhere is a one-line change in `format.ts`.
- A new kind of value (currency, distance with automatic units) needs a function there, with a test, before a screen can show it.
- Locale-aware display (a user's time zone or language setting) can later be added in this one module.
