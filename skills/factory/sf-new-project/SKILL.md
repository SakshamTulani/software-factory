---
name: sf-new-project
description: Create a new Intellicar client project from sf-factory — asks about the client, product, repo type, template and design system, copies the template, installs the project's skills and runs sf-setup. Use when the user wants to start a new client project or repo.
disable-model-invocation: true
---

# New project

Creates a client project in the current directory. This skill is installed globally (`npx -y skills@1.7.4 add SakshamTulani/sf-factory -s sf-new-project -g -a claude-code`), because it runs before the project exists.

Everything it copies lives in this skill's own folder:

| Folder | What it holds |
|---|---|
| `templates/<repo-type>/<template>/` | The starting repo, plus `skills.txt`: the skills that template installs |
| `design-systems/<name>/DESIGN.md` | The design systems; see `design-systems/README.md` |
| `common/` | Files every project gets, whatever the template (the subagent personas) |

This is a prompt-driven skill. Explore, ask, show a draft, then write.

## 1. Check the starting point

- The directory should be empty, or hold only a fresh `git init` / a README. If it holds code, stop and ask; this skill doesn't convert existing repos.
- `node --version` is 22.20 or later; the `skills` CLI needs it.
- The machine can read `SakshamTulani/sf-factory`: `git ls-remote https://github.com/SakshamTulani/sf-factory.git HEAD` prints a commit. If not, tell the user to run `gh auth login` then `gh auth setup-git` (or add an SSH key), and stop.

## 2. Ask, one question at a time

Lead with the recommended answer where there is one, so the user can accept it in a word.

1. **Client**: name, and in a sentence or two what they do.
2. **Product**: name, and one sentence on what we're building for them.
3. **Repo type**: list the folders in `templates/`. Only `frontend` exists today; if the user needs another, stop and say so.
4. **Template**: list the folders in `templates/<repo-type>/`. Recommend `react-rspack`.

   | Template | Stack |
   |---|---|
   | `frontend/react-rspack` | Rspack, React 19, TanStack Query (store-owned cache), WebSocket client, Tailwind v4 + shadcn, React Router 7, Zustand, Rstest + happy-dom + RTL + MSW, Biome, dependency-cruiser |
5. **Design system** (frontend only): list `design-systems/README.md`'s table. Recommend `intellicar-default`.
6. **Project name**: kebab-case. Recommend `<client>-<product>`.
7. **Git remote**: where the repo will live.
   - **An existing empty repo** (recommended when one was already created): take its URL, SSH (`git@github.com:<owner>/<name>.git`) or HTTPS.
   - **Create one now**: ask for the owner (user or org) and confirm `<owner>/<project-name>`, private. Creating a repo is visible to others, so create it only after the user says yes in step 3.
   - **None for now**: the project stays local; `sf-setup` will then recommend the `local` tracker.

The tracker, git strategy and conversation log are asked by `sf-setup` in step 7.

## 3. Confirm

Show the answers and what will be written, including any repo to be created. Let the user correct anything before you write.

## 4. Write the files

1. Copy `templates/<repo-type>/<template>/` into the project root, including dotfiles (`.claude/`, `.github/`, `.dependency-cruiser.cjs`). **Don't copy `skills.txt`.**
2. Copy `common/` into the project root, merging into the existing `.claude/`.
3. Copy `design-systems/<name>/DESIGN.md` over the placeholder `DESIGN.md`.
4. Fill the placeholders in every copied text file: `{{PROJECT_NAME}}`, `{{CLIENT_NAME}}`, `{{PRODUCT_NAME}}`, `{{ONE_SENTENCE_DESCRIPTION}}`. Replace only these four names; leave every other `{{ … }}` alone (GitHub Actions `${{ … }}` expressions, JSX). Then `grep -rnE '\{\{(PROJECT_NAME|CLIENT_NAME|PRODUCT_NAME|ONE_SENTENCE_DESCRIPTION)\}\}' . --exclude-dir=.git` must find nothing.
5. Fill `docs/client.md` and `docs/product.md` from the answers. Keep their headings. Write "TBD" under any heading you have no answer for, so nothing is invented.
6. `chmod +x .claude/hooks/*.sh`.
7. If this isn't a git repo, run `git init -b main`.
8. Set the remote from question 7:
   - Existing repo: `git remote add origin <url>`.
   - Create: `gh repo create <owner>/<project-name> --private`, then `git remote add origin git@github.com:<owner>/<project-name>.git` (HTTPS if the user's git uses HTTPS).
   - Then run `git ls-remote origin`. If it fails, report the error and continue without a remote; the user can add it later. If it succeeds and prints nothing, the repo is empty: carry on. If it prints any refs, the remote already has history: stop and ask, because this skill starts a repo from scratch and won't merge into existing history.

## 5. Install the project's skills

Read the skill names from `templates/<repo-type>/<template>/skills.txt` (skip blank lines and `#` lines), then from the project root:

```bash
DISABLE_TELEMETRY=1 npx -y skills@1.7.4 add SakshamTulani/sf-factory -a claude-code codex -y -s <name> <name> …
```

Check: `.agents/skills/<name>/SKILL.md` exists for every listed name, `.claude/skills/` resolves to them, and `skills-lock.json` lists them. If any is missing, stop and report what the CLI printed.

## 6. Record the factory state

Write `factory.json`:

```json
{
  "factory": "SakshamTulani/sf-factory",
  "factoryCommit": "<sha from: git ls-remote https://github.com/SakshamTulani/sf-factory.git HEAD>",
  "template": "<repo-type>/<template>",
  "designSystem": "<name>",
  "createdOn": "<YYYY-MM-DD>",
  "tracker": null,
  "git": null,
  "conversations": null
}
```

`sf-setup` fills `tracker`, `git` and `conversations`.

## 7. Configure the tracker, git strategy and conversation log

Run the `sf-setup` skill. It asks about the tracker, the git strategy and the conversation log, and writes `docs/agents/issue-tracker.md`, `docs/agents/git.md`, the matching workflow files and any hook.

## 8. Done

- Run `pnpm install` (it fetches the private `intellicars/fmswsclientjs`, so it needs the same git access as step 1), then `pnpm check` and `pnpm build`, and report the result. A fresh project must be green: no modules, the shell's own tests passing.
- If the design system isn't `intellicar-default`, re-map the tokens in `src/index.css` from the new `DESIGN.md` with the `shadcn` skill ("apply this DESIGN.md"). The template's `index.css` carries `intellicar-default`'s tokens.
- Tell the user to copy `.env.example` to `.env` and fill in the URLs, and, for CI, to add a read-only `GH_PAT` repository secret so `.github/workflows/ci.yml` can fetch `fmswsclientjs`.
- Show `git status`, then offer, as one question, to commit and push. Do neither without a yes.
  1. `git add -A && git commit -m "chore: create project from sf-factory"`.
  2. With a remote: `git push -u origin main`. For the `develop-main` strategy also `git push origin main:develop`; `sf-setup` couldn't create `develop` earlier because the repo had no commit yet.
  3. Point to the branch protection `docs/agents/git.md` recommends, and the `GH_PAT` secret CI needs. Both are repository settings the user sets.
- Tell the user what comes next: describe the first feature with `/sf-spec`.
