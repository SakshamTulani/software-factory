# Git, commits and PRs

Written by `/sf-setup` (strategy: `main`). Re-run it to switch.

One production line. Code goes from a short-lived branch to `main` through a PR. Nobody pushes directly to `main`.

Enforced by `.github/workflows/pr-guard.yml` (check `pr-guard-flow`): PR title format, allowed branch prefixes, and the backend checkbox.

## Branches

| Branch | Cut from | PR into | For |
|---|---|---|---|
| `main` | — | — | Production; every merge must be releasable |
| `feat/<NNN-slug>` | `main` | `main` | Full-path work: one branch per spec, e.g. `feat/004-command-center` |
| `fix/<slug>` `refactor/<slug>` `perf/<slug>` `chore/<slug>` `docs/<slug>` | `main` | `main` | Light-path work |
| `hotfix/<slug>` | `main` | `main` | Production fix that can't wait for the next release |

Keep branches short. To catch up with `main`, run `git merge origin/main`. Never rebase a branch someone else has pulled.

Unfinished work that must merge goes behind a feature flag, because everything in `main` ships.

## Commits

Format: `type(scope): summary`

- `type`: `feat`, `fix`, `chore`, `refactor`, `perf`, `docs`, `hotfix`, `enhance`, `test`, `style`, `build`, `ci` or `revert`. Add `!` before the colon for a breaking change.
- `scope`: optional, lowercase, the module (`command-center`, `live-tracking`).
- `summary`: imperative, lowercase start, no trailing period, under 72 characters. Say why it matters: `fix(trip-report): stop CSV export dropping the last row`, not `fix(trip-report): update export util`.
- Body only when the reason isn't obvious from the subject. No file lists.
- On the full path, add the trailers `Spec: NNN-slug` and `Task: <n>`.

## Pull requests

Open them with the `file-pr` skill. Base: `main`. Title: the commit format. Body: [the PR template](../../.github/pull_request_template.md), leading with the problem. A human reviews, approves and merges; agents never merge or approve.

## Releases

Tag `main` with semver: `git tag v1.4.0 origin/main && git push origin v1.4.0`. Deploy production from the tag.

## Recommended branch protection

On `main`: require a PR, one approving review, and the `pr-guard-flow` and `pnpm check` checks. Block force-pushes.
