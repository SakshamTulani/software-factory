# Git, commits and PRs

Written by `/sf-setup` (strategy: `develop-main`). Re-run it to switch. This is fms-ui's flow without its client lines: this repo serves one client.

`develop` deploys to the test environment, and `main` is production. Each branch gets **two PRs**: one into `develop` now, for testing, and a draft into `main`, merged at release. Features therefore ship one at a time.

Enforced by `.github/workflows/pr-guard.yml` (check `pr-guard-flow`) and `.github/workflows/back-merge.yml`.

## Rules

1. **Work branches from `main`** and gets two PRs from the same branch. PR 1 goes into `develop` and is merged now. PR 2 goes into `main` as a **draft** and is merged only at release.
2. **Never pull `develop` into a branch.** A branch that contains develop commits can never merge into `main`.
3. **`develop` never merges into `main`.** Code reaches `main` only through a work branch's own PR or a hotfix.
4. **Hotfixes** branch from `main`, merge into `main`, and get a second PR into `develop`.
5. **After every release** (every push to `main`), `main` is merged back into `develop`. `back-merge.yml` opens that PR.
6. Nobody pushes directly to `main` or `develop`.

## Branches

| Branch | Cut from | Merges into | For |
|---|---|---|---|
| `main` | — | — | Production |
| `develop` | `main` | nothing | Test environment. Merge commits only. |
| `feat/<NNN-slug>` | `main` | `develop`, then `main` at release | Full-path work: one branch per spec, e.g. `feat/004-command-center` |
| `fix/` `chore/` `refactor/` `perf/` `docs/` | `main` | `develop`, then `main` at release | Light-path work |
| `hotfix/<slug>` | `main` | `main`, plus a PR into `develop` | Production fix |
| `merge/<feature>` | the feature branch | `develop` | Resolving develop conflicts without touching the feature |
| `revert-*` | GitHub's Revert button | any base | Undoing a merged PR |

## Recipes

**Feature or fix**

```sh
git fetch origin
git switch -c feat/004-command-center --no-track origin/main
# ...commit...
git push -u origin feat/004-command-center
gh pr create --base develop --fill            # PR 1, merged now
gh pr create --base main --draft --fill       # PR 2, merged at release
```

More fixes after testing: push to the same branch and merge PR 1 again. At release, mark PR 2 ready and merge it.

**Develop PR has conflicts.** Don't click "Update branch" or "Resolve conflicts" on GitHub; both pull `develop` into the feature.

```sh
git switch -c merge/004-command-center feat/004-command-center
git merge origin/develop     # resolve, commit
git push -u origin merge/004-command-center
```

Close PR 1 and open `merge/004-command-center → develop`. The feature branch and PR 2 stay clean.

**Develop was pulled in by mistake.** `pr-guard-flow` names the merge that did it. Reset to the commit before it, merge `main` again and force-push:

```sh
git reset --hard <merge>^1 && git merge origin/main && git push --force-with-lease
```

If develop came in more than once, or your own commits sit on top of it, cut a fresh branch from `main`, cherry-pick your commits, and open both PRs again.

**Hotfix**

```sh
git switch -c hotfix/login-loop --no-track origin/main
```

PR into `main`, and a second PR into `develop`.

**Back-merge has conflicts.** Don't use "Resolve conflicts" on the back-merge PR; it would commit to `main`.

```sh
git switch -c merge/main-to-develop --no-track origin/main
git merge origin/develop     # resolve, commit
git push -u origin merge/main-to-develop
```

PR `merge/main-to-develop → develop` with a merge commit.

## Commits

Format: `type(scope): summary`

- `type`: `feat`, `fix`, `chore`, `refactor`, `perf`, `docs`, `hotfix`, `enhance`, `test`, `style`, `build`, `ci` or `revert`. Add `!` before the colon for a breaking change.
- `scope`: optional, lowercase, the module (`command-center`, `live-tracking`).
- `summary`: imperative, lowercase start, no trailing period, under 72 characters. Say why it matters: `fix(trip-report): stop CSV export dropping the last row`, not `fix(trip-report): update export util`.
- Body only when the reason isn't obvious from the subject. No file lists.
- On the full path, add the trailers `Spec: NNN-slug` and `Task: <n>`.

## Pull requests

Open them with the `file-pr` skill. Title: the commit format; other titles fail `pr-guard-flow`. Body: [the PR template](../../.github/pull_request_template.md), leading with the problem. A main PR links its develop PR. A human reviews, approves and merges; agents never merge, approve or mark a main PR ready.

## When a PR check fails

| Error starts with | Fix |
|---|---|
| `… cannot merge into …` | Wrong source for this base. Rename the branch with an allowed prefix (GitHub's rename keeps open PRs). |
| `Title should look like` | Edit the title to `type(scope): summary`. |
| `… has develop merged into it` | See "Develop was pulled in by mistake". |
| `Merge this branch's develop PR first` | Merge PR 1 into `develop`, then re-run the check. Drafts skip this check. |
| `Open a PR from … into develop as well` | Open the hotfix's develop PR. The main PR's check re-runs by itself. |
| `This PR needs a backend change` | Tick "Backend change is live in production" once it is released. |

## Releases

At release, mark each feature's main PR ready and merge it. Then tag `main`: `git tag v1.4.0 origin/main && git push origin v1.4.0`, and deploy production from the tag.

## Repository settings (set by a human)

- `develop`: merge commits only. The guard relies on them.
- `main` and `develop`: require a PR, one approving review, and the `pr-guard-flow` and `pnpm check` checks. Block force-pushes.
- `back-merge.yml` needs the org's `INTELLICARS_BOT_APP_ID` variable and `INTELLICARS_BOT_PRIVATE_KEY` secret, and the label `main to develop sync`.
