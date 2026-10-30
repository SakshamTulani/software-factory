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

Before asking about endpoints, topics or business rules, run the `sf-upstream` skill's **Read** for the feature, so the questions start from the upstream contract rather than from memory. Ask the user only what upstream doesn't answer. This spec records this repo's decisions only; the contract and business rules are cited, not decided here. Each gap goes through `sf-upstream` **Request** and becomes an Open question linked to the request, so the spec can't be approved while it waits.

If the request bundles several independently testable capabilities, first propose a capability map (module ids, dependency direction, build order) per the skill's Phase 0 and get it approved, then spec each module in dependency order.

Write the spec to `docs/specs/<slug>/spec.md` from `docs/specs/_template/spec.md`. The slug is a short kebab-case name (`command-center`), never a number; if the folder exists, pick another. Claim the slug before writing: with a remote, run `git ls-remote --exit-code --heads origin feat/<slug>`; if the branch exists, someone else has the slug, so pick another. Otherwise create `feat/<slug>` from the base `docs/agents/git.md` names and push it at once (`git push -u origin feat/<slug>`). The first push wins, so two people can't start the same spec. Commit the spec on that branch. Number each success criterion `REQ-1`, `REQ-2` … within the spec, and set `status: draft`. Fill "Upstream contract" from the Read: each source with its SHA or version and date, and what the spec uses from it. If the project's template predates that section, add it after "Modules touched" anyway. Add the spec's row to `docs/specs/README.md` in alphabetical order.

If the spec will change a path in `factory.json` `loadBearing`, run the `critic` agent on the draft and put its strongest objection under Open questions.

Then stop. Print the path and say: a human must review `spec.md` and set `status: approved`, `approved-by` and `approved-on` before `/sf-plan` will run.
