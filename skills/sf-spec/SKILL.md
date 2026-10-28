---
name: sf-spec
description: Start spec-driven development — write a structured specification before writing code
disable-model-invocation: true
---

Invoke the spec-driven-development skill.

Follow the `project-workflow` skill first. If the change is on the light path (bug fix, refactor), say so and stop: it needs no spec.

Begin by understanding what the user wants to build. Ask clarifying questions about:
1. The objective and target users
2. Core features and acceptance criteria
3. Which modules, REST endpoints and WebSocket topics are involved
4. Known boundaries (what to always do, ask first about, and never do)

If the request bundles several independently testable capabilities, first propose a capability map (module ids, dependency direction, build order) per the skill's Phase 0 and get it approved, then spec each module in dependency order.

Write the spec to `docs/specs/NNN-slug/spec.md` from `docs/specs/_template/spec.md`. Take the next free `NNN`, number each success criterion `REQ-NNN`, and set `status: draft`. Add the spec and its requirements to `docs/specs/README.md`.

Then stop. Print the path and say: a human must review `spec.md` and set `status: approved`, `approved-by` and `approved-on` before `/sf-plan` will run.
