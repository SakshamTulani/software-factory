---
name: sf-review
description: Conduct a five-axis code review — correctness, readability, architecture, security, performance — by a reviewer with a fresh context that re-runs the checks, proves the new tests, and flags changed tests and load-bearing paths
disable-model-invocation: true
---

Invoke the code-review-and-quality skill.

The session that wrote the code is the worst reviewer of it: it remembers what it meant, not what it wrote. So this review runs in a fresh context and trusts nothing it is told about the change.

## 1. Gather the facts (this session)

- The base: the PR's base branch, else `origin/develop` if it exists, else `origin/main`. Resolve it with `git rev-parse` and stop if it doesn't resolve.
- The spec: `docs/specs/<slug>/` from the branch name or the `Spec:` trailer, or "light path".
- Changed existing tests: `git diff --name-only --diff-filter=MDR <base>...HEAD -- '*.test.ts' '*.test.tsx'`.
- Load-bearing paths touched: the diff's files matching `factory.json` `loadBearing` (git glob pathspecs, `:(glob)<pattern>`).
- The working tree must be clean and committed, because the proof below rewrites files temporarily. If it isn't, stop and ask.

## 2. Verify (the `code-reviewer` agent, fresh context)

Spawn the `code-reviewer` agent with only: the base ref, the branch, the spec path and the two lists above. Don't pass a summary of what was built; tell it to ignore any narrative and read the diff. Ask it to:

1. Read `git diff <base>...HEAD` in full before forming a view, and note anything the spec or task didn't ask for.
2. Re-run the checks itself: `pnpm check`, or `pnpm check:deep` when a load-bearing path is touched. Report the result it saw, not one it was told.
3. Prove the new tests: `bash .agents/skills/test-driven-development/prove-test.sh <base> -- <test command for the new or changed test files>`. `status=FAILED` is a Critical finding. If test and implementation can't be separated, say so.
4. For each changed existing test: was the old assertion wrong, or was it weakened to fit the code? Weakened is Critical.
5. Review the five axes below against the spec's requirements and `frontend-testing` / the project's testing skill.

## 3. Challenge (the `critic` agent, load-bearing changes only)

When a load-bearing path is touched, spawn the `critic` agent in parallel with the reviewer, with the same inputs. It argues against the change: unstated assumptions, needless abstraction, behaviour changes the tests don't cover, blast radius.

## 4. Report

Merge the reports. Categorize findings as Critical, Required, Optional or Nit, with `file:line` and a fix. Then list what needs a person before merge:

- changed existing tests (each file), and whether the reviewer judged them sound;
- load-bearing paths touched, and the critic's position;
- any check the reviewer couldn't run.

The five axes:

1. **Correctness** — Does it match the spec? Edge cases handled? Tests adequate?
2. **Readability** — Clear names? Straightforward logic? Well-organized?
3. **Architecture** — Follows existing patterns? Clean boundaries? Right abstraction level?
4. **Security** — Input validated? Secrets safe? Auth checked? (Use security-and-hardening skill)
5. **Performance** — No N+1 queries? No unbounded ops? (Use performance-optimization skill)
