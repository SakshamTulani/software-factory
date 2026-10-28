<!--
Title: type(scope): summary
  type: feat | fix | chore | refactor | perf | docs | hotfix | enhance | test | style | build | ci | revert
  scope: module (command-center, live-tracking)
  Say why it matters: "fix(trip-report): stop CSV export dropping the last row"
  rather than "fix(trip-report): update export util"
-->

## Summary

<!--
Two or three plain sentences for a reviewer who hasn't seen the ticket:
what was wrong or missing, and what this PR does about it.
Lead with the problem, not a list of files.
-->

Ticket:
Spec: <!-- docs/specs/NNN-slug/ and the REQ ids this PR covers, or "light path" -->

## Changes

<!-- The main changes a reviewer should look at. Skip renames and formatting. -->

-

## Screenshots

<!-- UI changes only. Delete this section otherwise. -->

| Before | After |
| ------ | ----- |
|        |       |

## How to test

<!-- Steps a reviewer or QA can follow, including the user role and data to use. -->

1.

## Backend

- [ ] Needs a backend change
  - Backend PR / ticket:
- [ ] Backend change is live in production (tick before the main PR can merge)

<!-- Keep the two backend lines word for word: pr-guard.yml reads them. -->

## Checklist

- [ ] `pnpm check` passes
- [ ] Tested on the develop environment after the develop merge (develop-main strategy)
- [ ] Tests named after the `REQ` ids they prove (full path)
- [ ] Spec index, ADR index and `GLOSSARY.md` updated if they changed

Develop PR (for a main PR, develop-main strategy):
