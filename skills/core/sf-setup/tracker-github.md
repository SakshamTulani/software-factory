# Issue tracker: GitHub

Written by `/sf-setup` (tracker: `github`). Everything lives in this repo's GitHub Issues. Use `gh` for every operation; it infers the repo from `git remote`.

## Shape

- **Feature:** one issue per spec, titled `Spec NNN: <name>`, labelled `spec`. The body links `docs/specs/NNN-slug/`.
- **Task:** one issue per `plan.md` task, as a sub-issue of its feature, titled `NNN.<n> <task>`, labelled `task`. The body has the acceptance criteria and the `REQ` ids.
- **Bug / idea:** an issue labelled `bug` or `idea`.
- `plan.md` stays the ordered source of truth; issues mirror it.

## Operations

| A skill says… | Do |
|---|---|
| publish the feature | `gh issue create --title "Spec NNN: …" --label spec --body "…"` |
| publish a task | `gh issue create --parent <feature#> --title "NNN.<n> …" --label task --body "…"` (`gh` 2.94+; older: put `Part of #<feature>` on the first line) |
| mark blocked | `gh issue edit <task#> --add-blocked-by <other#>`; older `gh`: a `Blocked by: #n` line |
| fetch the ticket | `gh issue view <n> --json number,title,body,labels,assignees,comments` |
| claim | `gh issue edit <n> --add-assignee @me`, before any work |
| comment | `gh issue comment <n> --body "…"` |
| done | Merge the PR with `Closes #<n>`; otherwise comment the reason, then `gh issue close <n>` |
| list open work | `gh issue list --label task --state open --json number,title,assignees` |

A task is free to start when it is open, unassigned and has no open blockers.

## Labels

`spec`, `task`, `bug`, `idea`. `/sf-setup` creates any that are missing.
