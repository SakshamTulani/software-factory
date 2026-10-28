---
name: engineering-checklists
description: Reference checklists other skills link to — definition of done, security, performance, accessibility, observability, testing patterns and agent orchestration. Use when a skill points here, or when you need the project-wide Definition of Done.
---

# Engineering checklists

Shared reference material from Addy Osmani's agent-skills. Other skills link to these files; read only the one you need.

| File | Use for |
|---|---|
| [definition-of-done.md](definition-of-done.md) | The bar every change clears, regardless of which skill is active |
| [security-checklist.md](security-checklist.md) | Security review and pre-launch checks |
| [performance-checklist.md](performance-checklist.md) | Performance review, Core Web Vitals, launch checks |
| [accessibility-checklist.md](accessibility-checklist.md) | WCAG checks for UI work |
| [observability-checklist.md](observability-checklist.md) | Logging, metrics, tracing before launch |
| [testing-patterns.md](testing-patterns.md) | Test patterns for JS/TS: unit, RTL, API, E2E |
| [orchestration-patterns.md](orchestration-patterns.md) | When commands, skills and subagent personas may call each other |

In this project the Definition of Done is concretely `pnpm check` green; see the `frontend-testing` skill for what each layer is tested with.
