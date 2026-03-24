# RCC — Rui's Command Centre

A personal work management PWA built with zero dependencies, no build step, and no server. Runs entirely in the browser, installs as a native app, and works offline.

> **Stack:** Vanilla JS · CSS variables · IndexedDB · Service Worker · Chart.js · marked.js · highlight.js

---

## Features

| Tab | What it does |
|-----|-------------|
| **Dashboard** | Charts and stats — time by category, weekly completion trend, work log by status, top tasks by time |
| **Todos** | Weekly task management with priorities, timers, recurring tasks, drag-to-reorder, and end-of-week carry-over |
| **Work Log** | Documentation tracker — draggable floating modals, `contenteditable` sections with inline image paste, markdown export |
| **Reminders** | Time-based reminders with toast notifications and overdue alerts |
| **Links** | Bookmark dashboard with resizable column groups and favicons |
| **Knowledge Hub** | Guides, Snippets, Databases, Contacts — all with sidebar category navigation |
| **Calendar** | Week (Mon–Fri, 08–18) and month views; click any slot to create tasks or reminders |

**Other highlights:**
- 9 colour themes (light, dark, warm variants, high-contrast)
- Installable as a PWA via Chrome on Mac or Windows
- Full backup/restore — single JSON export covers all data
- Auto-backup to a local folder (requires HTTPS)
- No account, no server, no data leaving your machine

---

## Architecture

```
rcc.html        — app shell (minimal markup)
rcc.css         — all styles (~3,600 lines, CSS variables throughout)
rcc.js          — all application logic (~10,000 lines, vanilla ES6+)
sw.js           — service worker (cache-first, offline support)
manifest.json   — PWA manifest
icon.svg        — app icon
update-deploy.sh — copies source → rcc-deploy/ for Netlify drag-deploy
```

**Storage:**

| Data | Store |
|------|-------|
| Todos, links, reminders, settings | `localStorage` |
| Work log items (incl. base64 images) | `IndexedDB` |

**External dependencies** (CDN, cached by service worker):
- [Chart.js 4.4.4](https://www.chartjs.org/)
- [marked 12.0.0](https://marked.js.org/)
- [highlight.js 11.9.0](https://highlightjs.org/)
- Google Fonts (DM Mono, Fraunces, Inter, JetBrains Mono)

---

## Running locally

### Option A — open directly in Chrome

```bash
open rcc.html
```

Works immediately. Two features require HTTPS (auto-backup to folder, doc download folders) — use Option B for those.

### Option B — VS Code Live Preview (recommended for development)

1. Install the [Live Preview](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server) extension
2. Right-click `rcc.html` → **Show Preview**
3. Opens at `http://127.0.0.1:3000`

> **Note:** `localhost` and `file://` are separate localStorage origins — don't mix them or your data won't appear.

---

## Deploying to Netlify

RCC deploys by dragging a folder — no CLI, no account required for the first deploy.

### First deploy

1. Run the update script to sync source files into `rcc-deploy/`:

   ```bash
   bash update-deploy.sh
   ```

2. Go to [netlify.com/drop](https://netlify.com/drop) in Chrome
3. Drag the `rcc-deploy/` folder onto the page
4. Netlify gives you a live HTTPS URL immediately

Optionally rename the site in Netlify's UI (e.g. `my-command-centre.netlify.app`).

### Subsequent deploys

1. Make changes to `rcc.html`, `rcc.css`, `rcc.js`
2. Bump the cache version in `sw.js` to force a service worker refresh:
   ```js
   const CACHE = 'rcc-v108'; // increment this each deploy
   ```
3. Run `bash update-deploy.sh`
4. Go to your Netlify site → **Deploys** → drag `rcc-deploy/` onto the deploy area

### Installing as an app

Once on Netlify, open the URL in Chrome and click the install icon in the address bar (or Chrome menu → **Install…**). The installed app has no browser chrome — it looks and behaves like a native app on both Mac and Windows.

---

## Data and backups

All data is stored locally in your browser. Nothing is sent to any server.

**Manual backup:** ⚙ → **↓ Backup data** → saves a `.json` file

**Restore:** ⚙ → **↑ Restore data** → pick the `.json` file

**Auto-backup:** ⚙ → **📂 Auto-backup folder…** → choose a folder → backups are written automatically on every change (requires HTTPS)

The backup format is a single JSON object versioned `v3`. The restore handler accepts v1, v2, and v3.

---

## Self-hosting

RCC is a personal tool but it's entirely self-contained — to run your own copy:

1. Clone the repo
2. Edit `rcc.html`, `rcc.css`, `rcc.js` to your liking
3. Deploy the files to any static host (Netlify, GitHub Pages, Cloudflare Pages, etc.)

The app has no backend and no user accounts. Each browser instance is independent — data does not sync between devices unless you use the manual backup/restore.

---

## Known lessons

A running list of non-obvious bugs and design decisions is maintained in [RCC-CONTEXT.md](RCC-CONTEXT.md) under **Lessons Learned** and **Design Decisions** — useful if you're modifying the codebase.

---

## License

MIT
