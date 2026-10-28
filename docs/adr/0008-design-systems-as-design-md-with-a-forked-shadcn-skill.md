---
status: accepted
date: 2026-10-28
deciders: sakshamtulani
superseded-by:
---

# 0008. Design systems are DESIGN.md files; the shadcn skill is forked

## Context

Frontend projects use shadcn/ui, and each one follows a design system. Intellicar's own exists as a product style guide, CSS tokens and white-label JSON. shadcn publishes an agent skill (`shadcn-ui/ui` `skills/shadcn`) that already knows how to map a `DESIGN.md` onto shadcn's tokens and component variants. It calls the CLI as `shadcn@latest`, so its behaviour would change underneath us.

## Decision

- Each design system is one `DESIGN.md` in `plugins/factory/design-systems/<name>/`: YAML token front matter plus the prose sections the shadcn skill reads. `intellicar-default` is built from Intellicar's style guide and separates tenant-brand tokens from product tokens. `/factory:new-project` asks which one to use and copies it to the project root.
- The shadcn skill is forked at `96da9cc` into the project kit, with every CLI call pinned to `pnpm dlx shadcn@4.23.0`.
- Other skills learn about it at the places where UI work is routed or checked, not by editing every skill: the root `AGENTS.md` table, `frontend-ui-engineering` ("This project": `DESIGN.md` wins), the `using-agent-skills` router, and the architecture axis of `code-review-and-quality`.

## Alternatives considered

- **Install the skill with `pnpm dlx skills add shadcn/ui`.** Lost because it tracks upstream; same reason as ADR 0007.
- **Mention `DESIGN.md` in every skill.** Lost because it means edits to 26 files that drift. Routing points cover every path into UI work.
- **Keep the existing style guide format.** Lost because the shadcn skill can't map it mechanically; `DESIGN.md` is the format it was written for.

## Consequences

Moving to a newer shadcn CLI means updating the pinned version in the kit and re-checking the skill. A project's `src/index.css` is generated from `DESIGN.md`, so a design change starts in `DESIGN.md`.
