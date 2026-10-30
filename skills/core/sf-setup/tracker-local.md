# Issue tracker: local

Written by `/sf-setup` (tracker: `local`). Everything lives in this repo as committed markdown. No GitHub Issues.

## Shape

- **Feature and tasks:** the spec folder is the issue. Tasks are the checkboxes in `docs/specs/<slug>/plan.md`.
- **Bug / idea:** one file per item at `.scratch/issues/NN-slug.md`, numbered from `01`. Its first lines are `Type: bug|idea` and `Status: open|claimed|done`; comments go under a `## Comments` heading at the bottom.
- `.scratch/` is committed in this mode, so the team shares it.

## Operations

| A skill says… | Do |
|---|---|
| publish the feature | Nothing extra; the spec folder and its index row are the record |
| publish a task | Nothing extra; the `plan.md` checkbox is the task |
| fetch the ticket | Read the `plan.md` task, or the `.scratch/issues/` file the user names |
| claim | Append `(claimed: <git user.name>)` to the task line, or set `Status: claimed`, and commit before any work |
| comment | Append under `## Comments` with the date and author |
| done | Tick the checkbox, or set `Status: done` |
| list open work | Unticked, unclaimed tasks in plans whose `status` is `approved`; `.scratch/issues/` files with `Status: open` |
