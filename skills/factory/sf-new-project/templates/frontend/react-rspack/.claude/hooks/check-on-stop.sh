#!/usr/bin/env bash
# Stop hook: refuse to end a turn while `pnpm check:fast` is red (types,
# lint, architecture, and the tests related to changed files). The full
# `pnpm check` runs before each commit and in CI.
#
# The harness runs this every time Claude finishes a turn, so the checks
# can't be skipped. Exit 2 blocks the stop and hands
# stderr back to Claude. Pattern from intellicars/intqueuev2.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}" || exit 0

# Don't loop: if this hook already blocked and Claude is stopping again,
# let it through rather than trapping the session.
payload=$(cat)
active=$(printf '%s' "$payload" | node -e '
let s = ""; process.stdin.on("data", (c) => (s += c)).on("end", () => {
  try { console.log(JSON.parse(s).stop_hook_active ? "true" : "false") } catch { console.log("false") }
})' 2>/dev/null)
[ "$active" = "true" ] && exit 0

# Nothing to check until the app exists and defines the check script.
[ -f package.json ] || exit 0
node -e 'process.exit(require("./package.json").scripts?.check ? 0 : 1)' 2>/dev/null || exit 0
# Fail closed: without check:fast, run the full check rather than nothing.
script=check
node -e 'process.exit(require("./package.json").scripts?.["check:fast"] ? 0 : 1)' 2>/dev/null && script=check:fast
[ -d node_modules ] || exit 0

# A turn that changed no files (a question, a review) has nothing to check.
if git rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  && [ -z "$(git status --porcelain --untracked-files=normal -- . ':!docs' ':!*.md' 2>/dev/null)" ]; then
  exit 0
fi

if ! out=$(pnpm "$script" 2>&1); then
  {
    echo "pnpm $script is failing. Fix it before ending the turn."
    echo "Never weaken a rule, skip a test or add a suppression to get it green; if you can't fix it, say so and ask."
    echo ""
    echo "$out" | tail -60
  } >&2
  exit 2
fi
exit 0
