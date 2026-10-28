---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance (accessibility, focus, forms, animation, typography, performance, navigation). Use when asked to "review my UI", "check accessibility", "audit design" or "review UX", and before a UI change is marked done.
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with the Web Interface Guidelines in [guidelines.md](guidelines.md), a pinned copy of Vercel's rules. Don't fetch the online version: the pinned copy is what this project reviews against.

## How it works

1. Read [guidelines.md](guidelines.md) in full.
2. Read the files the user named, or ask which files to review.
3. Check them against every rule, and also against the project's `DESIGN.md`, which wins wherever the two differ.
4. Report findings in the terse `file:line` format the guidelines specify.
