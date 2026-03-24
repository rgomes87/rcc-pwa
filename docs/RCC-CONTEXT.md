# Rui's Command Centre — Project Context

> Full context for the RCC PWA. Intended as a reference for any AI assistant working in this folder.
> Last updated: March 2026.

---

## What This Is

RCC is a **personal work management PWA** — no server, no npm, no framework. It runs in a browser (or VS Code Live Preview) and is deployed to Netlify by dragging a folder. The only external dependencies are Google Fonts and a handful of CDN libraries (Chart.js, marked, highlight.js), all cached by the service worker.

It is Rui's personal daily-driver for NHS BI work at GSTT: task management, work log, reminders, links, documentation, and a visual calendar.

---

## Folder Structure

```
work-management/
├── rcc.html            ← App shell (minimal markup)
├── rcc.css             ← All styles
├── rcc.js              ← All application logic
├── sw.js               ← Service worker (cache-first)
├── manifest.json       ← PWA manifest
├── icon.svg            ← App icon
├── rcc-deploy/         ← Copy of all files, ready to drag to Netlify
├── update-deploy.sh    ← Copies source files into rcc-deploy/
├── RCC-CONTEXT.md      ← This file
└── backups/            ← JSON backup files (rcc-backup-YYYY-MM-DD.json)
```

---

## How to Run

- **Netlify**: drag `rcc-deploy/` folder to Netlify drop zone — live at the Netlify URL
- **VS Code**: Live Preview extension → right-click `rcc.html` → Show Preview (`http://127.0.0.1:3000`)
- **Chrome/Edge**: `file://` protocol works but is a separate localStorage origin from VS Code
- **Service worker**: `sw.js` caches shell assets; bump `CACHE` constant (`rcc-vN`) in `sw.js` on every deploy to force refresh

---

## Application Structure

| Tab | Purpose |
|-----|---------|
| Dashboard | Summary cards + Chart.js charts (time, completion, WL status, top tasks) |
| Todos | Weeks-based task management with timers, filters, drag-reorder |
| Work Log | Documentation tracker — list + board views, draggable modals |
| Reminders | Time-based reminders — overdue alerts, toast notifications |
| Links | Bookmark dashboard — resizable column groups, drag-to-reorder |
| Guides | Read-only viewer for WL Documentation-type items |
| Calendar | Visual calendar — week view (Mon–Fri 08–18) + month overview |

---

## Header Navigation

Sticky header (`z-index: 50`) contains:
- **Tab switcher** — Dashboard / Todos / Work Log / Reminders / Links / Guides / Calendar
- **`weekNav`** (Todos only): ← → week nav, today, + New week
- **`wlNav`** (Work Log only): + New item
- **`calNav`** (Calendar only): ← → prev/next, label, today, Week/Month pills
- **`#calBtn`** (always visible): opens Outlook work week in new tab
- **Theme picker** (always visible): swatch + label, opens colour picker
- **Wrench ⚙** (always visible): Backup / Restore / Clear all data

`switchTab(tab)` controls which nav is shown and saves active tab to `localStorage`.

---

## Theming System

9 themes selectable via the theme picker:

| ID | Label | Background | Accent |
|---|---|---|---|
| `light` | Light | `#f0f2f5` | `#2563eb` |
| `dark` | Dark | `#111827` | `#3b82f6` |
| `light-warm` | Light Warm | `#faf6f0` | `#c2410c` |
| `dark-warm` | Dark Warm | `#1a1512` | `#f97316` |
| `eleven` | Eleven | `#fdfcfc` | `#f36f1c` |
| `grey-dark` | Grey Dark | `#141413` | `#e3e2c3` |
| `black-gold` | Black Gold | `#131313` | `#efd395` |
| `sleek` | Sleek | `#161516` | `#b16d96` |
| `inverted` | Inverted | `#0e1119` | `#e9cc5a` |

- Theme applied as CSS class on `<html>`: `html.theme-grey-dark`, etc. Light = no class.
- `--accent-rgb: r, g, b` stored separately so animations can use `rgba(var(--accent-rgb), 0.5)`.
- Theme stored in localStorage under `work_todo_theme`.
- Dark themes (`grey-dark`, `black-gold`, `sleek`, `inverted`) have hljs syntax overrides: `#7ab4d8` keywords, `#9cdcfe` variables — avoids unreadable light-theme values on dark backgrounds.

---

## Feature Reference

### Dashboard Tab

Powered by Chart.js 4.4.4.

**Summary cards**: Total time logged, tasks completed, completion rate %, top category by time.

**Charts**:
- Time by Outlook category — horizontal bar
- Weekly completion trend — bar (last 8 weeks)
- Work log by status — doughnut
- Top tasks by time spent — ranked list

`renderDashboard()` called via `requestAnimationFrame` from `switchTab` — ensures canvas has non-zero dimensions before Chart.js draws.

---

### Todos — Weekly Task Management

Each task: name, priority (High/Med/Low), start date (`task.build`), time slot, due date (`task.due`), Outlook category, notes, linked WL item, rank, timer.

**Timer**: per-task start/stop; running state = `task.timerStart` (ISO string); on stop appends `{ start, end, duration }` to `task.timeLogs[]`.

**Week navigation**: ← → with open task count badges, today button, + New week (auto-carries open tasks, purges done reminders), Jump to week (chains carry-over).

**Filters**: search, priority filter, sort by priority/due/name, Today's todos view.

**Edit paths**:
- `openEditMode(div, task)` — inline card replace; delete lives here
- `createTaskModal(taskId, weekKey)` — view popup; no delete

---

### Reminders

Each reminder: text, date, optional time, optional WL link.

- Red border + pulsing dot if overdue; amber if due within 24h
- Toast notification at exact time (checked every 30s)
- ✓ marks done (kept rest of day); auto-deleted next day via `doneAt` check
- Purged on + New week

Two-column card layout: `.rem-card-inner`, `.rem-card-left`, `.rem-card-notes`, `.rem-card-actions`. Tooltip system: `#rem-hover-tip` positioned via `getBoundingClientRect()`.

---

### Calendar Tab

**State** (localStorage):
- `rcc_cal_view` — `'week'` | `'month'` (default `'week'`)
- `rcc_cal_anchor` — `YYYY-MM-DD` (Monday of viewed week / 1st of viewed month)

**Week view** (Mon–Fri, 08:00–18:00):
- All-day row: tasks/reminders with no `time` — pill chips
- Hour rows (60px each): timed events as `position:absolute` blocks at `top = (hour-8)*60 + minutes` px
- 30-min dashed divider in each hour slot
- Click any slot → popover with `+ Task` / `+ Reminder` → opens pre-filled add modal
- Today column: tinted background

**Month view** (6×7 grid, Mon–Sun):
- Coloured dots per event (max 5, then "+N more")
- Today cell: accent-outlined
- Out-of-month days: faded
- Click cell: inline expand showing that day's events

**Data sources** (`getCalEvents(startISO, endISO)`):
- `Object.entries(db.weeks)` → tasks; date = `task.due || weekMondayKey`
- `reminders[]` filtered by `rem.date` in range
- `recTasks[]` via `getRecurringOccurrencesInRange(rec, start, end)`

**Navigation** (`calNav`): prev/next (one week or one month), today, Week/Month toggle pills (class `cal-view-btn` — NOT `hub-tab-btn`).

---

### Work Log (Documentation Tab)

Each item: title, work type (Halo/Sherlock/Ad-hoc/CMT/Nova/Upgrade/Other), Outlook category, status (In Progress / Blocked / Under Review / Complete), ticket URL, collapsible sections with `contenteditable` + inline image paste.

- **Archive**: greyed out, hidden by default (toggle "Show archived")
- **Download**: exports as `[type][YYYY-MM-DD][name].md` → prompts to archive
- **IndexedDB**: `wlItems` stored in IndexedDB (not localStorage) for larger quota

Modals (`openWLModal`): draggable floating modals, multiple open simultaneously, z-index stacking, pop-out to separate window.

---

### Links Tab

Bookmark dashboard. Each link: name, URL, group, optional custom icon URL.

Favicon chain: custom icon → Google S2 → DuckDuckGo → direct `/favicon.ico` → letter avatar.

Groups = resizable vertical columns (drag right edge; widths in `LINKS_LAYOUT_KEY`). Links draggable between groups. Edit via inline popover (`openLinkEditPopover`).

`html { overflow-y: scroll }` on `<html>` forces permanent scrollbar gutter — prevents header width shift when switching tabs.

---

### Outlook Categories

| Label | Colour |
|---|---|
| Admin / Low-Effort Tasks / Catch-up | Yellow |
| Deep Work / Reporting / Development | Purple |
| Epic Tasks | Dark red |
| High-Priority / Deadlines | Red |
| Learning / Study / CPD | Orange |
| Notes | Pink |
| OOO / Protected Time | Grey |
| Requirements / Build Collaboration | Green |
| Stakeholder Meetings | Blue |
| Thinking / Planning / Review / QA | Brown |

---

## Data Storage

| Key | Store | Contents |
|---|---|---|
| `work_todo_v1` | localStorage | Weekly todos, week structure, notes |
| `work_todo_recurring_v1` | localStorage | Recurring task definitions |
| `work_todo_reminders_v1` | localStorage | Reminders |
| `work_todo_links_v1` | localStorage | Links dashboard items |
| `work_todo_links_layout_v1` | localStorage | Column width map |
| `work_todo_theme` | localStorage | Active theme name |
| `rcc_active_tab` | localStorage | Last active tab |
| `rcc_cal_view` | localStorage | Calendar view mode (`'week'`/`'month'`) |
| `rcc_cal_anchor` | localStorage | Calendar anchor date (YYYY-MM-DD) |
| `wlItems` | IndexedDB | Work log items (incl. base64 images) |

### Backup / Restore

**↓ Backup data** (wrench menu): exports unified v3 JSON `{ version, exportedAt, todos, recurring, reminders, worklog, links, linksLayout }`.

**↑ Restore**: accepts v1/v2/v3; reloads after 250ms.

**Auto-backup**: `window.showDirectoryPicker` writes files to a chosen directory. No auto-prune — files accumulate (low priority to fix).

---

## Technical Architecture

- Multi-file PWA: `rcc.html` (shell), `rcc.js` (all logic), `rcc.css` (all styles), `sw.js` (service worker)
- No build step, no npm, no framework — vanilla JS ES6+
- Chart.js 4.4.4, marked 12.0.0, highlight.js 11.9.0 — all from jsDelivr CDN, cached by SW
- `contenteditable` for WL section editors (supports inline image paste)
- Drag and drop via native HTML5 drag API
- ICS generation — pure JS string construction
- Base64 images stored inline in IndexedDB JSON

### Key JS Globals

| Variable | Description |
|---|---|
| `db` | Todos database object (`work_todo_v1`) |
| `currentKey` | ISO date string of currently viewed week Monday |
| `recTasks` | Recurring task definitions |
| `wlItems` | Work log items (from IndexedDB) |
| `reminders` | Reminders array |
| `linkItems` | Links array |
| `linkColWidths` | Group name → column pixel width |
| `OUTLOOK_CATS` | `{label, cls}` array for 10 Outlook categories |
| `THEMES_CATALOG` | `{id, label, bg, accent}` array for 9 themes |
| `calView` | Active calendar view (`'week'`/`'month'`) |
| `calAnchor` | Calendar anchor date (Date object) |
| `_dashCharts` | Active Chart.js instances — destroyed before re-render |

### Key Functions

| Function | Description |
|---|---|
| `render()` | Re-renders entire todos tab |
| `renderList(listId, tasks, emptyId)` | Renders task list with drag, rank, badges |
| `renderReminders()` | Re-renders reminders panel |
| `renderWL()` | Re-renders work log item list |
| `renderLinks()` | Re-renders links dashboard |
| `renderDashboard()` | Re-renders dashboard (destroys old charts first) |
| `renderCalendar()` | Reads state → updates nav → calls week or month render |
| `renderCalWeek(anchor)` | Builds Mon–Fri week grid with all-day row + timed slots |
| `renderCalMonth(anchor)` | Builds 6×7 month grid with dot indicators |
| `getCalEvents(startISO, endISO)` | Flat event array from tasks + reminders + recurring |
| `showCalAddPopover(x, y, dateISO, timeStr)` | Fixed-position popover for click-to-add |
| `calAddTaskModal(dateISO, timeStr)` | Pre-filled add task modal from calendar context |
| `calAddReminderModal(dateISO, timeStr)` | Pre-filled add reminder modal from calendar context |
| `switchTab(tab)` | Switches active tab; shows/hides navs; triggers renders |
| `applyTheme(name)` | Applies theme class to `<html>`, saves to localStorage |
| `createNewWeek()` | Creates next week, carries tasks, purges done reminders |
| `injectRecurringIntoWeek(weekKey)` | Injects due recurring tasks into a week |
| `openWLModal(id)` | Opens Work Log edit modal (null = new item) |
| `showToast(msg, isError?)` | Shows bottom toast notification |
| `showConfirm(msg, onOk, variant?)` | Inline confirm modal; variant: `'warn'` or `'danger'` |
| `buildWLModalShell()` | Returns bare modal div |
| `buildWLModalDragBar()` | Returns `{ dragBar, popoutBtn }` — no title element inside |
| `setupWLModalDrag(modal, dragBar)` | Wires drag; returns `dragCleanup` function |

---

## Lessons Learned

### Critical bugs

**1. Script crash from premature function call**
`populateWlDropdowns()` called before `wlItems` initialised → `ReferenceError` silently kills entire script. Always check initialisation order.

**2. Tab switching broken by sticky panel**
Right panel `position: sticky` with no `z-index` sat above header, blocking tab clicks. Header needs `z-index: 50`; sticky panel `top: 5rem; z-index: 10`.

**3. `confirm()` / `alert()` blocked in VS Code Live Preview**
VS Code Chromium webview blocks native browser dialogs. Use `showConfirm` / `showToast` throughout.

**4. localStorage origin isolation**
`file://` and `http://127.0.0.1:3000` are different origins — data not shared. Always open from the same place.

**5. Carry-over duplication across weeks**
Tasks duplicated on multi-week carry-over because copies got new `id`. Fix: `sourceId` preserves original id; deduplication checks `sourceId`.

**6. `textarea` can't render inline images**
Replaced with `contenteditable` div; custom paste handler converts clipboard images to base64.

**7. `rgba()` with CSS custom properties**
Hex CSS variables can't be used inside `rgba()`. Store RGB components as `--accent-rgb: r, g, b`.

**8. Null querySelector crash**
`.addEventListener()` on null throws `TypeError` silently killing subsequent script. Always guard: `if (el) el.addEventListener(...)`.

**9. Collapsible headers need stopPropagation on all children**
All interactive children inside a click-to-toggle header must call `e.stopPropagation()`. Chevron: `pointer-events: none`.

**10. Double-confirm callback nulled too early**
`_confirmCallback(); _confirmCallback = null` overwrites second callback set by first. Fix: `const cb = _confirmCallback; _confirmCallback = null; cb();`

**11. Chart.js canvas zero-dimension on page load**
Canvas has zero dimensions before browser paint. Fix: call `renderDashboard` via `requestAnimationFrame` from `switchTab`.

**12. hub-tab-btn class collision with calendar view pills**
`switchHubTab()` runs `querySelectorAll('.hub-tab-btn')` globally — any button with that class gets toggled. Calendar Week/Month pills had `hub-tab-btn` → both lit up simultaneously when either was clicked. Fix: calendar view pills use `cal-view-btn` class exclusively.

**13. `buildWLModalDragBar()` has no title element**
`buildWLModalDragBar()` returns `{ dragBar, popoutBtn }` only — there is no `.wl-modal-title` inside. Calling `dragBar.querySelector('.wl-modal-title').textContent = '...'` throws TypeError before modal is appended, silently preventing it from appearing. Fix: create `wl-modal-header` div separately with `titleEl` + `closeBtn`; `modal.append(dragBar, header, body)`.

**14. Tasks without due date excluded from calendar**
Original `getCalEvents` filtered out tasks with no `task.due`. Fix: use `Object.entries(db.weeks)` and `const date = task.due || wk` (week-key Monday as fallback), with `time: task.due ? task.time : null` to force all-day display when no due date.

---

## Design Decisions

- **Multi-file PWA**: CSS/JS split from HTML for easier editing and caching; service worker handles offline
- **No build step**: deploy = drag folder to Netlify; no Vite/webpack complexity
- **localStorage + IndexedDB**: localStorage for small config; IndexedDB for WL items (larger, binary-safe)
- **base64 images**: Zero friction for paste workflow; right trade-off for personal tool
- **`contenteditable` over textarea**: Necessary for inline images
- **Custom confirm/toast**: No native browser dialogs (blocked in VS Code Live Preview)
- **`--accent-rgb` pattern**: RGB components separate from hex for `rgba()` composition
- **`requestAnimationFrame` for charts**: Defers Chart.js render until after browser layout
- **`rcc_active_tab`**: Persists active tab across reloads so restore/clear returns to correct tab
- **`cal-view-btn` not `hub-tab-btn`**: Avoids global selector collision with `switchHubTab()`

---

## Context About Rui

- **Role**: Principal BI Analyst, GSTT, London. Specialisation: Epic Cogito (SQL reporting against Caboodle/Clarity)
- **Work types used**: Halo, Sherlock, Ad-hoc, CMT, Nova, Upgrade, Other
- **Outlook calendar URL**: `https://outlook.cloud.microsoft/calendar/view/workweek`
- **NHS machine**: managed Windows, full-disk encryption (BitLocker). No patient data in RCC.

---

## Future Ideas (not yet built)

- Calendar Phase 2: ICS/Outlook overlay — import `.ics` feeds (e.g. Outlook work calendar) as read-only layer in the week view
- WL Status Expansion: Not Started status, Archived status (replacing boolean), auto-archive complete items after 2 days, download stamp tracking
- Mobile-optimised layout
- Cross-machine sync (currently localStorage/IndexedDB only)
