# RCC Situation Report -- 2026-03-27

**Prepared by:** Orla (Lead) + Eoin (Senior)
**Requested by:** Larry, for Rui

---

## 1. Current State Overview

### Codebase Size
| File | Lines |
|------|-------|
| `rcc.js` | 10,257 |
| `rcc.css` | 3,842 |
| `rcc.html` | 616 |
| `sw.js` | 37 |
| **Total** | **14,752** |

### Git Status
- **Branch:** `main`, 16 commits ahead of `origin/main` (not yet pushed to remote)
- **Untracked:** `AGENTS.md` (not yet committed)
- **Working tree:** Clean (no uncommitted changes to tracked files)

### Feature Timeline (oldest to newest)
1. Initial commit -- full PWA source
2. Apple HIG modal redesign (v108)
3. Four modal/form consistency fixes
4. IndexedDB v8 bump (trustanalytics store)
5. CodeMirror 6 editor + toolbar + drag fix
6. Universal modal system (v111) -- delete/archive footer, collapsible view sections, links, tags pool
7. Reminders layout fix (v112)
8. Knowledge Hub unified modals -- tags typeahead, links section, archive filter
9. Work Log Type sidebar + WL view modal improvements
10. Archive panel tab

### Service Worker
- Cache version: `rcc-v115`
- SHELL array includes 16 assets (app files + CDN deps including CodeMirror, Chart.js, marked, highlight.js, Google Fonts)
- Cache-first strategy, old caches cleaned on activate

---

## 2. Codebase Quality Assessment

### What Is Working Well
- **Confirm callback pattern:** Correctly implemented at line 116 -- stores, nulls, then calls. No risk of double-fire.
- **Calendar view pills:** Correctly use `cal-view-btn` class in HTML, no collision with `hub-tab-btn`.
- **Dashboard charts:** Rendered via `requestAnimationFrame` inside `switchTab` (line 9541). Correct.
- **`html { overflow-y: scroll }`:** Present in CSS (line 287). Correct.
- **`--accent-rgb` usage:** All `rgba()` calls in CSS use `var(--accent-rgb)` with comma-separated components. No hex-in-rgba violations.
- **Recurring task calendar button:** querySelector for `.rec-cal-btn` is properly guarded behind `if (hasTime)` check (line 1986).
- **Reminders:** `.rem-done-btn` and `.rem-undo-btn` are guarded with `&&` short-circuit (lines 1636-1641). Correct.
- **Storage layer:** `loadDB()`/`saveDB()` pattern used consistently for todos. IndexedDB used for WL items.

### Issues Found

#### P1 -- Critical: `confirm()` usage (line 5399)
```js
if (confirm('Delete this entry? This cannot be undone.')) onDelete();
```
**Location:** `buildWLEditFooter()` function. This is the shared delete button footer used across edit modals.
**Impact:** Will silently fail (dialog blocked) in VS Code Live Preview, making the Delete button non-functional during development. Will show a native dialog in production Chrome, breaking the consistent UX.
**Fix:** Replace with `showConfirm('Delete this entry? This cannot be undone.', onDelete, 'danger')`.

#### P2 -- Minor: CSS fallback syntax anomaly (line 3811)
```css
.clinical-area-item.active { background:rgba(var(--accent-rgb,37 99 235),.08); ... }
```
The fallback `37 99 235` is space-separated (CSS spec) rather than comma-separated. This works in modern browsers but is inconsistent with every other `rgba(var(--accent-rgb), ...)` usage in the file, which all omit fallbacks. Not a bug today, but a maintenance concern.

#### P3 -- Medium: Unguarded querySelector chains
73 instances of `querySelector(...).addEventListener(...)` or `.textContent`/`.classList` etc. without null guards. The *majority* are safe because they target elements just created in the same function's `innerHTML` template (the element is guaranteed to exist). However, this pattern is fragile -- any future template change that removes an expected class will cause a silent script crash. Notable locations:
- Lines 513, 516, 661, 705, 711 (task card elements)
- Lines 4210-4298 (WL item card elements)
- Lines 7351-7365, 7820-7834 (guide card elements)
- Lines 8618-8640 (snippet card elements)

#### P4 -- Info: 16 commits not pushed to remote
The local `main` branch is 16 commits ahead of `origin/main`. All the feature work from the Apple HIG modals through to the Archive panel has not been pushed.

---

## 3. Outstanding Validations

The following features have been implemented but, given the no-test/no-CI nature of the project, require manual validation in Chrome at `http://127.0.0.1:3000`:

### Must Validate (features from unpushed commits)

| Feature | What to Exercise | Tab |
|---------|------------------|-----|
| **Archive panel** | Switch to Archive tab; confirm all archived WL items appear; verify show/hide toggle | Archive |
| **WL Type sidebar** | Open Work Log tab; confirm type sidebar filters items correctly; click each type | Work Log |
| **Knowledge Hub unified modals** | Open References tab; add tags via typeahead; add links to entries; toggle archive filter | References |
| **Universal modals** | Open any edit modal; confirm delete/archive footer appears; test collapsible sections; test linked items section | Work Log / References |
| **CodeMirror 6 editor** | Open a WL item modal; confirm CM6 editor loads in sections; test toolbar buttons (bold, italic, etc.); test text-selection drag does not conflict with modal drag | Work Log |
| **Delete button (P1 bug)** | In any edit modal, click Delete -- confirm it uses `showConfirm` not a native `confirm()` dialog | Work Log / References |

### Should Validate (general health checks)

| Area | What to Exercise |
|------|------------------|
| **Dashboard charts** | Switch to Dashboard; confirm all 4 charts render without errors |
| **Calendar week view** | Navigate to Calendar; switch Week/Month; click a slot to add task/reminder |
| **Backup/Restore** | Wrench menu > Backup; then Restore the backup file; confirm data integrity |
| **Reminders** | Add a reminder; mark done; confirm toast appears; confirm overdue styling |
| **Theme switching** | Cycle through all 9 themes; confirm no layout breaks, especially dark themes with code blocks |
| **Keyboard shortcuts** | Test Cmd+K (search), Cmd+Space (add), Escape (close modals) |
| **Service worker** | After push/deploy, confirm CACHE version bump triggers update; clear old caches |

### Clinical/Cogito/ReqProc/TrustAnalytics Areas
These appear to be four parallel Knowledge Hub sub-sections with area/entry/tag architecture. Each has its own globals, storage, and render functions. These are substantial features (approximately 1,400 lines across the four) and should be validated for:
- Area CRUD (create, rename, delete)
- Entry CRUD within areas
- Tag filtering
- Data persistence across reload

---

## 4. Recommendations

1. **Fix the `confirm()` on line 5399 immediately.** This is the only violation of the no-native-dialogs rule in the codebase. One-line fix.
2. **Push the 16 local commits to remote.** The local branch has significant feature work that is not backed up.
3. **Commit `AGENTS.md`.** It is currently untracked.
4. **Run through the validation checklist above** in a single session at `http://127.0.0.1:3000` before deploying. Focus on the Archive panel and WL Type sidebar as the most recent features.
5. **Consider normalising the CSS fallback at line 3811** to match the rest of the file (or remove the fallback entirely).

---

*Report filed to `~/AgentTeam/Team-Folder/rcc-sitrep-2026-03-27.md`*
