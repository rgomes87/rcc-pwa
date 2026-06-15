# RCC Manual Test Cases — 2026-03-27

**Tester:** Iris (claude-haiku-4-5-20251001)
**Environment:** http://127.0.0.1:3000 (VS Code Live Preview)
**Codebase:** rcc-pwa (rcc.js 10,257 lines)
**Date:** 2026-03-27

---

## Test Setup Instructions

### Prerequisites
1. Open VS Code and navigate to `/Users/ruigomes/Developer/rcc-pwa/`
2. Right-click `rcc.html` → **Show Preview** (opens http://127.0.0.1:3000)
3. **Do NOT use `file://` URLs** — localStorage origins differ between file:// and http://127.0.0.1:3000
4. Open Chrome DevTools (F12) to check:
   - localStorage contents: Application → Storage → Local Storage → http://127.0.0.1:3000
   - Console for any errors
   - Network for CDN loads (Chart.js, CodeMirror 6, marked, highlight.js)

### Critical Pitfalls to Avoid
- **Native dialogs blocked:** `confirm()` and `alert()` don't work in Live Preview. Must use `showConfirm()` / `showToast()` instead.
- **Service worker cache:** SW caches assets. If CDN scripts don't load, hard-refresh (Cmd+Shift+R) and check sw.js cache version.
- **Multiple localStorage origins:** Closing and re-opening via file:// loses all data. Always use http://127.0.0.1:3000.
- **Chart.js timing:** Charts must render inside `requestAnimationFrame` from `switchTab()`. Rendering on page load = blank canvas.
- **Modal z-index stacking:** WL modals auto-offset (+28px per modal). Open modals may stack off-screen on small displays.
- **Collapsible headers:** Click handlers inside a collapsible section must call `e.stopPropagation()` or the section collapses.
- **CodeMirror drag:** CM6 has native drag-select. Ensure WL modal drag handle doesn't conflict with CM6 content.

### Data Reset Between Tests
If you need a clean slate:
1. Open DevTools → Application → Storage → Local Storage → http://127.0.0.1:3000
2. Delete all keys starting with `work_todo_v1`, `work_todo_recurring_v1`, `work_todo_reminders_v1`, `work_todo_links_v1`, `rcc_*`
3. Refresh the page

---

## Feature 1: Archive Panel (WL Items)

### Context
WL (Work Log) items can be archived. There is a toggle button `wlShowArchivedBtn` ("Show archived" / "Hide archived") that controls visibility. The archive filter is independent per view mode (list vs. board). Archived items are marked with a badge and have an unarchive button (↻ icon).

### Test Case WL-ARCH-001: Show/Hide Archived Toggle
**Preconditions:**
- At least 3 WL items exist
- Minimum 1 item has status = "Archived"
- Live Preview is open, Worklog tab active

**Steps:**
1. Click the "Show archived" button in the WL toolbar
2. Verify the button text changes to "Hide archived"
3. Verify button border color changes (appears "active")
4. Verify all archived items appear in the list/board
5. Click "Hide archived"
6. Verify archived items are removed from view
7. Refresh page with F5
8. Verify the toggle state persists (UI should default to "Show archived" since state is NOT persisted in localStorage)

**Expected Result:**
- Toggle button text and styling update immediately
- Archived items filter on/off without page reload
- Button styling reflects active state (border-color, text color change to accent)

**Edge Cases:**
- No archived items exist → "Show archived" button is still clickable but shows no items
- All items are archived → "Hide archived" hides entire list (empty state)
- Only 1 archived item → toggle filters correctly

---

### Test Case WL-ARCH-002: Archive Button on Item Card
**Preconditions:**
- 2+ WL items with status = "Not Started" or "In Progress"
- Live Preview open, Worklog tab active, "Show archived" mode OFF

**Steps:**
1. Hover over a WL item card
2. Locate the archive button (looks like a square with corner lines ⊟)
3. Click the archive button
4. Verify the item disappears from the current view
5. Toggle "Show archived" ON
6. Verify the item reappears with status badge "archived"
7. Verify item card has CSS class `wl-archived`
8. Hover over the archived item card
9. Verify the archive button now shows an unarchive icon (↻)
10. Click the unarchive button
11. Verify item status reverts to "Not Started" (or previous status before archiving)
12. Verify item disappears when "Show archived" is toggled OFF again

**Expected Result:**
- Archive/unarchive is instant, no page reload needed
- Toast message appears: "Item archived." or "Item unarchived."
- Item status property updates correctly
- Unarchive restores previous status (not a fixed status)

**Edge Cases:**
- Archive when item is already status="Complete" → should still allow archive
- Unarchive and re-archive multiple times → state persists correctly
- Archive from board view vs. list view → both should work identically

---

### Test Case WL-ARCH-003: Archive Persistence in IndexedDB
**Preconditions:**
- WL item archived
- Live Preview open

**Steps:**
1. Open DevTools → Application → IndexedDB → rcc-pwa → wlItems
2. Find the archived item
3. Inspect its JSON structure
4. Verify `archived: true` flag is present
5. Verify `archivedAt` timestamp is an ISO 8601 string
6. Refresh page (F5)
7. Toggle "Show archived" ON
8. Verify archived item still appears with same data

**Expected Result:**
- IndexedDB record contains `{ archived: true, archivedAt: "2026-03-27T...", ... }`
- Data survives page refresh
- No data loss on browser close/reopen

---

### Test Case WL-ARCH-004: Auto-Archive on Status = "Archived"
**Preconditions:**
- WL item with any status
- Live Preview open, WL modal visible (item in edit mode)

**Steps:**
1. Open a WL item in edit modal
2. Change status dropdown to "Archived"
3. Verify `archived` flag is set automatically
4. Click outside or close modal
5. Toggle "Show archived" ON
6. Verify item appears with `wl-archived` CSS class
7. Reopen item modal
8. Change status back to "Not Started"
9. Verify `archived` flag is cleared automatically
10. Verify item status shows as "Not Started" when "Show archived" is OFF

**Expected Result:**
- Status change to "Archived" automatically sets the `archived` flag
- Status change away from "Archived" clears the flag
- No manual flag manipulation needed

---

## Feature 2: WL Type Sidebar Filtering

### Context
WL items have a `type` field (Halo, Sherlock, Ad-hoc, CMT, Nova, Upgrade, Meetings, Training, SOP, Report, Research, Other). There should be a sidebar or filter control to show/hide items by type. This feature was mentioned but specific implementation details were unclear from code search.

**Note:** Code search did not find `wlTypeFilter` variable or sidebar. This may be a feature under development. Tests are written assuming the feature exists; if not, report "Feature not found in code."

### Test Case WL-TYPE-001: Type Filter Sidebar Exists
**Preconditions:**
- Live Preview open, Worklog tab active

**Steps:**
1. Look for a sidebar or filter panel labeled "Type" or "Categories"
2. Verify there is a list of WL types (Halo, Sherlock, Ad-hoc, etc.)
3. Verify each type has a checkbox or toggle
4. Verify a "select all" or "clear all" button exists (if applicable)

**Expected Result:**
- A visible, interactive sidebar or filter control exists
- All 12 types are represented
- Each type shows a count of items (e.g., "Halo (5)")

**Edge Cases:**
- No items of a particular type → count is 0 or type is grayed out
- Filter control is hidden on mobile / narrow screens → responsive behavior

---

### Test Case WL-TYPE-002: Filter by Single Type
**Preconditions:**
- At least 15 WL items with mixed types (3+ types represented)
- Live Preview open, Worklog tab active
- Type filter sidebar is visible

**Steps:**
1. By default, all types are shown
2. Click the checkbox next to "Halo" type to deselect it
3. Verify all non-Halo items disappear
4. Verify only Halo items remain in the list/board
5. Click the checkbox again to re-select "Halo"
6. Verify all items reappear

**Expected Result:**
- Filter is applied/removed instantly without page reload
- Item count badge updates on type filters
- Deselecting a type hides all items of that type

**Edge Cases:**
- All types deselected → empty list with message "No items match filters"
- Only 1 type has items → filtering to that type works correctly
- Filter state persists across tab switches (localStorage key: `rcc_wl_type_filters` or similar)

---

### Test Case WL-TYPE-003: Multiple Type Filters (AND Logic)
**Preconditions:**
- At least 20 WL items with 5+ types mixed
- Live Preview open

**Steps:**
1. Deselect all types except "Halo" and "Sherlock"
2. Verify only items with type="Halo" OR type="Sherlock" appear (OR logic, not AND)
3. Deselect "Sherlock"
4. Verify only "Halo" items remain
5. Deselect "Halo" and select "Training" and "Report"
6. Verify items with type="Training" OR type="Report" appear

**Expected Result:**
- Multiple selected types use OR logic (union of items)
- Filter updates instantly as checkboxes are toggled
- Item count updates to reflect filtered set

---

### Test Case WL-TYPE-004: Type Filter Persistence
**Preconditions:**
- Live Preview open

**Steps:**
1. Set type filter to only "Halo" and "Sherlock" (others unchecked)
2. Switch to another tab (Todos, Calendar, etc.)
3. Switch back to Worklog tab
4. Verify the filter is still active (only Halo + Sherlock visible)
5. Refresh page (F5)
6. Verify the filter is still active

**Expected Result:**
- Filter state persists in localStorage
- Survives tab switches and page refreshes
- localStorage key pattern: `rcc_wl_type_filters` or similar

---

## Feature 3: Knowledge Hub Unified Modals (Tags, Links, Archive Filter)

### Context
Knowledge Hub (KH) is a collection of documentation and references split into 4 sub-sections: Clinical, Cogito, ReqProc, TrustAnalytics. Each section has entries that can have tags and can be archived. There are unified modal features for viewing/editing entries across all sections.

### Test Case KH-MODAL-001: Open Entry View Modal
**Preconditions:**
- At least 1 Clinical entry exists
- Live Preview open, References tab or Documentation tab active (depending on KH location)

**Steps:**
1. Navigate to Clinical section
2. Click on an entry card (not the menu button)
3. Verify a modal opens with the entry title and content
4. Verify the modal is draggable (drag by the title bar)
5. Verify the modal has a close button (X icon)
6. Click the close button
7. Verify the modal closes and backdrop disappears

**Expected Result:**
- Modal opens without delay
- Modal is draggable by the header
- Modal closes cleanly
- Backdrop (semi-transparent overlay) appears/disappears with modal

**Edge Cases:**
- Entry has very long title → title wraps or truncates gracefully
- Entry has no content → modal shows empty body
- Multiple modals open → each has incrementing z-index

---

### Test Case KH-MODAL-002: Edit Entry Modal (Tags Section)
**Preconditions:**
- At least 1 Clinical entry exists
- Live Preview open

**Steps:**
1. Click on a Clinical entry to open view modal
2. Look for an "Edit" button or click-to-edit functionality
3. Verify the entry title becomes an editable input
4. Verify there is a "Tags" input or tag list
5. Type a new tag (e.g., "urgent")
6. Press Enter or click outside
7. Verify the tag is added to the entry
8. Click an existing tag (if any)
9. Verify it can be removed or toggled
10. Save the entry
11. Reopen the entry
12. Verify tags are persisted

**Expected Result:**
- Entry can be edited in modal without a separate "edit mode"
- Tags can be added/removed via input
- Tags are saved to the entry
- Tags persist across page refreshes

**Edge Cases:**
- Duplicate tag entered → should not create duplicate or should merge
- Very long tag → may truncate or wrap
- Delete all tags → entry still editable

---

### Test Case KH-MODAL-003: Archive Filter in Knowledge Hub
**Preconditions:**
- At least 2 Clinical entries, with 1 archived
- Live Preview open, Clinical section visible

**Steps:**
1. By default, archived entries should be hidden
2. Look for a toggle or filter labeled "Show archived" or similar
3. Click it
4. Verify all entries including archived ones appear
5. Verify archived entries have a badge or styling indicating archived status
6. Click the toggle again to hide archived
7. Verify archived entries disappear
8. Refresh page (F5)
9. Verify the filter state resets to "show all" or "show only active" (depending on design)

**Expected Result:**
- Archive filter toggle works across all 4 KH sub-sections
- Archived entries have consistent visual indicator
- Filter can be applied per section or globally

**Edge Cases:**
- All entries are archived → toggle shows empty or "no active entries"
- No archived entries exist → toggle button still visible but clicking shows no change

---

### Test Case KH-MODAL-004: Links in Knowledge Hub Entries
**Preconditions:**
- At least 1 Cogito or other KH entry with links/references
- Live Preview open

**Steps:**
1. Open an entry modal
2. Verify links are rendered as clickable hyperlinks
3. Click a link
4. Verify it opens in a new tab or window (or stays in tab, depending on implementation)
5. Go back to the modal
6. Look for a way to add/edit links (if applicable)
7. Verify links can be displayed in a "Links" section or inline

**Expected Result:**
- Links are rendered correctly and are clickable
- External links open without breaking the modal
- Link text/URL are visible and properly formatted

---

## Feature 4: Universal Modals (Delete/Archive Footer, Collapsible Sections)

### Context
WL edit modals and KH entry modals share a common footer with Delete and Archive buttons. Sections inside modals can be collapsible (click header to toggle visibility). These are "universal" patterns used across multiple modal types.

### Test Case MODAL-FOOTER-001: Delete Button Exists in Edit Modal
**Preconditions:**
- WL item open in edit modal (or KH entry modal)
- Live Preview open

**Steps:**
1. Scroll to the bottom of the modal
2. Verify there is a footer with a "Delete" button (appears red or with danger styling)
3. Verify there is an "Archive" button next to it
4. Verify both buttons have clear labels and are clickable
5. Hover over the Delete button
6. Verify a tooltip or visual emphasis indicates the action is destructive

**Expected Result:**
- Footer is always visible (sticky) at the bottom of modal content
- Delete button has danger/red styling
- Archive button is neutral (possibly with auto-layout, pushing Delete to left)

---

### Test Case MODAL-FOOTER-002: Delete Button with Confirm Dialog (P1 Bug)
**Preconditions:**
- WL item open in edit modal
- Live Preview open at http://127.0.0.1:3000 (NOT file://)
- DevTools console open

**Steps:**
1. Click the Delete button
2. **Expected Behavior (should use showConfirm):** A custom modal appears asking "Delete this entry? This cannot be undone." with OK/Cancel buttons
3. **Actual Behavior (P1 bug):** A native browser confirm() dialog may not appear (blocked in Live Preview) or shows an error in console
4. Click OK in the dialog
5. Verify the entry is deleted and modal closes
6. Verify the item no longer appears in the list
7. Check DevTools console for any errors related to `confirm()` or `showConfirm()`

**Expected Result:**
- A custom confirm modal appears (via `showConfirm()`)
- Clicking OK deletes the entry and closes modal
- Clicking Cancel cancels the delete and keeps modal open
- No native browser dialog appears

**Edge Cases:**
- Delete from board view vs. list view → both should work
- Delete when entry is referenced elsewhere → no orphaned data
- Delete the only item of its type → list shows empty state

**Regression Alert:**
This test will expose the P1 bug at rcc.js:5399 where `confirm()` is used instead of `showConfirm()`. The fix is:
```js
// Current (broken):
if (confirm('Delete this entry? This cannot be undone.')) onDelete();

// Fixed:
showConfirm('Delete this entry? This cannot be undone.', onDelete, 'danger');
```

---

### Test Case MODAL-FOOTER-003: Archive Button Behavior
**Preconditions:**
- WL item or KH entry open in edit modal
- Item status is NOT "Archived"
- Live Preview open

**Steps:**
1. Scroll to modal footer
2. Click the "Archive" button
3. Verify a toast message appears: "Item archived." or similar
4. Verify the modal closes automatically
5. Verify the item is no longer visible in the list (unless "Show archived" is enabled)
6. Reopen the item (toggle "Show archived" if needed)
7. Verify status has changed to "Archived"
8. Click "Archive" button again (should now be "Unarchive")
9. Verify it unarchives the item
10. Verify a toast appears: "Item unarchived."

**Expected Result:**
- Archive button triggers archive action without a confirmation dialog
- Toast confirms the action
- Modal closes after archive
- Status updates correctly
- Button text toggles between "Archive" and "Unarchive"

**Edge Cases:**
- Archive when item already status="Archived" → unarchive instead
- Archive a newly-created item → works correctly
- Archive from view modal vs. edit modal → both work

---

### Test Case MODAL-COLLAPSE-001: Collapsible Sections Exist
**Preconditions:**
- WL item open in edit modal
- Item has 3+ sections (e.g., "Overview", "Details", "Notes")
- Live Preview open

**Steps:**
1. Verify each section has a title with a downward-pointing chevron (▼)
2. Verify the title is clickable
3. Click a section title
4. Verify the section body collapses and chevron rotates (▶)
5. Click the title again
6. Verify the section expands and chevron points down again

**Expected Result:**
- All sections are collapsible
- Chevron rotates to indicate collapsed/expanded state
- Content disappears/reappears smoothly (may have CSS transition)

**Edge Cases:**
- All sections collapsed → only headers visible, layout is clean
- Collapse/expand rapidly → no animation glitch or state corruption
- Scroll position preserved when collapsing → user doesn't lose scroll context

---

### Test Case MODAL-COLLAPSE-002: Collapsible Sections with Interactive Content
**Preconditions:**
- WL modal open with CodeMirror sections or linked list items visible
- Live Preview open

**Steps:**
1. Click inside a CodeMirror editor within a section
2. Verify text cursor appears and you can type
3. Without losing focus, click the section header
4. Verify the section collapses while you're typing
5. Click the header again to expand
6. Verify your text is still there and cursor is still active
7. Click the section header again with proper `stopPropagation()` on child elements
8. Verify nested buttons/inputs don't trigger collapse

**Expected Result:**
- Child click handlers properly call `e.stopPropagation()`
- Collapsing doesn't blur or clear active inputs
- Content state is preserved during collapse/expand

**Pitfall Alert:**
If child elements inside section headers don't call `stopPropagation()`, clicks on buttons inside the section will trigger the collapse instead of the intended action.

---

## Feature 5: CodeMirror 6 Editor (Toolbar, No Drag Conflicts)

### Context
WL items use CodeMirror 6 for editing sections. The editor supports markdown mode, syntax highlighting, and a format toolbar. The toolbar has buttons for bold, italic, code, heading, list, and special modes like Vim and line numbers. The WL modal is draggable, and drag conflicts with CodeMirror's native drag-select must be avoided.

### Test Case CM6-LOAD-001: CodeMirror Loads from CDN
**Preconditions:**
- Live Preview open
- WL item created or opened in edit modal
- DevTools Network tab open

**Steps:**
1. Open a WL item in edit modal
2. Check DevTools Network tab
3. Verify esm.sh CDN is loaded with CodeMirror modules (look for requests to esm.sh)
4. Verify the editor appears on the page (a text area with syntax highlighting)
5. Verify the format toolbar appears above or below the editor
6. Check for any 404 or failed requests in Network tab
7. Verify console has no errors about missing CM6 modules

**Expected Result:**
- CodeMirror modules load successfully from CDN
- Editor renders with markdown syntax highlighting
- No console errors
- Toolbar renders with visible buttons

**Edge Cases:**
- Network offline → fall back to plain textarea or show error
- CDN script blocked by content security policy → should fail gracefully
- Multiple editors in same modal → all load correctly

---

### Test Case CM6-EDITOR-002: Type and Edit in CodeMirror
**Preconditions:**
- WL item open in edit modal with CodeMirror visible
- Live Preview open

**Steps:**
1. Click in the CodeMirror editor
2. Type some text: "# Hello\n\nThis is **bold** text."
3. Verify syntax highlighting applies (heading in larger/bold, bold markers in muted color)
4. Verify text input is instant and responsive
5. Select all text (Cmd+A)
6. Verify selection highlight appears
7. Delete and type new content
8. Verify the editor is responsive to rapid typing

**Expected Result:**
- Editor responds instantly to keyboard input
- Syntax highlighting is accurate
- Text selection works
- No lag or jank in rendering

**Edge Cases:**
- Very large content (1000+ lines) → editor performance degrades gracefully
- Rapid paste of large text → content renders without hanging
- Special characters (emoji, unicode) → render correctly

---

### Test Case CM6-TOOLBAR-003: Format Toolbar Buttons Work
**Preconditions:**
- WL item open in edit modal
- CodeMirror editor visible with toolbar
- Live Preview open

**Steps:**
1. Type some text: "hello"
2. Select "hello" by triple-clicking or manually selecting
3. Click the "Bold" button (B icon) in the toolbar
4. Verify the text becomes "**hello**" with markdown markers
5. Click the "Italic" button (I icon)
6. Verify the text is now "***hello***"
7. Click the "Code" button (` icon)
8. Verify backticks are wrapped around the text
9. Type on a new line and click "Heading" button
10. Verify a "#" prefix is inserted at the cursor
11. Click "List" button
12. Verify a "- " bullet is inserted

**Expected Result:**
- Each toolbar button inserts or wraps the correct markdown syntax
- Buttons work on selected text (wrapping) or at cursor (insertion)
- Toolbar is responsive and shows visual feedback on click

**Edge Cases:**
- No text selected when clicking a wrapping button → button is disabled or wraps empty string
- Cursor at end of line → insertion works correctly
- Multiple selections (if supported) → all are wrapped

---

### Test Case CM6-TOOLBAR-004: Vim Mode Toggle
**Preconditions:**
- WL item open in edit modal with CodeMirror
- Live Preview open

**Steps:**
1. Locate the "Vim" button in the toolbar (may be labeled "Vim" or have a V icon)
2. Click the Vim button
3. Verify the button becomes highlighted/active
4. Try pressing Escape and then typing "dd" (Vim delete line command)
5. Verify Vim key bindings are active (content behavior changes)
6. Click the Vim button again to toggle off
7. Verify the button becomes inactive
8. Try pressing Escape → verify it no longer triggers Vim commands (or Vim is disabled)

**Expected Result:**
- Vim mode can be toggled on/off
- Vim key bindings are active when mode is on
- Button shows active state when Vim is enabled
- Toggle persists within the same modal (may reset on modal close)

**Edge Cases:**
- Vim toggled while cursor is in editor → focus should remain
- Multiple editors in same modal with different Vim states → each maintains its own state
- Vim mode with CodeMirror selections → selections work with Vim commands

---

### Test Case CM6-TOOLBAR-005: Line Numbers Toggle
**Preconditions:**
- WL item open in edit modal
- CodeMirror editor visible
- Live Preview open

**Steps:**
1. Locate the "Line numbers" button (may be labeled "Ln" or have a # icon)
2. Click the button
3. Verify line numbers appear in the gutter on the left of the editor
4. Click the button again
5. Verify line numbers disappear
6. Type or paste multi-line content
7. Toggle line numbers on
8. Verify line numbers update and remain correct

**Expected Result:**
- Line numbers gutter toggles on/off
- Button shows active state when line numbers are visible
- Line numbers are accurate and update as content changes

---

### Test Case CM6-NO-DRAG-CONFLICT-006: Modal Drag Doesn't Interfere with CM6
**Preconditions:**
- WL item open in edit modal
- Modal has a drag bar (header) at the top
- CodeMirror editor visible in modal
- Live Preview open

**Steps:**
1. Click and drag on the WL modal drag bar (at the top/header area)
2. Verify the modal moves smoothly
3. Click and drag inside the CodeMirror editor to select text
4. Verify text is selected (native CodeMirror drag-select)
5. Verify modal does NOT move during CodeMirror drag-select
6. Try dragging from the drag bar again
7. Verify modal drag still works

**Expected Result:**
- Modal drag bar is separate from editor area
- CodeMirror drag-select works without moving the modal
- No event listener conflicts between modal drag and editor

**Pitfall Alert:**
If the modal drag handler uses `addEventListener('dragstart')` globally, it will conflict with CodeMirror's drag-select. The modal should only respond to drag on the specific drag bar element, not on CodeMirror content.

---

### Test Case CM6-PASTE-IMAGE-007: Paste Image as Base64
**Preconditions:**
- WL item open in edit modal
- CodeMirror editor visible
- Have an image file in clipboard (or access to paste an image)
- Live Preview open

**Steps:**
1. Click in the CodeMirror editor
2. Copy an image to clipboard (from another app or download an image)
3. Right-click in editor and paste (or Cmd+V)
4. **Expected:** Image is uploaded and converted to base64, inserted as `![](data:image/png;...)`
5. **Actual (may vary):** Paste behavior depends on implementation
6. Verify the image appears inline in the editor or in rendered output
7. Save the entry
8. Reopen the entry
9. Verify the image is still there and loads correctly

**Expected Result:**
- Images can be pasted into CodeMirror
- Images are stored as base64 in the entry JSON
- Images persist across page refreshes
- Inline image rendering works

**Edge Cases:**
- Very large image (10+ MB) → may hit IndexedDB size limits
- Image paste in normal text input → should work or fail gracefully
- Multiple images in same section → all are stored and rendered

---

## Feature 6: Delete Button (P1 Confirm Bug)

### Context
The Delete button in modal footers uses native `confirm()` at rcc.js:5399, which is blocked in VS Code Live Preview. This is a critical P1 bug. Testing this feature will surface the bug.

### Test Case DELETE-BUG-001: Delete Button Triggers Confirm (Should Use showConfirm)
**Preconditions:**
- WL item or KH entry open in edit modal
- Live Preview open at http://127.0.0.1:3000
- DevTools Console open to watch for errors

**Steps:**
1. Click the Delete button in the modal footer
2. **Expected (correct behavior):** A custom modal overlay appears with message "Delete this entry? This cannot be undone." with OK/Cancel buttons
3. **Actual (P1 bug):** One of the following occurs:
   - Nothing happens (confirm() fails silently in Live Preview)
   - An error appears in DevTools Console
   - No dialog appears at all
4. Check DevTools Console for any errors or warnings
5. Try to look for a standard browser confirm dialog (there shouldn't be one)

**Expected Result:**
- A custom `showConfirm()` modal appears
- Modal has "OK" and "Cancel" buttons
- Clicking OK deletes the entry
- Clicking Cancel cancels the delete

**Actual Result (P1 Bug):**
- Native `confirm()` is used instead of `showConfirm()`
- Native dialog doesn't appear in Live Preview
- Delete action doesn't proceed
- No visual feedback to the user

**Regression Fix Verification:**
Once the bug is fixed (by changing line 5399 to use `showConfirm()`), re-run this test to verify:
- Custom modal appears
- Delete proceeds correctly

---

### Test Case DELETE-BUG-002: Delete from View Modal vs. Edit Modal
**Preconditions:**
- Multiple entries exist
- Live Preview open

**Steps:**
1. Open an entry in view-only mode (not edit)
2. Look for a Delete button
3. If a Delete button exists in view mode, click it
4. Verify the same confirm dialog behavior (or lack thereof)
5. Open a different entry in edit mode
6. Click Delete button
7. Verify behavior is consistent between view and edit modes

**Expected Result:**
- Delete button behavior is consistent regardless of modal mode
- Same `showConfirm()` modal appears in both cases

---

## Feature 7: Four KH Sub-Sections (Area CRUD, Entry CRUD, Tag Filtering)

### Context
Knowledge Hub has 4 sub-sections:
1. Clinical
2. Cogito
3. ReqProc (Requirements / Process)
4. TrustAnalytics

Each section has:
- Areas (categories) that can be created, renamed, and deleted
- Entries (items) within areas that can be created, edited, archived, and deleted
- Tags on entries that can be filtered

### Test Case KH-CLINICAL-AREA-CRUD-001: Create New Clinical Area
**Preconditions:**
- Live Preview open, Knowledge Hub tab active (or References/Documentation tab, depending on layout)
- Clinical section visible in sidebar

**Steps:**
1. Look for a "Clinical" section with an area list
2. Locate a button labeled "+ New area" or "Add area"
3. Click the button
4. Verify a modal or inline input appears
5. Type a new area name: "Pathophysiology"
6. Press Enter or click OK
7. Verify the new area appears in the Clinical area list
8. Refresh page (F5)
9. Verify the area persists

**Expected Result:**
- New area is created and added to the list
- Area name is editable on creation
- Area persists in localStorage or IndexedDB
- Area appears in sidebar with a unique ID

**Edge Cases:**
- Area name is very long (100+ chars) → truncates or wraps gracefully
- Area name is empty → shows error or doesn't create
- Duplicate area names → may allow or show error (design-dependent)

---

### Test Case KH-CLINICAL-AREA-CRUD-002: Rename Clinical Area
**Preconditions:**
- At least 1 Clinical area exists
- Live Preview open

**Steps:**
1. Right-click (or click a menu icon) on a Clinical area
2. Verify a context menu or dropdown appears
3. Click "Rename"
4. Verify an input field appears with the current area name
5. Clear the input and type a new name: "Neuroanatomy"
6. Press Enter
7. Verify the area name updates in the sidebar
8. Refresh page (F5)
9. Verify the renamed area persists

**Expected Result:**
- Area can be renamed via context menu
- Name change is instant
- Persists across page refreshes

**Edge Cases:**
- Rename to an empty string → shows error or doesn't allow
- Rename to a duplicate name → may show error
- Rename while entries are open → entries remain associated

---

### Test Case KH-CLINICAL-AREA-CRUD-003: Delete Clinical Area
**Preconditions:**
- At least 2 Clinical areas exist
- 1 area has 0 entries, 1 area has 3+ entries
- Live Preview open

**Steps:**
1. Right-click on an area with 0 entries
2. Click "Delete area"
3. Verify a custom confirm dialog appears: "Delete area '[name]'?"
4. Click OK
5. Verify the area is removed from the sidebar
6. Right-click on an area with 3+ entries
7. Click "Delete area"
8. Verify a confirm dialog appears: "Delete '[name]' and its 3 entries? This cannot be undone."
9. Click Cancel
10. Verify the area and entries are NOT deleted
11. Click Delete again and click OK
12. Verify the area and all entries are deleted
13. Refresh page (F5)
14. Verify the deletion persists

**Expected Result:**
- Delete area shows appropriate confirm dialog with entry count
- Entries are deleted along with the area
- Deletion is permanent (no undo)
- Persists across page refresh

**Edge Cases:**
- Delete the only area → new entries go to null/uncategorized area
- Delete while area is selected → sidebar should deselect or show empty state

---

### Test Case KH-CLINICAL-ENTRY-CREATE-004: Create New Entry in Clinical Area
**Preconditions:**
- At least 1 Clinical area exists
- Live Preview open, Clinical section active

**Steps:**
1. Click on a Clinical area to select it
2. Look for a button like "+ New entry" or "Add entry"
3. Click the button
4. Verify an entry creation modal appears
5. Verify the area name is shown or pre-selected
6. Enter a title: "Cardiac Physiology"
7. Verify an input field for tags appears
8. Type a tag: "physiology"
9. Press Enter or Tab to confirm the tag
10. Type content in the editor section: "The heart pumps blood..."
11. Click Save
12. Verify the entry appears in the Clinical entry list
13. Verify the entry shows the tag
14. Refresh page (F5)
15. Verify the entry persists

**Expected Result:**
- New entry is created with title, tags, and content
- Entry appears in the area entry list
- Tags are displayed on the entry card
- Entry persists across page refreshes
- Entry is associated with the selected area

**Edge Cases:**
- Create entry without tags → entry still exists
- Create entry without content → entry can be empty
- Create entry and immediately close modal → unsaved changes warning (if applicable)

---

### Test Case KH-CLINICAL-ENTRY-EDIT-005: Edit Clinical Entry
**Preconditions:**
- At least 1 Clinical entry exists
- Live Preview open

**Steps:**
1. Click on an entry to open the view modal
2. Look for an Edit button or click-to-edit functionality
3. Edit the title: append " (Updated)"
4. Edit the content: add a new paragraph
5. Add a new tag: "reviewed"
6. Remove an existing tag (if any) by clicking an X next to it
7. Click Save
8. Verify the modal closes
9. Click the entry again to view
10. Verify all changes are persisted: title, content, tags

**Expected Result:**
- Entry can be edited in modal
- Title, content, and tags can all be modified
- Changes are saved immediately on Save click
- Changes persist across page refreshes

**Edge Cases:**
- Edit and close without saving → changes are lost (or warning is shown)
- Add duplicate tag → tag is not duplicated
- Delete all tags → entry has no tags but still exists

---

### Test Case KH-CLINICAL-ENTRY-DELETE-006: Delete Clinical Entry
**Preconditions:**
- At least 2 Clinical entries exist
- Live Preview open, Clinical entry view modal open

**Steps:**
1. Open a Clinical entry in edit modal
2. Scroll to the footer
3. Click the Delete button
4. Verify a custom confirm modal appears: "Delete this entry? This cannot be undone."
5. Click Cancel
6. Verify the modal stays open and entry is NOT deleted
7. Click Delete button again
8. Click OK in the confirm dialog
9. Verify the entry modal closes
10. Verify the entry is removed from the Clinical entry list
11. Refresh page (F5)
12. Verify the entry is gone permanently

**Expected Result:**
- Delete requires a confirm dialog (via `showConfirm()`)
- Clicking Cancel cancels the delete
- Clicking OK deletes the entry immediately
- Entry is removed from the list
- Deletion persists (no undo)

**Note:** This test will also confirm whether the P1 confirm() bug exists in KH entries.

---

### Test Case KH-CLINICAL-ENTRY-ARCHIVE-007: Archive Clinical Entry
**Preconditions:**
- At least 2 Clinical entries exist
- None are archived
- Live Preview open

**Steps:**
1. Open an entry in edit modal
2. Click the Archive button in the footer
3. Verify a toast appears: "Item archived."
4. Verify the modal closes
5. Verify the entry is no longer visible in the entry list
6. Look for a filter/toggle to "Show archived"
7. Click it
8. Verify the entry reappears with an archived badge
9. Open the archived entry
10. Verify it can still be edited or unarchived
11. Click Archive again (should now show "Unarchive")
12. Verify it unarchives

**Expected Result:**
- Archive removes entry from active view
- Archive toggle shows/hides archived entries
- Archived entries can be unarchived
- Toast confirms archive action

---

### Test Case KH-CLINICAL-TAG-FILTER-008: Tag Filtering in Clinical Section
**Preconditions:**
- At least 5 Clinical entries with varied tags:
  - Entry A: tags ["physiology", "cardiac"]
  - Entry B: tags ["physiology"]
  - Entry C: tags ["anatomy"]
  - Entry D: tags ["cardiac", "anatomy"]
  - Entry E: tags ["research"]
- Live Preview open

**Steps:**
1. View the Clinical entry list
2. Look for a tag filter area (may be a sidebar, toolbar, or tag cloud)
3. Click on the "physiology" tag
4. Verify only entries with "physiology" tag appear (A, B)
5. Click on the "cardiac" tag (in addition to "physiology")
6. Verify entries with "physiology" OR "cardiac" appear (A, B, D) — OR logic, not AND
7. Click on "physiology" again to deselect
8. Verify only "cardiac" entries appear (A, D)
9. Clear all tag filters
10. Verify all entries reappear
11. Refresh page (F5)
12. Verify the filter state is reset (or persisted, depending on design)

**Expected Result:**
- Tags can be clicked to filter entries
- Multiple selected tags use OR logic (union)
- Entries matching any selected tag appear
- Filter is instant and responsive

**Edge Cases:**
- No entries have a particular tag → tag is grayed out or doesn't appear
- All entries have the same tag → filter shows all or empty state
- Entry has no tags → entry appears when no tags are filtered

---

### Test Case KH-COGITO-AREA-CRUD-009: Cogito Section CRUD (Same Pattern as Clinical)
**Preconditions:**
- Live Preview open

**Steps:**
1. Repeat tests KH-CLINICAL-AREA-CRUD-001 through KH-CLINICAL-ENTRY-ARCHIVE-007 for the Cogito section
2. Replace "Clinical" with "Cogito" and "Pathophysiology" with "Decision Making" (or similar Cogito-themed names)

**Expected Result:**
- Cogito section has identical CRUD behavior to Clinical
- Areas, entries, tags, archives all work the same way
- Sections are independent (entries don't cross-contaminate)

**Note:** Cogito section may have different naming conventions or additional fields compared to Clinical, but core CRUD should be identical.

---

### Test Case KH-REQPROC-CRUD-010: ReqProc Section CRUD
**Preconditions:**
- Live Preview open

**Steps:**
1. Repeat CRUD and tag filtering tests for ReqProc section
2. Use domain-specific names like "Requirements", "Process Flow", "Validation"

**Expected Result:**
- ReqProc section behaves identically to Clinical and Cogito
- CRUD operations work without cross-section contamination

---

### Test Case KH-TRUSTANALYTICS-CRUD-011: TrustAnalytics Section CRUD
**Preconditions:**
- Live Preview open

**Steps:**
1. Repeat CRUD and tag filtering tests for TrustAnalytics section
2. Use domain-specific names like "Trust Model", "Validation Framework"

**Expected Result:**
- TrustAnalytics section behaves identically to other sections
- CRUD operations are consistent

---

### Test Case KH-CROSS-SECTION-TAGS-012: Tags Are Not Shared Across Sections
**Preconditions:**
- Clinical, Cogito, ReqProc, TrustAnalytics sections all visible
- Each has entries with some tags
- Live Preview open

**Steps:**
1. Add tag "critical" to a Clinical entry
2. Add tag "critical" to a Cogito entry (same tag name)
3. Filter Clinical entries by "critical"
4. Verify only Clinical entries with "critical" appear (Cogito entries don't appear)
5. Switch to Cogito section
6. Filter by "critical"
7. Verify only Cogito entries with "critical" appear

**Expected Result:**
- Tags are scoped per section (not global)
- Filtering in one section doesn't affect other sections
- Tag names can be reused across sections without collision

---

## Summary of Test Cases

Total: **44 test cases** covering:

| Feature | Test Cases | IDs |
|---------|------------|-----|
| Archive panel (WL items) | 4 | WL-ARCH-001 to WL-ARCH-004 |
| WL Type sidebar filtering | 4 | WL-TYPE-001 to WL-TYPE-004 |
| KH unified modals | 4 | KH-MODAL-001 to KH-MODAL-004 |
| Universal modals (footer, collapse) | 6 | MODAL-FOOTER-001 to MODAL-COLLAPSE-002 |
| CodeMirror 6 editor | 7 | CM6-LOAD-001 to CM6-PASTE-IMAGE-007 |
| Delete button (P1 bug) | 2 | DELETE-BUG-001 to DELETE-BUG-002 |
| Four KH sub-sections CRUD | 12 | KH-CLINICAL-AREA-CRUD-001 to KH-CROSS-SECTION-TAGS-012 |

---

## Known Issues & Blockers

### P1 Bug: Native confirm() at rcc.js:5399
- **Location:** buildWLEditFooter() function
- **Issue:** Uses `confirm()` instead of `showConfirm()`
- **Impact:** Delete button doesn't work in Live Preview
- **Tests Affected:** DELETE-BUG-001, DELETE-BUG-002, KH-CLINICAL-ENTRY-DELETE-006, MODAL-FOOTER-002
- **Fix:** Replace line 5399:
  ```js
  showConfirm('Delete this entry? This cannot be undone.', onDelete, 'danger');
  ```

### Feature Not Found: WL Type Sidebar Filtering
- **Tests:** WL-TYPE-001 to WL-TYPE-004
- **Status:** Code search did not find `wlTypeFilter` or type filter UI
- **Action:** If feature doesn't exist, mark tests as "Feature not implemented" and skip

---

## Test Execution Checklist

Before starting any test session:

- [ ] Live Preview running at http://127.0.0.1:3000
- [ ] DevTools open (F12) with Console tab visible
- [ ] localStorage cleared (if starting fresh)
- [ ] No browser extensions interfering (ad blockers, dark mode, etc.)
- [ ] Network tab shows CDN loads (Chart.js, CodeMirror, marked, highlight.js)
- [ ] No console errors on page load

During testing:

- [ ] Test in isolation (one test at a time, reset state if needed)
- [ ] Document any deviations from expected results
- [ ] Screenshot or record screen for complex interactions
- [ ] Note timing/performance issues (slow load, jank, lag)
- [ ] Check localStorage after each major action

After testing:

- [ ] Summarize results in a report
- [ ] Highlight any regressions from previous versions
- [ ] Note any new bugs discovered
- [ ] Provide steps to reproduce any failures

---

## Contact & Support

- **Test Environment:** http://127.0.0.1:3000 (VS Code Live Preview)
- **Source:** ~/Developer/rcc-pwa/rcc.js, rcc.css, rcc.html
- **Agent:** Iris (Tester, claude-haiku-4-5-20251001)
- **Date Created:** 2026-03-27
