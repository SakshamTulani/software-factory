# Issue tracker: hybrid

Written by `/sf-setup` (tracker: `hybrid`). Shared work is on GitHub. Each developer's own breakdown of that work stays on their machine and never enters git.

## Shape

| What | Where | Shared |
|---|---|---|
| Feature | One GitHub issue per spec, titled `Spec NNN: <name>`, labelled `spec` | yes |
| Plan tasks | Checkboxes in `docs/specs/NNN-slug/plan.md` (reviewed and approved like the spec) | yes, committed |
| Bug / idea | A GitHub issue labelled `bug` or `idea` | yes |
| Personal chunks | `.scratch/<issue#>-<slug>/NN-chunk.md`, in your own words and as fine-grained as you like | **no**: `.scratch/` is gitignored |

## Operations

| A skill says… | Do |
|---|---|
| publish the feature | `gh issue create --title "Spec NNN: …" --label spec --body "…"`; link the issue in `plan.md` |
| publish a task | Nothing on GitHub; the `plan.md` checkbox is the task |
| break a task down (personal) | Write chunk files under `.scratch/<issue#>-<slug>/`. Never commit or push them. |
| fetch the ticket | `gh issue view <n> --json number,title,body,labels,assignees,comments`, plus the `plan.md` task |
| claim | `gh issue edit <n> --add-assignee @me` on the feature or bug; for a plan task, append `(claimed: <git user.name>)` in `plan.md` on your branch |
| comment | `gh issue comment <n> --body "…"` |
| done | Tick the `plan.md` checkbox. The PR says `Closes #<n>`. When the feature's last task merges, post a short summary of what shipped on the feature issue. Personal chunks stay local. |
| list open work | `gh issue list --state open`, plus unticked, unclaimed tasks in approved plans |

## Labels

`spec`, `bug`, `idea`. `/sf-setup` creates any that are missing.
