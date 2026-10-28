---
name: sf-transcribe
description: Save the current session as a Markdown transcript in the project's conversation log (docs/conversations/), named by date, author and topic, and refresh the log's index. Use when the user asks to save, log or transcribe the conversation.
disable-model-invocation: true
argument-hint: "[--topic TEXT] [--no-tools] [--session-id ID] [--out-dir DIR]"
---

# Transcribe conversation

Run the bundled script from the project root, passing through any arguments the user gave:

```bash
python3 .agents/skills/sf-transcribe/transcribe.py $ARGUMENTS
```

- **Where it writes:** the folder in `factory.json`'s `conversations.dir` (default `docs/conversations/`). Whether that folder is committed or gitignored was chosen in `sf-setup`.
- **The name:** `YYYY-MM-DD-<author>-<topic>-<id6>.md`: the session's start date, `git config user.name`, a topic, and the first six characters of the session id. The topic is, first match wins: `--topic`, the branch without its type prefix (`feat/004-command-center` → `004-command-center`), the session's title, then the first words of the first message. If the user describes the session in their request, pass that as `--topic`.
- **One file per session:** re-running finds the session's file by its id and rewrites it, keeping the original name.
- **The index:** `README.md` in the same folder, regenerated every run.
- **What it renders:** user messages and replies as sections, slash commands by name, loaded skills and tool calls as one-line notes (`--no-tools` drops tool notes). System reminders, tool output, thinking and subagent chatter are left out.

If `factory.json` has `"auto": true`, a `SessionEnd` hook already runs this at the end of every session (`--from-hook`); running it by hand mid-session is still fine.

Report the printed path. A transcript holds everything said in the session, so when the log is committed, remind the user to check it for secrets or client-confidential detail before pushing.
