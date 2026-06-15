# Task: Create test cases for rcc-pwa manual validation
Date: 2026-03-27
Lead: Iris (Tester)

## What was done
Iris recruited as team Tester and created 44 comprehensive manual test cases covering the 7 unvalidated features: Archive panel, WL Type filtering, KH unified modals, Universal modals, CodeMirror 6 editor, Delete button, and four KH sub-sections (Clinical, Cogito, ReqProc, TrustAnalytics). Tests include setup instructions (Live Preview at http://127.0.0.1:3000), edge cases, and pitfall awareness (localStorage origins, Chart.js timing, modal stacking, etc.).

## Output location
~/AgentTeam/Team-Folder/rcc-test-cases-2026-03-27.md (1,162 lines, 44 test cases)

## Anything Rui should know
- P1 confirm() bug at rcc.js:5399 is explicitly tested (DELETE-BUG-001/002, MODAL-FOOTER-002) and will block Delete button in Live Preview
- WL Type sidebar filtering code wasn't found in the codebase — tests included but marked for skip if missing
- Use http://127.0.0.1:3000 not file:// (file URLs don't work with Live Preview)
- Iris is now available as standalone Tester (no Lead review loop) — invoke directly via Agent tool for future test work
