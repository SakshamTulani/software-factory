---
status: accepted
date: 2026-10-30
deciders: sakshamtulani
superseded-by:
---

# 0018. `/sf-retro` improves the environment, and routes factory fixes to sf-factory

## Context

The lifecycle ends at `/sf-ship`. Nothing turns a hard session into a lasting improvement, so the same search, the same mistake and the same missed review recur. Matt Pocock's `retro` skill reads a session and proposes changes to the agent's environment (checks, navigation pointers, reviewer standards) instead of the code. In a factory project, part of that environment is the factory's own skills, which a project can't edit: `skills update` overwrites them.

## Decision

- Fork Matt's `retro` as `sf-retro`, user-invoked, in `skills/core/`. It reads the current session, a transcript from `sf-transcribe`'s conversation log, or a raw session log.
- Its categories map to this stack: automated checks go into `pnpm check` (Biome, GritQL plugins, dependency-cruiser, types, tests); judgement-call rules go into `docs/agents/review.md`, which `code-review-and-quality` now applies; the quality bar goes into `CONSTRAINTS.md`; `AGENTS.md` takes navigation pointers only.
- A finding about a factory skill, or one every project of a template needs, becomes a drafted issue on `SakshamTulani/sf-factory`, stripped of client detail and filed with `gh` only on the user's yes.
- It only proposes. Chosen project fixes are applied as a light-path change, and a new check must be shown to fail on the original mistake.

## Alternatives considered

- **Install Matt's skill unchanged.** Lost because it points at `CODING_STANDARDS.md` and a `writing-for-agents` skill we don't ship, and it can't tell a project fix from a factory one.
- **Retros that only print a list.** Lost because factory findings would be lost between projects.
- **Run it automatically after every session.** Lost because a smooth session produces rules nobody needed.

## Consequences

- Factory skills improve from real sessions in client projects.
- `sf-retro` calls `gh` directly for the factory repo, an exception to "a skill never calls `gh`". That rule protects the project's own tracker, which this issue doesn't touch.
- Developers without access to the private factory repo get a printed draft to pass on.
- Like Matt's, it never prunes old checks; a rule that fires on good code must still be removed by hand.
