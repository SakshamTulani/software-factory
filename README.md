# sf-factory

Intellicar's software factory. It creates each client project from shared templates and design systems, and gives every project the same lifecycle, structure and quality gates. Everything is distributed as agent skills with the [`skills` CLI](https://github.com/vercel-labs/skills). Private repo; internal to Intellicar.

## Set up (each developer, once)

1. Node 22.20 or later.
2. Read access to this repo through git: an SSH key on your GitHub account, or `gh auth login` then `gh auth setup-git`. Check: `git ls-remote https://github.com/SakshamTulani/sf-factory.git HEAD` prints a commit.
3. Install the project creator globally:

```bash
DISABLE_TELEMETRY=1 npx -y skills@1.7.4 add SakshamTulani/sf-factory -s sf-new-project -g -a claude-code -y
```

## Start a project

```
mkdir client-x && cd client-x && claude
> /sf-new-project
```

It asks about the client, product, repo type, template and design system; copies the template; installs the project's skills into `.agents/skills/` (pinned by `skills-lock.json`); then runs `/sf-setup` for the issue tracker, git strategy and conversation log. The skills are committed with the project, so teammates who clone it need nothing else.

## Update a project's skills

From the project root:

```bash
DISABLE_TELEMETRY=1 npx -y skills@1.7.4 check     # exits 1 when sf-factory has newer skills
DISABLE_TELEMETRY=1 npx -y skills@1.7.4 update -y # pulls them in; review the diff in a PR
```

A project changes only when someone runs `update`. Template files (configs, workflows, hooks, agents) are copied once at creation and are not updated by this.

## Release a change to the factory

Merge to `main`. There is no version to bump: projects see the change at their next `npx -y skills@1.7.4 check`. Because every project receives it on update, treat any change to `skills/` as a full-path change ([docs/agents/workflow.md](docs/agents/workflow.md)).

## Layout

See [AGENTS.md](AGENTS.md). Decisions: [docs/adr/](docs/adr/README.md). Where forked skills came from: [docs/upstream.md](docs/upstream.md).
