#!/usr/bin/env bash
# PreToolUse hook on Edit|Write|MultiEdit|NotebookEdit: a person approves every
# edit to a load-bearing path (factory.json loadBearing) and to factory.json
# itself, which holds the list. The list stays in one place; this hook reads it.
#
# Patterns are git glob pathspecs, as in pr-guard.yml: `**` crosses folders,
# `*` and `?` don't. Fails open (exit 0) when node or factory.json is missing,
# because pr-guard.yml still requires a person's read at the PR.
set -uo pipefail

root=${CLAUDE_PROJECT_DIR:-$(pwd)}
[ -f "$root/factory.json" ] || exit 0

ROOT="$root" node -e '
const fs = require("fs"), path = require("path");
let s = ""; process.stdin.on("data", (c) => (s += c)).on("end", () => {
  let file;
  try {
    const input = JSON.parse(s).tool_input ?? {};
    file = input.file_path ?? input.notebook_path;
  } catch { return }
  if (!file) return;
  const root = process.env.ROOT;
  const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join("/");
  if (rel.startsWith("../")) return;

  let globs = [];
  try { globs = JSON.parse(fs.readFileSync(path.join(root, "factory.json"), "utf8")).loadBearing ?? [] } catch {}

  const toRegExp = (g) => new RegExp("^" + g.split("**/").map((part) =>
    part.split("**").map((p) =>
      p.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]")
    ).join(".*")
  ).join("(?:.*/)?") + "$");

  const hit = rel === "factory.json" ? "factory.json" : globs.find((g) => toRegExp(g).test(rel));
  if (!hit) return;
  process.stdout.write(JSON.stringify({ hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "ask",
    permissionDecisionReason: `${rel} is load-bearing (factory.json: ${hit}). A mistake here reaches every screen or weakens a guardrail. Approve only if you asked for this change or an approved plan task names this path.`,
  } }) + "\n");
});' 2>/dev/null

exit 0
