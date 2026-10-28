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
   | `frontend/react-rspack` | Rspack, React 19, TanStack Query (store-owned cache), WebSocket client, Tailwind v4 + shadcn, React Router 7, Zustand, Vitest + RTL + MSW, Biome, dependency-cruiser |
5. **Design system** (frontend only): list `design-systems/README.md`'s table. Recommend `intellicar-default`.
6. **Project name**: kebab-case. Recommend `<client>-<product>`.

The tracker and git strategy are asked by `sf-setup` in step 7.

## 3. Confirm

Show the answers and what will be written. Let the user correct anything before you write.

## 4. Write the files

1. Copy `templates/<repo-type>/<template>/` into the project root, including dotfiles (`.claude/`, `.github/`, `.dependency-cruiser.cjs`). **Don't copy `skills.txt`.**
2. Copy `common/` into the project root, merging into the existing `.claude/`.
3. Copy `design-systems/<name>/DESIGN.md` over the placeholder `DESIGN.md`.
4. Fill the placeholders in every copied text file: `{{PROJECT_NAME}}`, `{{CLIENT_NAME}}`, `{{PRODUCT_NAME}}`, `{{ONE_SENTENCE_DESCRIPTION}}`. Replace only these four names; leave every other `{{ … }}` alone (GitHub Actions `${{ … }}` expressions, JSX). Then `grep -rnE '\{\{(PROJECT_NAME|CLIENT_NAME|PRODUCT_NAME|ONE_SENTENCE_DESCRIPTION)\}\}' . --exclude-dir=.git` must find nothing.
5. Fill `docs/client.md` and `docs/product.md` from the answers. Keep their headings. Write "TBD" under any heading you have no answer for, so nothing is invented.
6. `chmod +x .claude/hooks/*.sh`.
7. If this isn't a git repo, run `git init -b main`.

## 5. Install the project's skills

Read the skill names from `templates/<repo-type>/<template>/skills.txt` (skip `#` lines), then from the project root:

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

- If the project has a `package.json`, run `pnpm install` and `pnpm check`, and report the result.
- Show `git status`. Offer the first commit (`chore: create project from sf-factory`), but don't commit or push unless the user says so.
- Tell the user what comes next: describe the first feature with `/sf-spec`.
