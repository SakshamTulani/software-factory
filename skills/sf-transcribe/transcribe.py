#!/usr/bin/env python3
"""Render a Claude Code session transcript (JSONL) as Markdown.

Usage: transcribe.py [--topic TEXT] [--session-id ID] [--transcript PATH] [--out-dir DIR] [--no-tools] [--from-hook]
Prints the path of the written Markdown file.

Files are named YYYY-MM-DD-<author>-<topic>-<id6>.md so they sort by date and say
who held the session. Re-running for the same session rewrites that session's file.
In a factory project the output folder and on/off state come from factory.json.
"""
import argparse
import glob
import json
import os
import re
import subprocess
import sys
from datetime import datetime

HOME = os.path.expanduser("~")


def find_transcript(session_id, explicit):
    candidates = []
    if explicit:
        candidates.append(explicit)
    if os.environ.get("CLAUDE_TRANSCRIPT_PATH"):
        candidates.append(os.environ["CLAUDE_TRANSCRIPT_PATH"])
    if session_id:
        candidates.append(f"{HOME}/.claude/sessions/{session_id}/transcript.jsonl")
        candidates += sorted(glob.glob(f"{HOME}/.claude/projects/*/{session_id}.jsonl"))
    for path in candidates:
        if os.path.isfile(path):
            return path
    # Fall back to the newest transcript in this working directory's project folder.
    slug = re.sub(r"[^A-Za-z0-9]", "-", os.getcwd())
    local = sorted(glob.glob(f"{HOME}/.claude/projects/{slug}/*.jsonl"), key=os.path.getmtime)
    if local:
        return local[-1]
    sys.exit(f"No transcript found. Tried: {candidates or 'nothing (no session id)'}")


def session_name(records, session_id):
    custom = ai = None
    for r in records:
        if r.get("type") == "custom-title" and r.get("customTitle"):
            custom = r["customTitle"]
        elif r.get("type") == "ai-title" and r.get("aiTitle"):
            ai = r["aiTitle"]
    if custom or ai:
        return custom or ai
    for path in glob.glob(f"{HOME}/.claude/sessions/*.json"):
        try:
            meta = json.load(open(path))
        except (OSError, ValueError):
            continue
        if meta.get("sessionId") == session_id and meta.get("name"):
            return meta["name"]
    return session_id


def slugify(text):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", text.lower())).strip("-")[:60] or "session"


def clean_user_text(text):
    text = re.sub(r"<system-reminder>.*?</system-reminder>", "", text, flags=re.S)
    command = re.search(r"<command-name>(.*?)</command-name>", text, re.S)
    if command:
        args = re.search(r"<command-args>(.*?)</command-args>", text, re.S)
        return f"`{command.group(1).strip()}` {args.group(1).strip() if args else ''}".strip()
    text = re.sub(r"<(local-command-\w+|command-message|command-args)>.*?</\1>", "", text, flags=re.S)
    return text.strip()


def tool_summary(block):
    inp = block.get("input") or {}
    detail = inp.get("description") or inp.get("file_path") or inp.get("skill") or inp.get("query") or inp.get("url") or ""
    return f"_🔧 {block.get('name')}{': ' + str(detail) if detail else ''}_"


def render(records, include_tools):
    out = []
    for r in records:
        if r.get("isSidechain") or r.get("type") not in ("user", "assistant"):
            continue
        content = r.get("message", {}).get("content")
        blocks = [{"type": "text", "text": content}] if isinstance(content, str) else (content or [])
        if r["type"] == "user":
            if r.get("isMeta"):
                text = "".join(b.get("text", "") for b in blocks if b.get("type") == "text")
                skill = re.match(r"Base directory for this skill: (\S+)", text)
                if skill:
                    out.append(f"_📘 Skill loaded: {os.path.basename(skill.group(1))}_")
                continue
            texts = [clean_user_text(b["text"]) for b in blocks if b.get("type") == "text"]
            texts = [t for t in texts if t]
            if texts:
                out.append("## 🧑 User\n\n" + "\n\n".join(texts))
        else:
            for b in blocks:
                if b.get("type") == "text" and b["text"].strip():
                    out.append("## 🤖 Claude\n\n" + b["text"].strip())
                elif b.get("type") == "tool_use" and include_tools:
                    out.append(tool_summary(b))
    # Merge consecutive Claude sections so one turn reads as one reply.
    merged = []
    for part in out:
        if merged and part.startswith("## 🤖 Claude") and merged[-1].startswith("## 🤖 Claude"):
            merged[-1] += "\n\n" + part.removeprefix("## 🤖 Claude\n\n")
        else:
            merged.append(part)
    return "\n\n".join(merged)


def git(*args, cwd=None):
    try:
        return subprocess.run(["git", *args], capture_output=True, text=True, timeout=5, cwd=cwd).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return ""


def project_root():
    return os.environ.get("CLAUDE_PROJECT_DIR") or git("rev-parse", "--show-toplevel") or os.getcwd()


def conversations_config(root):
    """The factory.json `conversations` block, or None outside a factory project."""
    try:
        return json.load(open(os.path.join(root, "factory.json"))).get("conversations")
    except (OSError, ValueError):
        return None


def branch_topic(root):
    # feat/004-command-center -> 004-command-center; main/develop say nothing about the work.
    branch = git("branch", "--show-current", cwd=root)
    if not branch or branch in ("main", "master", "develop"):
        return None
    return branch.split("/", 1)[-1]


def first_user_words(records, n=6):
    for r in records:
        if r.get("type") == "user" and not r.get("isMeta") and not r.get("isSidechain"):
            content = r.get("message", {}).get("content")
            text = content if isinstance(content, str) else " ".join(
                b.get("text", "") for b in (content or []) if b.get("type") == "text")
            words = clean_user_text(text).split()
            if words:
                return " ".join(words[:n])
    return None


def pick_topic(explicit, records, session_id, root):
    """--topic, then the branch, then the session title, then the first user message."""
    title = session_name(records, session_id)
    return explicit or branch_topic(root) or (title if title != session_id else None) or first_user_words(records) or "session"


def update_index(out_dir):
    rows = []
    for path in sorted(glob.glob(os.path.join(out_dir, "????-??-??-*.md")), reverse=True):
        head = open(path, encoding="utf-8").read(600)
        title = re.search(r"^# (.+)$", head, re.M)
        author = re.search(r"\*\*Author:\*\* (.+)$", head, re.M)
        rows.append(f"| {os.path.basename(path)[:10]} | {author.group(1) if author else ''} | "
                    f"[{title.group(1) if title else os.path.basename(path)}]({os.path.basename(path)}) |")
    with open(os.path.join(out_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write("# Conversations\n\nSession transcripts, newest first. Written by `sf-transcribe`; "
                "this index is regenerated each time, so don't edit it by hand.\n\n"
                "| Date | Author | Session |\n|---|---|---|\n" + "\n".join(rows) + "\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--session-id", default=os.environ.get("CLAUDE_CODE_SESSION_ID"))
    parser.add_argument("--transcript")
    parser.add_argument("--topic", help="what the session was about; overrides branch and title")
    parser.add_argument("--out-dir")
    parser.add_argument("--no-tools", action="store_true")
    parser.add_argument("--from-hook", action="store_true", help="run from a SessionEnd hook: read stdin, stay quiet")
    args = parser.parse_args()

    root = project_root()
    config = conversations_config(root)
    if args.from_hook:
        try:
            payload = json.load(sys.stdin)
        except ValueError:
            payload = {}
        # Only save automatically when the project opted in.
        if not (config and config.get("mode") in ("local", "committed") and config.get("auto")):
            return
        args.transcript = args.transcript or payload.get("transcript_path")
        args.session_id = args.session_id or payload.get("session_id")
    out_dir = args.out_dir or os.path.join(root, (config or {}).get("dir", "docs/conversations"))

    path = find_transcript(args.session_id, args.transcript)
    records = []
    for line in open(path, encoding="utf-8"):
        try:
            records.append(json.loads(line))
        except ValueError:
            continue
    session_id = args.session_id or next((r.get("sessionId") for r in records if r.get("sessionId")), "unknown")
    name = session_name(records, session_id)
    stamps = [r["timestamp"] for r in records if r.get("timestamp")]
    started = stamps[0][:10] if stamps else datetime.now().strftime("%Y-%m-%d")
    author = git("config", "user.name", cwd=root) or os.environ.get("USER", "unknown")
    topic = pick_topic(args.topic, records, session_id, root)

    os.makedirs(out_dir, exist_ok=True)
    short_id = session_id[:6]
    # Keep one file per session: reuse its existing name even if the topic changed since.
    existing = glob.glob(os.path.join(out_dir, f"*-{short_id}.md"))
    out_path = existing[0] if existing else os.path.join(
        out_dir, f"{started}-{slugify(author)[:20]}-{slugify(topic)[:40].strip('-')}-{short_id}.md")
    header = (
        f"# {topic if topic != name else name}\n\n"
        f"- **Author:** {author}\n"
        f"- **Session:** `{session_id}`" + (f" ({name})" if name not in (session_id, topic) else "") + "\n"
        f"- **Started:** {started}\n"
        f"- **Branch:** `{git('branch', '--show-current', cwd=root) or 'n/a'}`\n"
        f"- **Transcribed:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n---\n\n"
    )
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(header + render(records, not args.no_tools) + "\n")
    update_index(out_dir)
    if not args.from_hook:
        print(out_path)


if __name__ == "__main__":
    main()
