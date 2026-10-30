---
name: sf-setup
description: Configure a factory project's issue tracker, git strategy, conversation log and upstream sources (backend repos, OpenAPI/Swagger, doc links). Run by sf-new-project as its last step, or by the user to switch any of them later.
---

# Setup

Writes the per-project choices that other skills read:

- `docs/agents/issue-tracker.md`: where specs' tasks, bugs and ideas live
- `docs/agents/git.md`: branches, where PRs go, how releases happen
- the conversation log: whether sessions are saved, whether they're in git, and whether they're saved automatically after every turn
- `docs/agents/upstream.md`: the repos and documents this project consumes but doesn't own, and where to request changes from them
- the `tracker`, `git` and `conversations` fields of `factory.json`

This is a prompt-driven skill, not a script. Explore, present what you found, ask, confirm a draft, then write.

## 1. Explore

Read what exists; don't assume.

- `git remote -v`: is there a remote, and on which host?
- `gh auth status`: can `gh` reach it?
- `git branch -a`: is there already a `develop` branch?
- `factory.json`, `docs/agents/issue-tracker.md`, `docs/agents/git.md`, `docs/agents/upstream.md`, `docs/conversations/`: is this a re-run? If so, show the current choices and ask only about the part the user wants to change.

## 2. Ask, one section at a time

Lead each question with the recommended answer, so the user can accept it in a word. Skip a section that exploration already settled.

**Section A: Issue tracker.**

> Where do tasks, bugs and ideas live? Skills publish to and read from this place.

| Choice | When to recommend it | Adapter |
|---|---|---|
| `hybrid` (default) | GitHub remote, team project | [tracker-hybrid.md](tracker-hybrid.md) |
| `github` | Team wants every task visible on GitHub | [tracker-github.md](tracker-github.md) |
| `local` | No GitHub remote, or solo work | [tracker-local.md](tracker-local.md) |

`github` and `hybrid` need a reachable GitHub repo. `sf-new-project` normally set the remote already; if there is none, recommend `local`, or get the URL, run `git remote add origin <url>`, and check that `gh repo view` prints the repo before going on. If it can't, stop and say what's missing.

**Section B: Git strategy.**

> How does code reach production? This decides where PRs go and how releases happen.

| Choice | When to recommend it | Adapter |
|---|---|---|
| `develop-main` (default) | A shared test environment sees every change before production, and features are released one at a time: each branch gets a PR into `develop` and a draft PR into `main`. | [git-develop-main.md](git-develop-main.md) |
| `main` | No shared test environment; one production line, testing on PR previews or locally | [git-main.md](git-main.md) |

Recommend `main` only when the user says there is no test environment.

**Section C: Conversation log.**

> Should Claude Code sessions be saved as Markdown transcripts, and should they be in git? They record what was asked and decided, which helps a teammate pick up work or re-open a decision.

| Choice | Means | When to recommend it |
|---|---|---|
| `local` (default) | Saved to `docs/conversations/`, gitignored: each developer keeps their own | Most projects |
| `committed` | Saved to `docs/conversations/` and committed with the work | The team wants a shared record of decisions, and accepts reviewing transcripts before pushing |
| `off` | Not saved | The user doesn't want logs |

For `committed`, say plainly: a transcript holds everything said in the session, including anything pasted, so each one must be checked for secrets and client-confidential detail before it's pushed.

If it isn't `off`, ask one follow-up:

> Save automatically after every turn, so the log is always current? (recommended: **yes**) Otherwise only when someone runs `/sf-transcribe`.

**Section D: Upstream sources.** Ask by default when `factory.json` `template` starts with `frontend/`; for any other project, ask only if the user brings it up.

> Where do business and backend details come from? List each source: a backend GitHub repo, an OpenAPI/Swagger URL or file, a doc link. Any number, or none for now. This project's specs and ADRs will cover frontend decisions only and cite these for the rest.

For each source, settle its row in [upstream.md](upstream.md), one question at a time:

- **Kind:** `github-repo`, `openapi` or `doc`.
- **Location:** `owner/repo` and the branch to read (recommend the backend's integration branch, `develop` if it has one, else its default); the URL or path; the doc link.
- **Auth:** `gh` for repos. For a URL that needs a token, the name of the environment variable that holds it (recommend `<NAME>_API_TOKEN`); never the token itself. For a private doc, the connector or MCP tool that reads it, if any.
- **Requests go to:** for a repo, its own issues, label `spec-request`. For an OpenAPI or doc source, the repo source that owns it.

Check each source as it's added: a repo with `gh repo view <owner/repo>`, which proves read access; an OpenAPI URL by fetching it as `upstream.md` says and printing `info.version`; a doc by opening it. Report a failure and keep the row, marked unverified; access can come later. For each request repo, `gh label list -R <owner/repo>` shows whether `spec-request` exists. If it doesn't, say so: ask that repo's owners to create it, or file requests without a label. Don't create labels on another team's repo.

## 3. Confirm

Show a draft of every file, with the adapter's `{{…}}` placeholders filled in, plus the `factory.json` change and any `.gitignore` or `.claude/settings.json` change. Let the user edit before anything is written.

## 4. Write

- Write `docs/agents/issue-tracker.md` and `docs/agents/git.md` from the chosen adapters. Replace each file whole; these files are owned by this skill.
- Set `"tracker"` and `"git"` in `factory.json`.
- Write `docs/agents/upstream.md` from [upstream.md](upstream.md), one row per source in place of `{{SOURCE_ROWS}}`, and drop the examples comment. With no sources, write the row `| none yet | | | | |`. Replace the file whole. If the file isn't in the template yet (an older project), create it and add `| Needing business, backend or API detail about a feature | [docs/agents/upstream.md](docs/agents/upstream.md) |` to `AGENTS.md`'s "Read when relevant" table, which asks first because `AGENTS.md` is a guardrail.
- `hybrid`: add `.scratch/` to `.gitignore` if it isn't there.
- `develop-main`: copy [workflows/back-merge.yml](workflows/back-merge.yml) to `.github/workflows/back-merge.yml`. `.github/workflows/pr-guard.yml` is already in the template and serves both strategies.
- `develop-main` with a remote and no `develop` branch: if the repo has a commit, **ask before pushing**, and on yes run `git push origin main:develop`. If it has no commit yet (run from `sf-new-project`), don't push; `sf-new-project` creates `develop` after its first push. Never push without a yes.
- `main`: delete `.github/workflows/back-merge.yml` if a previous run created it.
- Create the labels the repo lacks (`gh label create`): the tracker adapter's labels, plus `main to develop sync` for `develop-main`.
- Conversation log: set `"conversations": {"mode": "local|committed|off", "auto": true|false, "dir": "docs/conversations"}` in `factory.json`.
  - `local`: add `docs/conversations/` to `.gitignore`. `committed`: remove that line if a previous run added it.
  - `auto: true`: add this entry to the `Stop` array in `.claude/settings.json`, next to the existing `check-on-stop.sh` entry (both run after every turn). `auto: false` or `off`: remove it if present.

    ```json
    { "hooks": [ { "type": "command", "command": "python3 \"$CLAUDE_PROJECT_DIR\"/.agents/skills/sf-transcribe/transcribe.py --from-hook", "timeout": 30 } ] }
    ```

    The script reads `factory.json` too, so turning `auto` off there also stops it. It never fails a turn: a save that can't happen is skipped silently.

## 5. Done

Say which files were written, and which upstream sources are unverified or need a token set. A developer who joins later sets each token named in `upstream.md` in their own shell or `.env`. Recommend the branch protection the chosen git adapter lists. It's a GitHub repository setting, so the user sets it; don't change it yourself. To switch later, re-run `/sf-setup`.
