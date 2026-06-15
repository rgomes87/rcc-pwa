# Repository Guidelines

## Project Structure & Module Organization
`rcc.html` is the app shell, `rcc.js` contains application logic, and `rcc.css` holds all styles. PWA metadata lives in `sw.js`, `manifest.json`, and `icon.svg`. Use `docs/` for project context and templates, especially `docs/RCC-CONTEXT.md`, `docs/RCC-GUIDE.md`, and `docs/WL-TEMPLATES.md`. `rcc-deploy/` is generated output for Netlify; do not hand-edit it. `Rui-Inbox/` and `Team-Folder/` contain handoff notes and manual test cases, not runtime code.

## Build, Test, and Development Commands
There is no package manager, build step, or local backend.

- `open rcc.html`: open the app directly in Chrome for local development.
- `bash update-deploy.sh`: copy source files into `rcc-deploy/` and rename `rcc.html` to `index.html` for drag-and-drop Netlify deploys.

Before shipping, bump the cache constant in `sw.js`, for example `const CACHE = 'rcc-v118';`, so existing installs refresh cleanly.

## Coding Style & Naming Conventions
Keep the no-build vanilla JS structure intact. Follow existing naming: camelCase for functions and state, UPPER_SNAKE_CASE for keys/constants, and kebab-case for CSS classes. Match the surrounding indentation style, which is predominantly two spaces in markup and CSS. Prefer extending small helper functions over introducing modules, frameworks, or tooling. Use `showConfirm()` and `showToast()` instead of native `confirm()` or `alert()`.

## Testing Guidelines
No automated test suite or coverage gate exists. Validate changes manually in Chrome by exercising the affected tab, persistence path, modal flow, and drag interaction. For offline-sensitive work, verify the service worker still serves the shell after reload. Add non-obvious regression notes to the existing date-stamped docs pattern, for example `Rui-Inbox/2026-03-27-test-cases.md`.

## Commit & Pull Request Guidelines
Recent commits use short imperative subjects, often with prefixes such as `feat:` or `Fix:`. Keep commits scoped to one behavior or bug. Pull requests should summarize user-visible changes, list manual verification performed, mention any `sw.js` cache bump, and include screenshots for UI changes.
