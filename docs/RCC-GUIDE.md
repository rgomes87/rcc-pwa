# Rui's Command Centre (RCC) — Complete Guide

A personal work management app that runs in your browser and can be installed like a native app on Mac or Windows. No accounts, no subscriptions, no data leaving your machine.

---

## What's in this folder

```
work-management/
├── rcc.html          — main app file (do your edits here)
├── rcc.css           — all the styling
├── rcc.js            — all the logic
├── manifest.json     — makes it installable as an app
├── sw.js             — service worker (offline support)
├── icon.svg          — app icon
├── rcc-deploy/       — deployment-ready copy (drag this to Netlify)
│   ├── index.html    — copy of rcc.html, renamed
│   ├── rcc.css
│   ├── rcc.js
│   ├── manifest.json
│   ├── sw.js
│   └── icon.svg
├── update-deploy.sh  — script to refresh rcc-deploy/ before deploying
└── backups-bk/       — JSON data backups exported from the app
```

---

## The app at a glance

Four tabs:

| Tab | What it does |
|-----|-------------|
| **Dashboard** | Charts and stats — time by category, weekly completion trend, work log by status, top tasks by time |
| **Todos** | Weekly task list with start/due dates, priorities, recurring tasks, reminders, time tracking, end-of-week review |
| **Documentation** | Work log — one card per project/ticket with type, status, notes, screenshots |
| **Links** | Saved links organised by group |

---

## Setting it up for the first time

### Option A — Run locally (no hosting needed)

Open `rcc.html` directly in Chrome. The app works from a local file, but two features require HTTPS (see Option B):
- Auto-backup to a folder
- Doc download folders

### Option B — Host on Netlify (recommended)

This gives you a real URL, HTTPS, offline support, and the ability to install it as an app.

**First-time deploy:**

1. Go to **netlify.com/drop** in Chrome (no account needed)
2. Drag the entire `rcc-deploy/` folder onto the page
3. Netlify gives you a URL — something like `https://your-name-123.netlify.app`
4. Optionally click "Change site name" to rename it (e.g. `ruis-command-centre.netlify.app`)

That's it. The app is live.

---

## Installing as an app (Mac and Windows)

Once hosted on Netlify:

1. Open the Netlify URL in **Chrome**
2. Look for the install icon in the address bar (a small screen with a down arrow), or go to Chrome menu → **Install Rui's Command Centre…**
3. Click Install

**Mac:** the app appears in your Dock and Launchpad
**Windows:** the app appears in the Start menu and can be pinned to the taskbar — no admin rights required

The installed app has no browser bars — it looks and feels like a native app.

---

## Data and storage

All data is stored locally in your browser — nothing is sent anywhere.

| Data type | Where it's stored |
|-----------|------------------|
| Todos, links, reminders, settings | Browser localStorage |
| Work log (Documentation tab) | Browser IndexedDB |

**Important:** data is per browser, per device. If you use the app on two machines, they do not sync automatically. Use the export/import backup to move data between them.

---

## Backups

### Manual backup (export)

1. Click the **⚙ (wrench)** icon in the top-right corner
2. Click **↓ Backup data**
3. A `.json` file is saved to your Downloads folder
4. Move it somewhere safe (the `backups-bk/` folder in this directory is a good place)

### Restore from backup

1. Click **⚙ → ↑ Restore data**
2. Pick the `.json` backup file
3. Confirm — your data is replaced with the backup

### Auto-backup (recommended)

This automatically saves a JSON backup to a folder of your choice every time the app data changes.

1. Click **⚙ → 📂 Auto-backup folder…**
2. Choose a folder (e.g. `backups-bk/` in this directory, or a cloud-synced folder)
3. Grant permission when the browser asks
4. Done — backups are written automatically from now on

> Note: auto-backup requires HTTPS (i.e. the Netlify-hosted version). It does not work when opening the file directly.

---

## The Documentation tab — Doc download folders

Each work log item can have a type (Halo, Report, SOP, etc.) and you can assign a default download folder per type. When you click the download button on a doc card, the file goes straight to the right folder.

**To set up:**

1. Click **⚙ → 📂 Doc download folders…**
2. A panel opens — click the folder icon next to each type to assign a folder
3. Grant browser permission when prompted
4. From then on, downloads for that type go to the assigned folder automatically

---

## Making changes to the app

All edits happen in the main files (`rcc.html`, `rcc.css`, `rcc.js`) in this folder — **not** in `rcc-deploy/`.

When you're happy with your changes and want to publish them to Netlify:

### Step 1 — Refresh the deploy folder

Run the update script in Terminal:

```bash
bash "/path/to/work-management/update-deploy.sh"
```

Quick way: open Terminal, drag `update-deploy.sh` from Finder into the Terminal window (it fills in the path automatically), then press Enter.

You'll see: `✓ Deploy folder updated — ready to drag to Netlify`

### Step 2 — Deploy to Netlify

1. Go to your Netlify site (log in if needed, or go to `app.netlify.com`)
2. Go to **Deploys** → drag the `rcc-deploy/` folder onto the deploy area
3. New version is live in about 30 seconds

---

## Updating after a cache bump

If you change `rcc.js` or `rcc.css` significantly and want users to get the new version immediately, bump the cache version in `sw.js`:

```js
// Change this:
const CACHE = 'rcc-v1';
// To this:
const CACHE = 'rcc-v2';
```

Then run `update-deploy.sh` and redeploy. The old cache is deleted and the new files are fetched.

---

## Themes

Click the **Theme** button in the top-right to switch between available colour themes. The choice is saved automatically.

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Escape` | Close any open modal or panel |

---

## Troubleshooting

**The install button doesn't appear in Chrome**
- Make sure you're on the HTTPS Netlify URL, not a local file
- Check Chrome DevTools → Application → Manifest for any errors

**Data disappeared after restoring**
- Use ⚙ → Restore data with a recent `.json` backup file

**Auto-backup stopped working**
- The browser may have lost permission to the folder. Click ⚙ → Auto-backup folder… and re-select the folder.

**App shows old version after deploy**
- Go to Chrome DevTools → Application → Service Workers → click "Update" or "Skip waiting"
- Or bump the cache version in `sw.js` (see above)

**Changes not showing in the installed app**
- Right-click the app → Reload, or close and reopen it

---

## File summary for sharing

If you want to give someone a copy of this app to run themselves, give them these files:

- `rcc.html`
- `rcc.css`
- `rcc.js`
- `manifest.json`
- `sw.js`
- `icon.svg`

They can open `rcc.html` locally in Chrome, or follow the Netlify deploy steps above to host their own copy. Data is completely separate — nothing shared.
