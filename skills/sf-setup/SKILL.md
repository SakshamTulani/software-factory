---
name: sf-setup
description: Configure a factory project's issue tracker, git strategy and conversation log. Run by sf-new-project as its last step, or by the user to switch any of them later.
---

# Setup

Writes the per-project choices that other skills read:

- `docs/agents/issue-tracker.md`: where specs' tasks, bugs and ideas live
- `docs/agents/git.md`: branches, where PRs go, how releases happen
- the conversation log: whether sessions are saved, whether they're in git, and whether saving is automatic
- the `tracker`, `git` and `conversations` fields of `factory.json`

This is a prompt-driven skill, not a script. Explore, present what you found, ask, confirm a draft, then write.

## 1. Explore

Read what exists; don't assume.

- `git remote -v`: is there a remote, and on which host?
- `gh auth status`: can `gh` reach it?
- `git branch -a`: is there already a `develop` branch?
- `factory.json`, `docs/agents/issue-tracker.md`, `docs/agents/git.md`, `docs/conversations/`: is this a re-run? If so, show the current choices and ask only about the part the user wants to change.

## 2. Ask, one section at a time

Lead each question with the recommended answer, so the user can accept it in a word. Skip a section that exploration already settled.

**Section A: Issue tracker.**

> Where do tasks, bugs and ideas live? Skills publish to and read from this place.

| Choice | When to recommend it | Adapter |
|---|---|---|
| `hybrid` (default) | GitHub remote, team project | [tracker-hybrid.md](tracker-hybrid.md) |
| `github` | Team wants every task visible on GitHub | [tracker-github.md](tracker-github.md) |
| `local` | No GitHub remote, or solo work | [tracker-local.md](tracker-local.md) |

`github` and `hybrid` need a reachable GitHub repo. If there is no remote, get the URL, run `git remote add origin <url>`, and check that `gh repo view` prints the repo before going on. If it can't, stop and say what's missing.

**Section B: Git strategy.**

> How does code reach production? This decides where PRs go and how releases happen.

| Choice | When to recommend it | Adapter |
|---|---|---|
| `develop-main` (default) | A shared test environment sees every change before production, and features are released one at a time. fms-ui's flow without client lines. | [git-develop-main.md](git-develop-main.md) |
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

> Save automatically when each session ends? (recommended: **yes**) Otherwise only when someone runs `/sf-transcribe`.

## 3. Confirm

Show a draft of both files, with the adapter's `{{…}}` placeholders filled in, plus the `factory.json` change and any `.gitignore` or `.claude/settings.json` change. Let the user edit before anything is written.

## 4. Write

- Write `docs/agents/issue-tracker.md` and `docs/agents/git.md` from the chosen adapters. Replace each file whole; these files are owned by this skill.
- Set `"tracker"` and `"git"` in `factory.json`.
- `hybrid`: add `.scratch/` to `.gitignore` if it isn't there.
- `develop-main`: copy [workflows/back-merge.yml](workflows/back-merge.yml) to `.github/workflows/back-merge.yml`. `.github/workflows/pr-guard.yml` is already in the template and serves both strategies.
- `develop-main` with a remote and no `develop` branch: **ask before pushing.** On yes, run `git push origin main:develop`. Never push without that yes.
- `main`: delete `.github/workflows/back-merge.yml` if a previous run created it.
- Create the labels the repo lacks (`gh label create`): the tracker adapter's labels, plus `main to develop sync` for `develop-main`.
- Conversation log: set `"conversations": {"mode": "local|committed|off", "auto": true|false, "dir": "docs/conversations"}` in `factory.json`.
  - `local`: add `docs/conversations/` to `.gitignore`. `committed`: remove that line if a previous run added it.
  - `auto: true`: add this to the `hooks` of `.claude/settings.json`, keeping the existing `Stop` hook. `auto: false` or `off`: remove it if present.

    ```json
    "SessionEnd": [
      { "hooks": [ { "type": "command", "command": "python3 \"$CLAUDE_PROJECT_DIR\"/.agents/skills/sf-transcribe/transcribe.py --from-hook", "timeout": 30 } ] }
    ]
    ```

    The script reads `factory.json` too, so turning `auto` off there also stops it.

## 5. Done

Say which files were written. Recommend the branch protection the chosen git adapter lists. It's a GitHub repository setting, so the user sets it; don't change it yourself. To switch later, re-run `/sf-setup`.
