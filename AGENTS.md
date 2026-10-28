# sf-factory

Intellicar's software factory: agent skills, distributed with the `skills` CLI, that create each client project from shared templates and give every project the same lifecycle, structure and quality gates.

## Layout

```
skills/                           # everything a project installs; one folder per skill
├── sf-new-project/               # installed globally; carries what it copies:
│   ├── templates/<type>/<name>/  #   the starting repo + skills.txt (the skills it installs)
│   ├── design-systems/<name>/    #   DESIGN.md per design system
│   └── common/                   #   files every project gets (subagent personas)
├── sf-setup/  sf-new-module/     # factory skills
├── sf-spec/ sf-plan/ sf-build/ … # lifecycle entry points (user-invoked)
└── <the rest>/                   # forked from Addy Osmani and shadcn, adapted (docs/upstream.md)
docs/                             # how the factory itself is built and decided
```

## Rules for every task

- Extremely concise. Sacrifice grammar for the sake of concision: drop articles, filler and ceremony; fragments fine. Never drop `not`/`never`/`only`, numbers, or exact code, commands, paths and errors. Applies to chat, plans, task notes and commit bodies. Skills, templates and ADRs stay concise but in full sentences, because people and agents read them later.
- Every project receives a change to `skills/` at its next `skills update`. Treat it as a full-path change ([docs/agents/workflow.md](docs/agents/workflow.md)).
- Changing a forked skill: record it in [docs/upstream.md](docs/upstream.md).

## Read when relevant

| When you are… | Read |
|---|---|
| Writing or changing a skill | [docs/agents/skill-authoring.md](docs/agents/skill-authoring.md) |
| Changing a template or design system | [docs/agents/templates.md](docs/agents/templates.md) |
| Starting any change, or testing a release | [docs/agents/workflow.md](docs/agents/workflow.md) |
| Looking for why the factory is built this way | [docs/adr/](docs/adr/README.md) |
