---
name: Surface Handoff State
description: Current working state for switching between CLI and VS Code — override entirely on each update, never append
type: project
---

Last updated: 2026-03-27

## Active project
rcc-pwa at ~/Developer/rcc-pwa/

## Agent team status
- Orla (Lead RCC Developer, claude-opus-4-6) — rcc-lead.md — recruited 2026-03-27
- Eoin (Senior RCC Developer, claude-sonnet-4-6) — rcc-senior.md — recruited 2026-03-27
- Full roster at ~/Agents-Team/Team-Folder/team-roster.md

## Current state of rcc-pwa
- Codebase: 14,752 lines (rcc.js 10,257 / rcc.css 3,842 / rcc.html 616 / sw.js 37)
- 16 commits on main never pushed to remote — no offsite backup
- AGENTS.md is untracked

## P1 bug (unfixed)
confirm() called at rcc.js:5399 inside buildWLEditFooter()
Fix: replace with showConfirm('Delete this entry? This cannot be undone.', onDelete, 'danger')

## Manual validation outstanding
Features from recent unpushed commits that have not been validated at http://127.0.0.1:3000:
1. Archive panel (WL items)
2. WL Type sidebar filtering
3. Knowledge Hub unified modals (tags, links, archive filter)
4. Universal modals (delete/archive footer, collapsible sections)
5. CodeMirror 6 editor (toolbar, no drag conflicts)
6. Delete button (will confirm P1 confirm() bug)
7. Four KH sub-sections: Clinical, Cogito, ReqProc, TrustAnalytics (area CRUD, entry CRUD, tag filtering)

## Full sitrep
~/Developer/rcc-pwa/Team-Folder/rcc-sitrep-2026-03-27.md

**Why:** Designed to survive CLI ↔ VS Code switches. Always overwrite this file entirely — never append.
**How to apply:** On session start, read this file to know exactly where things stand before delegating any task.
