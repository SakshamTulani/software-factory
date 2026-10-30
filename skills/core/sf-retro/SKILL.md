---
name: sf-retro
description: Run a retrospective on a coding session, or a constraint review over a period, and propose changes to the agent's environment (checks, pointers, review rules, factory skills) so the next session goes better. Use when the user runs /sf-retro after a session that was harder than it should have been, or /sf-retro 30d for the monthly review.
disable-model-invocation: true
argument-hint: "[session: a docs/conversations/ file, a session id, or blank for this one] | [30d | since YYYY-MM-DD]"
---

# Retro

Look back over a coding session and propose changes to the agent's **environment**, not the code: the check that would have caught the mistake, the pointer that would have found the file sooner, the rule the reviewer missed. You only propose. Nothing changes until the user picks a candidate.

A smooth session has little to teach. If nothing went wrong, say so and stop rather than invent findings.

## 1. Read the session

- No argument: this session. Its struggles are still in context, so this is the best case.
- A file in the conversation log (`factory.json` `conversations.dir`, default `docs/conversations/`, written by `sf-transcribe`), or a session id. Without a transcript, read the session's raw `.jsonl` under `~/.claude/projects/`, in the folder named after this project's path.

Find the moments the agent struggled: long searches, wrong guesses, a red `pnpm check` it had to dig out of, a mistake the user or the reviewer caught, information it couldn't reach. Note where each one is in the session. **Every candidate must point to one of these moments.** Drop any that can't; that is generic advice.

## 2. Classify each moment

| What went wrong | Fix it with | Lives in |
|---|---|---|
| Took long to find a file or fact | A **navigation pointer** from a file it already reads: a row in `AGENTS.md`'s "Read when relevant" table, or a link from the doc or skill it was reading | project |
| Made a mistake a tool could have caught | An **automated check** in `pnpm check`: a Biome rule (a GritQL plugin in `biome-plugins/` for a banned call or pattern), a dependency-cruiser rule (an import or location rule), a type, or a test | project |
| The reviewer missed a judgement-call mistake | A rule in `docs/agents/review.md`, which `code-review-and-quality` applies. Create the file on first use | project |
| A quality bar was missing or lowered | `CONSTRAINTS.md`, via `constraint-driven-development` | project |
| `AGENTS.md` steering that belongs elsewhere, or lines that change nothing | Move it into a check or `review.md`, or delete it | project |
| An expensive tool call for what it returned | A cheaper command or script, or a narrower one | project |
| Needed information it couldn't reach | Wider access: tee the dev server log to a file, a read-only API token, a fixture | project |
| A factory skill (`.agents/skills/*`) gave wrong, missing or misleading guidance, or a fix every project of this template needs | A change in sf-factory | **factory** |

Rules for choosing:

- **Mechanical beats prose.** A fixed pattern (a banned API, an import shape, a file location) gets a check that fails, never a sentence. Only real judgement calls (consistency across files, "matches the surrounding code") become prose in `review.md`.
- **Look before you build.** Read `package.json`'s `check` script, `biome.json`, `.dependency-cruiser.cjs`, `.claude/settings.json` and `.github/workflows/` first. A check that exists but isn't wired, or is silently broken, is the finding; don't build a second one.
- **`AGENTS.md` stays short.** It loads into every session. Add only navigation pointers to it. Steering goes to a check or to `review.md`, which only the reviewer reads.
- **Never edit `.agents/skills/` in place.** The next `skills update` overwrites it. A project-only variant is a copy under a new name (`build-<client>`); everything else is a factory finding.

## 3. Present the candidates

Rank by severity: a shipped bug or a lowered bar first, then wasted effort, then polish. For each:

```
1. [high] Automated check · project
   Moment: task 3, the agent imported another module's store directly; pnpm check passed and the reviewer caught it.
   Fix: a dependency-cruiser rule that forbids importing src/modules/*/store from outside that module.
```

Then ask which to apply. Wait for the answer.

## 4. Apply the chosen ones

- **Project fixes** are a light-path change: on a branch, as in `docs/agents/git.md`, one commit per fix.
- **Factory fixes:** draft an issue for sf-factory with the title, the moment, the skill or template file at fault, and the proposed change. Write it for every client: no client names, data, endpoints or transcript excerpts with confidential detail. Show the draft. On a yes, file it with `gh issue create --repo SakshamTulani/sf-factory --title "retro: …" --body "…"`. If `gh` can't reach the repo, print the draft for the user to pass on. Where the project can't wait, also apply a project-side fix and say it is temporary.

## Period mode: `/sf-retro 30d`

With a period (`30d`, `since 2026-10-01`) instead of a session, review the checks themselves: tighten where one let a bug through, loosen where one only costs. Run it monthly, and after any bug that reached develop or production.

**Gather evidence** for the period, and say where records are incomplete rather than guessing:

1. **Escaped bugs.** `fix:` commits and PRs in the period. For each, find the change that introduced the bug (`git log -L`, `git blame` on the fixed lines) and name the check that should have caught it: a type, a lint or dependency-cruiser rule, a test, the review. This is the most valuable input.
2. **Repeated review findings.** Comments on merged PRs (`gh pr list --state merged --search "merged:>=<date>"`, then each PR's review comments) and `/sf-review` findings in the conversation log. The same finding three times is a candidate for a deterministic check, because a check can't be talked out of its verdict and a reviewer can.
3. **Human-read boxes.** How often PRs ticked "A person read the changes to existing tests" and "A person read the load-bearing changes", and whether any of those reads found something.
4. **Friction.** Guard-hook blocks and asks, `/sf-build auto` stops, and Stop-hook failures that turned out to be noise, from the conversation log.

**Propose**, most severe first:

- **Tighten** when an escaped bug traces to a check you trusted: say which check and what it missed, and propose the fix. This is not a judgement call.
- **Turn a repeated review finding into a check**, built as in step 2's rules.
- **Loosen** only with a named run of evidence: "14 PRs touched `src/shared/config/**` in 6 weeks; the read found nothing; drop it from `loadBearing`." An anecdote is not evidence. Never loosen a check because it is inconvenient once.

Apply the ones the user picks as in step 4. Record each accepted tighten or loosen, with its evidence, in `CONSTRAINTS.md` (its review log, as `constraint-driven-development` describes), so the next review starts from it.

## 5. Verify

- Every candidate names its moment in the session.
- A new check fails on the original mistake (show it, then revert the deliberate violation) and `pnpm check` is green on the current code.
- A new pointer resolves: the linked file exists.
- Report what was applied, what was filed or drafted for the factory, and what was declined.
