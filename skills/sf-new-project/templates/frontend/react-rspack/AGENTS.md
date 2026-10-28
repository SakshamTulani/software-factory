# {{PROJECT_NAME}}

{{ONE_SENTENCE_DESCRIPTION}} Built for {{CLIENT_NAME}} — see [docs/client.md](docs/client.md) and [docs/product.md](docs/product.md).

## Commands

pnpm workspace. Run everything from the repo root.

```bash
pnpm dev          # dev server
pnpm check        # Definition of Done: typecheck + lint + depcruise + test
pnpm depcruise    # architecture rules only (.dependency-cruiser.cjs)
```

## Rules for every task

- Extremely concise. Sacrifice grammar for the sake of concision: drop articles, filler and ceremony; fragments fine. Never drop `not`/`never`/`only`, numbers, or exact code, commands, paths and errors. Applies to chat, plans, task notes and commit bodies. Specs, ADRs and PR descriptions stay concise but in full sentences, because people read them later.
- Follow the lifecycle in the `project-workflow` skill. It decides whether the change needs a spec.
- A task is done only when `pnpm check` is green. Never weaken a dependency-cruiser rule, skip a test or add a suppression to get there; ask instead.
- Use the domain words in [GLOSSARY.md](GLOSSARY.md).

## Read when relevant

| When you are… | Read |
|---|---|
| Writing or changing code in `src/` | the `frontend-architecture` skill |
| Building or changing UI | [DESIGN.md](DESIGN.md), then the `shadcn` skill |
| Writing or reviewing tests | the `frontend-testing` skill |
| Starting a feature, bug fix or refactor | the `project-workflow` skill |
| Branching, committing or opening a PR (`file-pr`) | [docs/agents/git.md](docs/agents/git.md) |
| Creating, reading or updating issues and tasks | [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md) |
| Looking for why something is built this way | [docs/adr/](docs/adr/README.md) |
| Looking for what a feature must do | [docs/specs/](docs/specs/README.md) |
