#!/usr/bin/env bash
# PreToolUse hook on Bash: an agent never merges, never rewrites a shared
# branch and never routes around the guardrails. Adapted from
# addyosmani/factory's block-merge.sh (MIT).
#
# Defence in depth only: branch protection on main and develop is the real
# boundary (docs/agents/git.md). Exit 2 blocks the call and hands stderr back
# to Claude. Printing an "ask" decision makes Claude Code ask the user.
set -uo pipefail

cmd=$(node -e '
let s = ""; process.stdin.on("data", (c) => (s += c)).on("end", () => {
  try { process.stdout.write(JSON.parse(s).tool_input?.command ?? "") } catch {}
})' 2>/dev/null)
[ -z "$cmd" ] && exit 0

block() {
  echo "Blocked by .claude/hooks/guard-git.sh: $1." >&2
  echo "Merging and protected branches belong to a person (docs/agents/git.md). Open a PR and stop; don't look for another route." >&2
  exit 2
}

ask() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"%s"}}\n' "$1"
  exit 0
}

protected='(main|master|develop)'

case "$cmd" in
  *"gh pr merge"*) block "gh pr merge" ;;
  *"mergePullRequest"* | *"/pulls/"*"/merge"*) block "the GitHub merge API" ;;
  *"--no-verify"*) block "--no-verify skips the pre-commit checks" ;;
esac

if grep -qE '(^|[;&|[:space:]])git[[:space:]]+push' <<<"$cmd"; then
  # --force-with-lease is the documented recovery for a feature branch; plain --force never is.
  if grep -qE '[[:space:]](--force|-f)([[:space:]]|$)' <<<"$cmd"; then
    block "force push without --force-with-lease"
  fi
  # Any argument naming a protected branch as the target: main, :main, HEAD:develop, x:refs/heads/main.
  for arg in ${cmd#*push}; do
    if grep -qE "^\+?([^:]*:)?(refs/heads/)?$protected$" <<<"$arg"; then
      block "push to a protected branch"
    fi
  done
  if grep -qE "^$protected$" <<<"$(git branch --show-current 2>/dev/null)"; then
    block "push while on a protected branch"
  fi
fi

if grep -qE '(^|[;&|[:space:]])git[[:space:]]+(merge|rebase|reset)([[:space:]]|$)' <<<"$cmd" \
  && grep -qE "^$protected$" <<<"$(git branch --show-current 2>/dev/null)"; then
  block "merge, rebase or reset on a protected branch"
fi

# Shell writes to the guardrails, which settings.json's Edit rules don't see
# (rm, mv, cp, scripts). A person approves each one.
guarded='(\.claude/|\.husky/|\.github/workflows/|\.dependency-cruiser\.cjs|biome\.json|biome-plugins/|rstest\.config\.ts|CONSTRAINTS\.md|AGENTS\.md)'
if grep -qE "$guarded" <<<"$cmd" \
  && grep -qE '(^|[;&|[:space:]])(sed|perl|tee|rm|mv|cp|truncate|>|>>)([[:space:]]|$)' <<<"$cmd"; then
  ask "This command writes to a guardrail file (lint, architecture, test or agent config). Approve only if you asked for this change."
fi

exit 0
