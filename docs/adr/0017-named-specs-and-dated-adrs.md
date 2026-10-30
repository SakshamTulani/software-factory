---
status: accepted
date: 2026-10-30
deciders: sakshamtulani
superseded-by:
---

# 0017. Specs are named, requirement ids are per spec, project ADRs are dated

## Context

ADR 0006 numbered specs from a project-wide counter (`docs/specs/004-command-center/`), and requirements too (`REQ-001` across all specs). Project ADRs were `NNNN-slug.md`. A counter works for one developer. When two developers branch at the same time, both take the next free number, and the clash only surfaces at merge, after the number has spread into the branch name, tracker titles, commit trailers, test names and the specs index. Appending rows to the end of the index also conflicts on every parallel merge.

## Decision

- A spec is `docs/specs/<slug>/`, its branch `feat/<slug>`, its commit trailer `Spec: <slug>`, its tracker issue `Spec <slug>: <name>` and its tasks `<slug> task <n>: <task>`. The slug is a short kebab-case name, never a number. Two specs that pick the same slug collide on the same path, so git reports it loudly.
- Requirements are `REQ-1`, `REQ-2` … within a spec, and are cited as `<slug>/REQ-<n>` everywhere outside its folder: tests, PRs, tracker issues and other specs. The id is its own path, so the project-wide requirements table is dropped. Ids are still permanent once approved and are superseded, never renumbered.
- `docs/specs/README.md` lists specs only, in alphabetical order, so parallel additions land on different lines.
- Project ADRs are `docs/adr/YYYY-MM-DD-<slug>.md`, listed in date order. The template's ADR has no number in its title.
- Existing `NNN-` specs, `REQ-NNN` ids and `NNNN-` ADRs keep their names. Only new ones follow this convention.
- The factory's own ADRs in this repo stay numbered: one author, and their numbers are already cited everywhere.

## Alternatives considered

- **Date plus slug for specs (`2026-10-30-command-center`).** Lost because the date makes branch names and test names longer without preventing any clash a slug doesn't.
- **The tracker's issue number (`feat/123-command-center`).** Lost because the local tracker has no issue numbers.
- **Keep the counter and renumber on merge.** Lost because the number has already spread into the branch, issues, trailers and test names by then, and renaming all of them is easy to get wrong.

## Consequences

- Nothing needs coordinating before starting a spec or an ADR.
- Test names are longer (`it("command-center/REQ-4: …")`). `grep -w command-center/REQ-4` still finds them, and it doesn't match `REQ-40`.
- Specs no longer sort by age in `ls`; the index's Status column and git history give the order.
- Template files are copied once, so existing projects keep their numbered `_template` and index until someone updates them by hand. The skills describe the new convention and accept old names.
