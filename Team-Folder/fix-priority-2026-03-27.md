# RCC Deployment Triage — 2026-03-27

## Summary
Five critical issues blocking production use. Root cause: **incomplete deployment workflow** (manifest/icon not copied) + **broken CodeMirror import** + **null-guarding defects in modal/archive logic**.

---

## Issue Priority List

### BLOCKER #1: Manifest & Icon 404s
**Severity:** BLOCKER (PWA non-functional, browser errors)
**Impact:** App cannot install as PWA; clutters console with 3x 404 errors
**Root cause:** `update-deploy.sh` script does not copy `manifest.json` and `icon.svg` to `rcc-deploy/` folder before Netlify deployment.

**Evidence:**
- Deployed folder (`rcc-deploy/`) contains only: `index.html`, `rcc.css`, `rcc.js`, `sw.js`
- Missing: `manifest.json`, `icon.svg`
- HTML references (lines 8, 10): `href="icon.svg"` and `href="manifest.json"`

**Fix Plan:**
- **File:** `update-deploy.sh` (lines 8–10)
- **Changes:** Add two `cp` commands:
  ```bash
  cp "$DIR/manifest.json" "$DEPLOY/manifest.json"
  cp "$DIR/icon.svg"      "$DEPLOY/icon.svg"
  ```
- **Scope:** 2 lines added
- **Validation:** After running script, verify `rcc-deploy/` contains both files before dragging to Netlify

---

### BLOCKER #2: CodeMirror EditorState Export Error
**Severity:** BLOCKER (JS breaks immediately on page load)
**Impact:** Module fails to load; page crashes at line 601; blocks all editor functionality
**Root cause:** ESM.sh for `@codemirror/view@6` does not export `EditorState` directly. `EditorState` is in `@codemirror/state@6`, not `view`.

**Evidence:**
- Error: `The requested module 'https://esm.sh/@codemirror/view@6' does not provide an export named 'EditorState'`
- HTML line 601: `import { EditorView, EditorState, lineNumbers } from 'https://esm.sh/@codemirror/view@6'`
- Correct import for `EditorState`: from `@codemirror/state@6`

**Fix Plan:**
- **File:** `rcc.html` (line 601)
- **Changes:** Split import statements:
  ```javascript
  // Line 601: Keep EditorView and lineNumbers from view
  import { EditorView, lineNumbers } from 'https://esm.sh/@codemirror/view@6';
  // NEW: Add EditorState from state
  import { EditorState } from 'https://esm.sh/@codemirror/state@6';
  ```
- **Also update sw.js cache list (line 13):** Add `'https://esm.sh/@codemirror/state@6'` to SHELL array
- **Scope:** 2 lines modified in HTML (601–602), 1 line added to sw.js
- **Validation:** Open page, check F12 console for no import errors; CM6 module should load

---

### MAJOR #3: Knowledge Hub Database Add Broken (null reference)
**Severity:** MAJOR (single feature non-functional)
**Impact:** Users cannot add new database entries; creates table modal crashes
**Root cause:** `createDatabaseModal()` calls `getDbOrgs(item)` at line 8390, but `item` is null/undefined when creating a new entry (no fallback).

**Evidence:**
- Error: `Uncaught TypeError: Cannot read properties of null (reading 'orgs')` at line 8236
- Call stack: `createDatabaseModal` → `getDbOrgs(item)` where `item` is undefined
- Function definition (line 8234–8239) does handle null but code at line 8390 doesn't check before calling

**Fix Plan:**
- **File:** `rcc.js` (line 8390)
- **Changes:** Pass empty object as fallback:
  ```javascript
  // OLD: const currentOrgs = getDbOrgs(item);
  // NEW:
  const currentOrgs = getDbOrgs(item || {});
  ```
  OR guard the entire section:
  ```javascript
  if (!item) item = {};
  const currentOrgs = getDbOrgs(item);
  ```
- **Scope:** 1 line modified (8390) or 2 lines added
- **Validation:** Click "Add entry" on Knowledge Hub Databases tab; modal should open without console error

---

### MAJOR #4: Archive Section Crashes on Tab Switch
**Severity:** MAJOR (entire feature non-functional)
**Impact:** Archive tab is unusable; breaks UI tab navigation when Archive clicked
**Root cause:** Multiple null-guard failures in `switchTab()` (line 9529) and event listener setup. When DOM elements are missing or initialization order is wrong, `.addEventListener()` on null kills silent execution.

**Evidence:**
- Error at line 9529: `Cannot read properties of null (reading 'classList')` in `switchTab()` forEach loop
- The loop tries to toggle classes on elements, but some don't exist
- Error at line 9553: Similar null error from event listener attachment
- Secondary issue: `renderArchivePanel()` at line 9462 guards with `if (!panel) return;` but doesn't catch nulls from the query in switchTab

**Fix Plan:**
- **File:** `rcc.js` (lines 9528–9550)
- **Changes:** Add null checks in switchTab:
  ```javascript
  // Line 9528–9530, replace:
  ['Todos','Worklog','References','Dashboard','Calendar','Archive'].forEach(t => {
    const panelEl = document.getElementById('panel' + t);
    const tabEl = document.getElementById('tab' + t);
    if (panelEl) panelEl.classList.toggle('active', t === tab);
    if (tabEl) tabEl.classList.toggle('active', t === tab);
  });
  ```
- **Also check line 9549–9550:** Event listeners should be guarded:
  ```javascript
  // Replace: document.getElementById('tabArchive').addEventListener(...)
  // With guard:
  const archiveTab = document.getElementById('tabArchive');
  if (archiveTab) archiveTab.addEventListener('click', () => switchTab('Archive'));
  ```
- **Scope:** 3–5 lines modified (9528–9550)
- **Validation:** Click Archive tab; should render without errors; test other tab switches

---

### MAJOR #5: Service Worker Cache Manifest Failure
**Severity:** MAJOR (PWA offline mode breaks; may block app registration)
**Impact:** `addAll()` in sw.js fails silently because manifest.json and icon.svg (404 items) are in SHELL array; blocks entire cache initialization
**Root cause:** `sw.js` line 20 calls `c.addAll(SHELL)`, but SHELL includes local static assets that don't exist in deployed folder (manifest.json, icon.svg) + CodeMirror state module not in cache list.

**Evidence:**
- Error: `Failed to execute 'addAll' on 'Cache': Request failed` (line 20, sw.js)
- Cause: Manifest/icon 404s cause addAll() to reject the entire cache operation
- Secondary: CodeMirror state module added above but not in SHELL cache list

**Fix Plan:**
- **File:** `sw.js` (lines 2–17)
- **Changes:**
  1. Add missing assets to SHELL (lines 6–7):
     ```javascript
     '/manifest.json',
     '/icon.svg',
     ```
  2. Add CodeMirror state module (after line 13):
     ```javascript
     'https://esm.sh/@codemirror/state@6',
     ```
  3. Optional: Add `.catch()` error handling to gracefully degrade if any CDN resource fails (not essential but improves resilience)
- **Scope:** 2–3 lines added to SHELL array
- **Validation:** Register service worker after deploying manifest/icon; check Application > Cache Storage in F12; verify all items cache successfully

---

## Deployment & Testing Sequence

1. **Fix sw.js** — add manifest/icon/state to SHELL array
2. **Fix rcc.html** — split CodeMirror imports (EditorState from state module)
3. **Fix rcc.js** — null-guard in createDatabaseModal (line 8390) + switchTab (line 9528–9550)
4. **Update update-deploy.sh** — copy manifest.json and icon.svg
5. **Run `bash update-deploy.sh`** from `~/Developer/rcc-pwa/`
6. **Verify rcc-deploy/contains all 6 files:** `index.html`, `rcc.css`, `rcc.js`, `sw.js`, `manifest.json`, `icon.svg`
7. **Bump CACHE version** in sw.js (optional but recommended for cache bust) — e.g. `v116` → `v117`
8. **Drag rcc-deploy/ to Netlify**
9. **Test in deployed environment:**
   - Open DevTools (F12), check Console for no import/404 errors
   - Test PWA install
   - Click Archive tab (verify no null errors)
   - Add new database entry in Knowledge Hub
   - Verify service worker caches all assets

---

## Risk Assessment

| Issue | Risk | Mitigation |
|-------|------|------------|
| Manifest/Icon missing | **HIGH** — Ruins PWA UX | Correct deployment script; add files to rcc-deploy/ |
| CodeMirror import | **HIGH** — Breaks page load | Update HTML import; add state module to cache |
| getDbOrgs null | **MEDIUM** — Single feature broken | Add fallback object; small change, isolated impact |
| switchTab null guards | **MEDIUM** — Archive unusable | Add `.querySelector` null checks; defensive pattern |
| SW cache fail | **MEDIUM** — Offline mode breaks | Include all assets in SHELL; addAll() will succeed |

---

## Files to Modify
- `rcc.html` — 2 lines (CodeMirror import)
- `rcc.js` — 5 lines (null guards in createDatabaseModal + switchTab)
- `sw.js` — 4 lines (add manifest/icon/state to SHELL)
- `update-deploy.sh` — 2 lines (copy manifest/icon)

**Total scope: ~13 lines across 4 files. All changes are localized, low-risk.**
