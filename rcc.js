const DB_KEY = 'work_todo_v1';
const THEME_KEY = 'work_todo_theme';

const OUTLOOK_CATS = [
  { label: 'Admin / Low-Effort Tasks / Catch-up',    cls: 'cat-yellow'  },
  { label: 'Deep Work / Reporting / Development',    cls: 'cat-purple'  },
  { label: 'Epic Tasks',                             cls: 'cat-darkred' },
  { label: 'High-Priority / Deadlines',              cls: 'cat-red'     },
  { label: 'Learning / Study / CPD',                 cls: 'cat-orange'  },
  { label: 'Notes',                                  cls: 'cat-pink'    },
  { label: 'OOO / Protected Time',                   cls: 'cat-gray'    },
  { label: 'Requirements / Build Collaboration',     cls: 'cat-green'   },
  { label: 'Stakeholder Meetings',                   cls: 'cat-blue'    },
  { label: 'Thinking / Planning / Review / QA',      cls: 'cat-brown'   },
];

const THEME_IDS = ['eleven','documentise','documentise-dark'];
const THEMES_CATALOG = [
  { id: 'eleven',           label: 'Eleven',      bg: '#fdfcfc', accent: '#f36f1c' },
  { id: 'documentise',      label: 'Docs Light',  bg: '#ffffff', accent: '#883aee' },
  { id: 'documentise-dark', label: 'Docs Dark',   bg: '#111111', accent: '#9d55f5' },
];

function applyTheme(name) {
  const html = document.documentElement;
  html.classList.remove('dark', ...THEME_IDS.filter(t => t !== 'light').map(t => 'theme-' + t));
  if (name !== 'light') html.classList.add('theme-' + name);
  localStorage.setItem(THEME_KEY, name);
  updateThemePickerUI(name);
}

function updateThemePickerUI(name) {
  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === name);
  });
  const t = THEMES_CATALOG.find(x => x.id === name) || THEMES_CATALOG[0];
  const swatch = document.getElementById('themePickerSwatch');
  const label = document.getElementById('themePickerLabel');
  if (swatch) swatch.style.background = t.accent;
  if (label) label.textContent = t.label;
}

function buildThemePicker() {
  const picker = document.getElementById('themePicker');
  if (!picker) return;
  picker.innerHTML = '';
  THEMES_CATALOG.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'theme-opt';
    btn.dataset.theme = t.id;
    btn.innerHTML = `<span class="theme-swatch" style="background:${t.bg}"><span class="theme-swatch-dot" style="background:${t.accent}"></span></span>${t.label}`;
    btn.addEventListener('click', () => {
      applyTheme(t.id);
      picker.classList.remove('open');
    });
    picker.appendChild(btn);
  });
}


// Load saved theme preference on startup
const savedTheme = localStorage.getItem(THEME_KEY);
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
// Migrate old theme IDs → new ones
const LEGACY_THEME_MAP = { mono: 'documentise-dark', neon: 'documentise-dark', pastel: 'documentise', jewel: 'documentise-dark', vibrant: 'documentise', warm: 'eleven', light: 'documentise', dark: 'documentise-dark', 'light-warm': 'eleven', 'dark-warm': 'documentise-dark', 'grey-dark': 'documentise-dark', 'black-gold': 'documentise-dark', sleek: 'documentise-dark', inverted: 'documentise-dark' };
const migratedTheme = LEGACY_THEME_MAP[savedTheme] || savedTheme;
const initialTheme = THEME_IDS.includes(migratedTheme) ? migratedTheme : (prefersDark ? 'documentise-dark' : 'documentise');

buildThemePicker();
applyTheme(initialTheme);

document.getElementById('themePickerBtn').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('themePicker').classList.toggle('open');
  document.getElementById('wrenchMenu').classList.remove('open');
});
document.getElementById('wrenchBtn').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('wrenchMenu').classList.toggle('open');
  document.getElementById('themePicker').classList.remove('open');
});
document.getElementById('wrenchMenu').addEventListener('click', e => e.stopPropagation());
document.addEventListener('click', () => {
  const p = document.getElementById('themePicker');
  if (p) p.classList.remove('open');
  const w = document.getElementById('wrenchMenu');
  if (w) w.classList.remove('open');
});

document.getElementById('modalBackdrop')?.addEventListener('click', () => {
  const modals = [...document.querySelectorAll('.wl-float-modal.open')];
  if (modals.length) closeWLModal(modals[modals.length - 1]);
});

let _confirmCallback = null;

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (isError ? ' error' : '') + ' visible';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('visible'), 2800);
}

function showConfirm(msg, onOk, variant = '') {
  document.getElementById('confirmMsg').textContent = msg;
  const box = document.querySelector('#confirmModal .confirm-box');
  box.classList.remove('warn', 'danger');
  if (variant) box.classList.add(variant);
  document.getElementById('confirmModal').classList.add('open');
  _confirmCallback = onOk;
}

document.getElementById('confirmOk').addEventListener('click', () => {
  document.getElementById('confirmModal').classList.remove('open');
  if (_confirmCallback) { const cb = _confirmCallback; _confirmCallback = null; cb(); }
});

document.getElementById('confirmCancel').addEventListener('click', () => {
  document.getElementById('confirmModal').classList.remove('open');
  _confirmCallback = null;
});

// ── Escape key: close modals in priority order ───────────────────────────
document.addEventListener('keydown', e => {
  const mod = e.ctrlKey || e.metaKey;

  // ── Escape: close modals ─────────────────────────────────────────
  if (e.key === 'Escape') {
    const cmdkOverlay = document.getElementById('cmdkOverlay');
    if (cmdkOverlay && !cmdkOverlay.classList.contains('hidden')) { closeCmdK(); return; }
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal.classList.contains('open')) { document.getElementById('confirmCancel').click(); return; }
    const wlModals = document.querySelectorAll('.wl-float-modal.open');
    if (wlModals.length) { const top = wlModals[wlModals.length - 1]; top.querySelector('.wl-close-btn')?.click(); return; }
    const timeReportModal = document.getElementById('timeReportModal');
    if (timeReportModal && timeReportModal.classList.contains('open')) { document.getElementById('timeReportCloseBtn')?.click(); return; }
    return;
  }

  // ── Cmd/Ctrl+K: global search palette (fires from anywhere) ──────
  if (mod && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    toggleCmdK();
    return;
  }

  // Ignore shortcuts when typing in an input/textarea/select or inside a modal
  if (!mod) return;
  if (e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (document.querySelector('.wl-float-modal.open')) return;

  const tab = localStorage.getItem('rcc_active_tab') || 'Dashboard';

  // ── Cmd/Ctrl+Space: add new (context-sensitive) ──────────────────
  if (e.code === 'Space') {
    e.preventDefault();
    if (tab === 'Todos')    document.getElementById('addTaskOpenBtn')?.click();
    if (tab === 'Worklog')    document.getElementById('wlNewItemBtn')?.click();
    if (tab === 'References') document.getElementById('linksAddBtn')?.click();
    return;
  }

  // ── Cmd/Ctrl+R: add new reminder (Todos page only) ───────────────
  if (e.key === 'r' || e.key === 'R') {
    if (tab !== 'Todos') return;
    e.preventDefault();
    document.getElementById('addReminderOpenBtn')?.click();
    return;
  }
});

// Returns YYYY-MM-DD in the user's LOCAL calendar — safe in any UTC offset.
function localDateStr(d = new Date()) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-');
}

function getMonday(d) {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  dt.setDate(diff);
  dt.setHours(0,0,0,0);
  return dt;
}

function weekKey(d) {
  const m = getMonday(d);
  return localDateStr(m);
}

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function fmtDueDate(iso) {
  if (!iso) return '';
  const now = new Date();
  const today = localDateStr(now);
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  if (iso === today) return 'Today';
  if (iso === localDateStr(tomorrow)) return 'Tomorrow';
  const d = new Date(iso + 'T12:00:00');
  const diffDays = Math.round((d - now) / 86400000);
  if (diffDays > 0 && diffDays < 7) return d.toLocaleDateString('en-GB', { weekday: 'short' });
  const sameYear = d.getFullYear() === now.getFullYear();
  return sameYear
    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

function fmtWeekLabel(key) {
  const s = new Date(key + 'T12:00:00');
  const e = new Date(s); e.setDate(e.getDate() + 6);  // Mon–Sun
  const opts = { day: 'numeric', month: 'short' };
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}`;
}

function getWeekNum(key) {
  const d = new Date(key + 'T12:00:00');
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));   // shift to Thursday (ISO 8601 anchor)
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function loadDB() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || { weeks: {}, currentWeek: weekKey(new Date()) }; }
  catch { return { weeks: {}, currentWeek: weekKey(new Date()) }; }
}

function saveDB(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
  catch (e) {
    const msg = e.name === 'QuotaExceededError'
      ? 'Storage full — tasks not saved. Export a backup to free space.'
      : 'Failed to save tasks: ' + e.message;
    showToast(msg, true);
  }
}

function getWeek(db, key) {
  if (!db.weeks[key]) db.weeks[key] = { tasks: [], notes: '', reviewShipped: '', reviewBlockers: '' };
  return db.weeks[key];
}

let db = loadDB();
let currentKey = db.currentWeek || weekKey(new Date());

// Debounced render for high-frequency UI events (e.g. search keystrokes)
let _renderPending = false;
function scheduleRender() {
  if (_renderPending) return;
  _renderPending = true;
  requestAnimationFrame(() => { _renderPending = false; render(); });
}

function render() {
  db.currentWeek = currentKey;
  saveDB(db);

  const week = getWeek(db, currentKey);
  document.getElementById('weekLabel').textContent = fmtWeekLabel(currentKey);

  document.getElementById('newCount').textContent = week.tasks.filter(t => !t.done).length;

  // Task urgency badges on This Week header
  const activeAll = week.tasks.filter(t => !t.done);
  const taskDueCount  = activeAll.filter(t => { const c = getDueClass(t); return c === 'overdue' || c === 'due-critical'; }).length;
  const taskSoonCount = activeAll.filter(t => getDueClass(t) === 'due-soon').length;
  const taskDotDue  = document.getElementById('taskDotDue');
  const taskDotSoon = document.getElementById('taskDotSoon');
  if (taskDotDue)  { taskDotDue.style.display  = taskDueCount  ? 'inline-flex' : 'none'; taskDotDue.textContent  = taskDueCount; }
  if (taskDotSoon) { taskDotSoon.style.display = taskSoonCount ? 'inline-flex' : 'none'; taskDotSoon.textContent = taskSoonCount; }

  const open = week.tasks.filter(t => !t.done).length;
  const done = week.tasks.filter(t => t.done).length;

  document.getElementById('statOpen').textContent = open;
  document.getElementById('statDone').textContent = done;
  document.getElementById('statCarried').textContent = week.tasks.filter(t => t.carried).length;

  // Week nav task counts
  const prevDate = new Date(currentKey + 'T00:00:00'); prevDate.setDate(prevDate.getDate() - 7);
  const prevKey = weekKey(prevDate);
  const nextDate = new Date(currentKey + 'T00:00:00'); nextDate.setDate(nextDate.getDate() + 7);
  const nextKey2 = weekKey(nextDate);
  const prevOpen = db.weeks[prevKey] ? db.weeks[prevKey].tasks.filter(t => !t.done).length : 0;
  const nextOpen = db.weeks[nextKey2] ? db.weeks[nextKey2].tasks.filter(t => !t.done).length : 0;
  const prevEl = document.getElementById('prevWeekCount');
  const nextEl = document.getElementById('nextWeekCount');
  if (prevEl) { prevEl.textContent = prevOpen || ''; prevEl.className = 'week-task-count' + (prevOpen ? ' has-tasks' : ''); }
  if (nextEl) { nextEl.textContent = nextOpen || ''; nextEl.className = 'week-task-count' + (nextOpen ? ' has-tasks' : ''); }

  // Stale-week banner — shown when viewing a past week
  const todayKey = weekKey(new Date());
  const staleBanner = document.getElementById('weekStaleBanner');
  const staleBannerMsg = document.getElementById('weekStaleBannerMsg');
  if (staleBanner) {
    if (todayKey > currentKey) {
      const weeksBack = Math.round(
        (new Date(todayKey + 'T12:00:00') - new Date(currentKey + 'T12:00:00'))
        / (7 * 24 * 60 * 60 * 1000)
      );
      staleBannerMsg.textContent =
        `Week of ${fmtWeekLabel(currentKey)} — you're ${weeksBack} week${weeksBack !== 1 ? 's' : ''} behind.`;
      staleBanner.classList.add('visible');
    } else {
      staleBanner.classList.remove('visible');
    }
  }

  // Overdue rollup — check previous week for unclosed tasks
  const prevWeekTasks = db.weeks[prevKey] ? db.weeks[prevKey].tasks.filter(t => !t.done) : [];
  const overdueUnclosed = prevWeekTasks.filter(t => !week.tasks.find(w => (w.sourceId || w.id) === (t.sourceId || t.id)));
  const rollup = document.getElementById('overdueRollup');
  const rollupMsg = document.getElementById('overdueRollupMsg');
  if (overdueUnclosed.length > 0) {
    rollupMsg.textContent = `${overdueUnclosed.length} unclosed task(s) from last week not yet carried over.`;
    rollup.classList.add('visible');
  } else {
    rollup.classList.remove('visible');
  }

  renderList('newList', showDoneTasks ? week.tasks : week.tasks.filter(t => !t.done), null);

  const toggleTaskBtn = document.getElementById('toggleDoneTasks');
  if (toggleTaskBtn) {
    const doneTaskCount = week.tasks.filter(t => t.done).length;
    toggleTaskBtn.style.display = doneTaskCount ? '' : 'none';
    toggleTaskBtn.classList.toggle('active', showDoneTasks);
    toggleTaskBtn.title = showDoneTasks ? 'Hide completed' : 'Show completed';
  }
  renderTodaySection();

}

function applyFilterSort(tasks) {
  const priority = document.getElementById('filterPriority').value;
  const sort = document.getElementById('sortBy').value;
  const search = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const today = localDateStr();

  let result = priority ? tasks.filter(t => t.priority === priority) : [...tasks];
  if (showTodayFilter) result = result.filter(t => !t.done && t.due && t.due <= today);
  if (search) result = result.filter(t =>
    t.name.toLowerCase().includes(search) ||
    (t.notes && t.notes.toLowerCase().includes(search)) ||
    (t.category && t.category.toLowerCase().includes(search))
  );

  const priorityOrder = { High: 0, Med: 1, Low: 2 };
  if (sort === 'priority') {
    result.sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));
  } else if (sort === 'due') {
    result.sort((a, b) => {
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    });
  } else if (sort === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  return result;
}

function getDueClass(task) {
  if (task.done || !task.due) return '';
  const today = localDateStr();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = localDateStr(tomorrow);
  const twoDays = new Date(); twoDays.setDate(twoDays.getDate() + 2);
  const twoDaysStr = localDateStr(twoDays);
  if (task.due < today) return 'overdue';           // past due — neon red
  if (task.due <= tomorrowStr) return 'due-critical'; // 1 day — red-orange
  if (task.due <= twoDaysStr) return 'due-soon';      // 2 days — orange
  return '';
}

// ── Time tracker helpers ─────────────────────────────────────────
function fmtDuration(secs) {
  if (!secs || secs < 1) return '< 1m';
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}
function getTotalSecs(item) {
  return (item.timeLogs || []).reduce((s, l) => s + (l.duration || 0), 0);
}
function fmtLogTs(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) + ' ' +
    d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}
function buildTimeLogHtml(item) {
  const logs = item.timeLogs || [];
  const total = getTotalSecs(item);
  if (logs.length === 0 && !item.timerStart) return '';
  const rows = logs.map((l, i) => `
    <div class="time-log-entry">
      <span>${fmtLogTs(l.start)}</span><span>→</span><span>${fmtLogTs(l.end)}</span>
      <span class="time-log-dur">${fmtDuration(l.duration)}</span>
      <span class="time-log-del" data-logidx="${i}" title="Delete entry">&#x2715;</span>
    </div>`).join('');
  const runningRow = item.timerStart ? `
    <div class="time-log-entry time-log-running">
      <span>${fmtLogTs(item.timerStart)}</span><span>→</span><span>running…</span>
    </div>` : '';
  const totalRow = total > 0 ? `<div class="time-log-total">Total: ${fmtDuration(total)}</div>` : '';
  return `<div class="time-log">${rows}${runningRow}${totalRow}</div>`;
}

// ── Shared timer helpers ──────────────────────────────────────────
function timerToggle(item, itemName, saveFn, renderFn) {
  if (item.timerStart) {
    const duration = Math.round((new Date() - new Date(item.timerStart)) / 1000);
    if (!item.timeLogs) item.timeLogs = [];
    item.timeLogs.push({ start: item.timerStart, end: new Date().toISOString(), duration });
    item.timerStart = null;
    showToast(`Logged ${fmtDuration(duration)} on "${itemName}".`);
  } else {
    item.timerStart = new Date().toISOString();
    showToast('Timer started.');
  }
  saveFn(); renderFn();
}
function timerDeleteLog(item, idx, saveFn, renderFn) {
  if (!item || !item.timeLogs) return;
  item.timeLogs.splice(idx, 1);
  saveFn(); renderFn();
}

function taskTimerToggle(taskId) {
  const task = getWeek(db, currentKey).tasks.find(t => t.id === taskId);
  if (task) timerToggle(task, task.name, () => saveDB(db), render);
}
function taskDeleteTimeLog(taskId, idx) {
  timerDeleteLog(getWeek(db, currentKey).tasks.find(t => t.id === taskId), idx, () => saveDB(db), render);
}
function recTimerToggle(recId) {
  const rec = recTasks.find(r => r.id === recId);
  if (rec) timerToggle(rec, rec.name, () => saveRec(recTasks), renderRecPanel);
}
function recDeleteTimeLog(recId, idx) {
  timerDeleteLog(recTasks.find(r => r.id === recId), idx, () => saveRec(recTasks), renderRecPanel);
}
function wlTimerToggle(wlId) {
  const item = wlItems.find(w => w.id === wlId);
  if (item) timerToggle(item, item.title, () => saveWL(wlItems), renderWL);
}
function wlDeleteTimeLog(wlId, idx) {
  timerDeleteLog(wlItems.find(w => w.id === wlId), idx, () => saveWL(wlItems), renderWL);
}

function renderList(listId, tasks, emptyId) {
  const list = document.getElementById(listId);
  list.innerHTML = '';

  const filtered = applyFilterSort(tasks);

  if (emptyId) {
    document.getElementById(emptyId).style.display = tasks.length === 0 ? 'block' : 'none';
  }

  let rankCounter = 0;
  filtered.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task-item' + (task.done ? ' done' : '') + (task.carried ? ' carried' : '') + (task.timerStart ? ' timer-active' : '');

    const dueClass = getDueClass(task);
    const hasNotes = task.notes && task.notes.trim();
    const notesIndicator = hasNotes ? `<span style="font-family:var(--font-mono);font-size:9px;background:var(--border-light);color:var(--text-faint);border-radius:var(--radius-sm);padding:1px 5px;margin-left:6px;">notes</span>` : '';
    const totalSecs = getTotalSecs(task);
    const timerRunning = !!task.timerStart;
    const timeBadge = ((task.timeLogs || []).length > 0 || timerRunning) ? `<span class="time-badge" style="margin-left:4px">⏱ ${timerRunning ? 'running' : fmtDuration(totalSecs)}</span>` : '';
    const timerBtn = `<button class="timer-btn${timerRunning ? ' running' : ''}" data-id="${task.id}" title="${timerRunning ? 'Stop timer' : 'Start timer'}">${timerRunning ? '■ stop' : '▶ start'}</button>`;
    const hasExpand = hasNotes;
    const wlLinked = task.wlLink ? wlItems.find(w => w.id === task.wlLink) : null;
    const wlBadge = wlLinked ? `<span class="wl-type-badge wl-type-${wlLinked.type}" style="font-size:9px;margin-left:4px;cursor:pointer" title="Open: ${escHtml(wlLinked.title)}" data-wlid="${wlLinked.id}">&#128279; ${escHtml(wlLinked.title.slice(0,20))}${wlLinked.title.length>20?'…':''}</span>` : '';
    const catObj = task.category ? OUTLOOK_CATS.find(c => c.label === task.category) : null;
    const catBadge = catObj ? `<span class="cat-badge ${catObj.cls}">${catObj.label}</span>` : '';
    const typeBadge = task.taskType ? `<span class="wl-type-badge wl-type-${task.taskType}">${task.taskType}</span>` : '';
    const rankDisplay = task.done ? `<span class="rank-badge" style="opacity:0.3">—</span>` : `<span class="rank-badge">${++rankCounter}</span>`;

    div.setAttribute('draggable', 'true');
    div.dataset.taskId = task.id;
    div.innerHTML = `
      <span class="drag-handle" title="Drag to reorder">&#8942;</span>
      ${rankDisplay}
      <input type="checkbox" class="task-check" ${task.done ? 'checked' : ''} data-id="${task.id}">
      <span class="task-name" style="cursor:${hasExpand ? 'pointer' : 'default'}">${escHtml(task.name)}${task.carried ? '<span class="carry-flag" title="Carried from a previous week">⚑</span>' : ''}${notesIndicator}${wlBadge}${timeBadge}</span>
      <div class="task-right">
        <span class="task-badges">${catBadge}${typeBadge}</span>
        ${timerBtn}
        <div class="task-right-pin">
          <button class="icon-btn cal-btn" data-id="${task.id}" title="${!task.time || task.time === '00:00' ? 'Add as all-day event to Outlook' : 'Add to Outlook calendar'}"><svg width="13" height="13" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><rect x="1" y="2.5" width="12" height="10.5" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 5.5h12" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 1v3M9.5 1v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="3.5" y="7.5" width="2" height="2" rx="0.4" fill="currentColor"/><rect x="6.5" y="7.5" width="2" height="2" rx="0.4" fill="currentColor"/></svg></button>
          <span class="priority-dot priority-dot-${task.priority}" title="${task.priority}"></span>
          <span class="task-due${dueClass ? ' ' + dueClass : ''}"><span class="date-label due-label">due</span>${fmtDueDate(task.due) || '—'}</span>
          <span class="task-actions">
            <button class="icon-btn edit-btn" data-id="${task.id}" title="Edit task">&#9998;</button>
          </span>
        </div>
      </div>
      ${hasExpand ? `<div class="task-notes-expand">${escHtml(task.notes.trim())}</div>` : ''}`;

    div.querySelector('.task-check').addEventListener('change', e => {
      toggleDone(e.target.dataset.id);
    });
    div.querySelector('.edit-btn').addEventListener('click', e => {
      e.stopPropagation();
      openEditMode(div, task);
    });
    const timerBtnEl = div.querySelector('.timer-btn');
    if (timerBtnEl) timerBtnEl.addEventListener('click', e => {
      e.stopPropagation();
      taskTimerToggle(task.id);
    });
    if (hasExpand) {
      div.querySelector('.task-name').addEventListener('click', () => {
        div.classList.toggle('expanded');
      });
    }
    div.querySelectorAll('.time-log-del').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        taskDeleteTimeLog(task.id, parseInt(btn.dataset.logidx));
      });
    });
    const wlBadgeEl = div.querySelector('[data-wlid]');
    if (wlBadgeEl) {
      wlBadgeEl.addEventListener('click', e => {
        e.stopPropagation();
        // Switch to work log tab and open the item
        document.getElementById('tabWorklog').click();
        setTimeout(() => createWLModal(wlBadgeEl.dataset.wlid), 100);
      });
    }
    const calBtn = div.querySelector('.cal-btn');
    if (calBtn) {
      calBtn.addEventListener('click', e => {
        e.stopPropagation();
        addToCalendar(task);
      });
    }

    // Inline due-date editor — click the due span to edit
    const dueSpan = div.querySelector('.task-due');
    if (dueSpan) {
      dueSpan.addEventListener('click', e => {
        e.stopPropagation();
        if (dueSpan.querySelector('input')) return; // already editing
        const input = document.createElement('input');
        input.type = 'date';
        input.value = task.due || '';
        input.style.cssText = 'font-family:var(--font-mono);font-size:11px;background:var(--surface);border:1px solid var(--accent);border-radius:var(--radius-sm);padding:1px 4px;color:var(--text);width:120px;';
        dueSpan.innerHTML = '';
        dueSpan.appendChild(input);
        input.focus();
        input.showPicker?.();

        function commit() {
          const week = db.weeks[currentKey];
          const t = week && week.tasks.find(x => x.id === task.id);
          if (t) { t.due = input.value || undefined; saveDB(db); render(); }
        }
        input.addEventListener('change', () => { commit(); });
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { render(); }
        });
        input.addEventListener('blur', () => { commit(); });
      });
    }

    list.appendChild(div);
  });
}

function openEditMode(div, task) {
  if (div.classList.contains('editing')) return;
  div.classList.add('editing');
  div.style.display = 'block';
  div.innerHTML = '';

  const editFields = document.createElement('div');
  editFields.className = 'edit-fields';
  editFields.innerHTML = `
    <div class="ef-top-row">
      <input type="text" class="ef-name" value="${escHtml(task.name)}" placeholder="Task name">
      <select class="ef-priority" style="flex-shrink:0">
        <option${task.priority==='High'?' selected':''}>High</option>
        <option${task.priority==='Med'?' selected':''}>Med</option>
        <option${task.priority==='Low'?' selected':''}>Low</option>
      </select>
      <div class="ef-field">
        <span class="ef-label">Start</span>
        <input type="date" class="ef-build" value="${task.build || ''}">
      </div>
      <div class="ef-field">
        <span class="ef-label">Time</span>
        <select class="ef-time">
          <option value="00:00"${(!task.time || task.time==='00:00')?' selected':''}>00:00 (all day)</option>
          <option${task.time==='07:00'?' selected':''}>07:00</option><option${task.time==='07:30'?' selected':''}>07:30</option>
          <option${task.time==='08:00'?' selected':''}>08:00</option><option${task.time==='08:30'?' selected':''}>08:30</option>
          <option${task.time==='09:00'?' selected':''}>09:00</option><option${task.time==='09:30'?' selected':''}>09:30</option>
          <option${task.time==='10:00'?' selected':''}>10:00</option><option${task.time==='10:30'?' selected':''}>10:30</option>
          <option${task.time==='11:00'?' selected':''}>11:00</option><option${task.time==='11:30'?' selected':''}>11:30</option>
          <option${task.time==='12:00'?' selected':''}>12:00</option><option${task.time==='12:30'?' selected':''}>12:30</option>
          <option${task.time==='13:00'?' selected':''}>13:00</option><option${task.time==='13:30'?' selected':''}>13:30</option>
          <option${task.time==='14:00'?' selected':''}>14:00</option><option${task.time==='14:30'?' selected':''}>14:30</option>
          <option${task.time==='15:00'?' selected':''}>15:00</option><option${task.time==='15:30'?' selected':''}>15:30</option>
          <option${task.time==='16:00'?' selected':''}>16:00</option><option${task.time==='16:30'?' selected':''}>16:30</option>
          <option${task.time==='17:00'?' selected':''}>17:00</option><option${task.time==='17:30'?' selected':''}>17:30</option>
          <option${task.time==='18:00'?' selected':''}>18:00</option><option${task.time==='18:30'?' selected':''}>18:30</option>
        </select>
      </div>
      <div class="ef-field">
        <span class="ef-label" style="color:var(--med)">Due</span>
        <input type="date" class="ef-due" value="${task.due || ''}">
      </div>
      <button class="add-confirm-btn ef-save">save</button>
      <button class="icon-btn del ef-delete" title="Delete task">Delete</button>
    </div>
    <div class="ef-row2">
      <div class="ef-field">
        <span class="ef-label">Outlook Category</span>
        <select class="ef-category">
          <option value="">— None —</option>
          ${OUTLOOK_CATS.map(c => `<option value="${c.label}"${task.category===c.label?' selected':''}>${c.label}</option>`).join('')}
        </select>
      </div>
      <div class="ef-field">
        <span class="ef-label">Type</span>
        <select class="ef-tasktype">
          <option value="">— None —</option>
          ${['Halo','Sherlock','Ad-hoc','CMT','Nova','Upgrade','Meetings','Training','SOP','Report','Research','Other'].map(v => `<option value="${v}"${task.taskType===v?' selected':''}>${v}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="ef-field">
      <span class="ef-label">Notes / Next steps / Links</span>
      <textarea class="ef-notes" rows="3" placeholder="Next steps, links, context…">${escHtml(task.notes || '')}</textarea>
    </div>
    <div class="ef-field">
      <span class="ef-label">Linked Documentation</span>
      <select class="ef-wllink">
        <option value="">— None —</option>
        ${wlItems.map(w => `<option value="${w.id}"${task.wlLink===w.id?' selected':''}>[${w.type}] ${escHtml(w.title)}</option>`).join('')}
      </select>
    </div>`;

  div.appendChild(editFields);

  editFields.querySelector('.ef-save').addEventListener('click', e => {
    e.stopPropagation();
    const newName = editFields.querySelector('.ef-name').value.trim();
    if (!newName) return;
    const week = getWeek(db, currentKey);
    const t = week.tasks.find(t => t.id === task.id);
    if (t) {
      t.name = newName;
      t.priority = editFields.querySelector('.ef-priority').value;
      t.build = editFields.querySelector('.ef-build').value;
      t.time = editFields.querySelector('.ef-time').value;
      t.due = editFields.querySelector('.ef-due').value;
      t.category = editFields.querySelector('.ef-category').value;
      t.notes = editFields.querySelector('.ef-notes').value;
      t.taskType = editFields.querySelector('.ef-tasktype').value;
      const oldWlLink = t.wlLink;
      const newWlLink = editFields.querySelector('.ef-wllink').value;
      t.wlLink = newWlLink;
      if (oldWlLink !== newWlLink) {
        // Remove from old WL item's linkedItems
        if (oldWlLink) {
          const oldWl = wlItems.find(w => w.id === oldWlLink);
          if (oldWl) {
            oldWl.linkedItems = (oldWl.linkedItems || []).filter(l => !(l.type === 'task' && l.id === t.id));
            saveWL(wlItems);
          }
        }
        // Add to new WL item's linkedItems
        if (newWlLink) {
          const newWl = wlItems.find(w => w.id === newWlLink);
          if (newWl) {
            if (!newWl.linkedItems) newWl.linkedItems = [];
            if (!newWl.linkedItems.find(l => l.type === 'task' && l.id === t.id)) {
              newWl.linkedItems.push({ type: 'task', id: t.id, weekKey: currentKey, label: t.name });
              saveWL(wlItems);
            }
          }
        }
      }
    }
    saveDB(db);
    render();
  });

  editFields.querySelector('.ef-delete').addEventListener('click', e => {
    e.stopPropagation();
    showConfirm(`Delete "${task.name}"?`, () => deleteTask(task.id));
  });

  editFields.querySelector('.ef-name').focus();
  editFields.querySelector('.ef-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') editFields.querySelector('.ef-save').click();
    if (e.key === 'Escape') render();
  });
}

function addToCalendar(task, rrule) {
  function pad(n) { return String(n).padStart(2, '0'); }

  const buildDate = task.build || localDateStr();
  const isAllDay = !task.time || task.time === '00:00';
  let dtStartLine, dtEndLine;

  if (isAllDay) {
    const dateStr = buildDate.replace(/-/g, '');
    const nextDay = new Date(buildDate + 'T00:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const nextStr = `${nextDay.getFullYear()}${pad(nextDay.getMonth()+1)}${pad(nextDay.getDate())}`;
    dtStartLine = `DTSTART;VALUE=DATE:${dateStr}`;
    dtEndLine = `DTEND;VALUE=DATE:${nextStr}`;
  } else {
    const [hh, mm] = task.time.split(':').map(Number);
    const startDt = `${buildDate.replace(/-/g,'')}T${pad(hh)}${pad(mm)}00`;
    const endHh = hh + 1 >= 24 ? 23 : hh + 1;
    const endDt = `${buildDate.replace(/-/g,'')}T${pad(endHh)}${pad(mm)}00`;
    dtStartLine = `DTSTART:${startDt}`;
    dtEndLine = `DTEND:${endDt}`;
  }

  const stamp = new Date().toISOString().replace(/[-:]/g,'').slice(0,15) + 'Z';
  const uid = `worktodo-${task.id || Date.now()}@local`;

  const descParts = [];
  descParts.push(`Priority: ${task.priority}`);
  if (task.due) descParts.push(`Due: ${fmtDate(task.due)}`);
  if (rrule) descParts.push(`Recurrence: ${task.recLabel || rrule}`);
  if (task.notes && task.notes.trim()) {
    descParts.push('');
    descParts.push('Notes / Next steps:');
    descParts.push(task.notes.trim());
  }

  function icsEscape(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  const description = icsEscape(descParts.join('\n'));

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rui Command Centre//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    dtStartLine,
    dtEndLine,
    `SUMMARY:${icsEscape(task.name)}`,
    `DESCRIPTION:${description}`,
    'CATEGORIES:' + (task.category || 'Deep Work / Reporting / Development'),
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
  ];

  if (rrule) lines.push(`RRULE:${rrule}`);

  lines.push('END:VEVENT', 'END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${task.name.slice(0,40).replace(/[^a-z0-9]/gi,'-')}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Calendar file downloaded — open to add to Outlook.');
}

let showTodayFilter = false;

function renderTodaySection() {
  // Today filter is now applied inline via applyFilterSort — nothing to render separately
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function toggleDone(id) {
  const week = getWeek(db, currentKey);
  const t = week.tasks.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  // If just marked done, move to end of its group (carried vs fresh)
  if (t.done) {
    week.tasks = week.tasks.filter(t => t.id !== id);
    week.tasks.push(t);
  }
  saveDB(db);
  render();
}

function deleteTask(id) {
  const week = getWeek(db, currentKey);
  week.tasks = week.tasks.filter(t => t.id !== id);
  saveDB(db);
  render();
}

function addTask() {
  const name = document.getElementById('newTaskName').value.trim();
  if (!name) return;
  const priority = document.getElementById('newTaskPriority').value;
  const today = localDateStr();
  const build = document.getElementById('newTaskBuild').value || today;
  const due = document.getElementById('newTaskDue').value;
  const time = document.getElementById('newTaskTime').value;
  const week = getWeek(db, currentKey);
  week.tasks.push({ id: crypto.randomUUID(), name, priority, build, due, time, done: false, carried: false });
  saveDB(db);
  if (window._closeTaskRow) window._closeTaskRow();
  render();
}

// Single canonical carry-over. Does NOT call saveDB() — callers are responsible.
// Returns count of tasks actually appended (after sourceId dedup).
function executeCarryOver(fromKey, toKey) {
  const sourceTasks = (db.weeks[fromKey]?.tasks || []).filter(t => !t.done);
  if (!db.weeks[toKey]) db.weeks[toKey] = { tasks: [], notes: '', reviewShipped: '', reviewBlockers: '' };
  const target = db.weeks[toKey];
  const existingIds = new Set(target.tasks.map(t => t.sourceId || t.id));
  const toCarry = sourceTasks.filter(t => !existingIds.has(t.sourceId || t.id));
  const newTasks = toCarry.map(t => ({
    ...t, carried: true, done: false,
    id: crypto.randomUUID(),
    sourceId: t.sourceId || t.id
  }));
  target.tasks = [...target.tasks, ...newTasks];
  return newTasks.length;
}

// Chain carry-over: walks week by week from startKey to targetKey
function chainCarryOver(startKey, targetKey) {
  let cursor = startKey;
  let totalCarried = 0;

  while (cursor < targetKey) {                          // < not !== prevents infinite loop
    const d = new Date(cursor + 'T12:00:00');
    d.setDate(d.getDate() + 7);
    const nextKey = localDateStr(d);
    if (nextKey > targetKey) break;                     // safety guard

    totalCarried += executeCarryOver(cursor, nextKey);
    injectRecurringIntoWeek(nextKey);
    cursor = nextKey;
  }

  saveDB(db);
  return totalCarried;
}

function jumpToWeek() {
  const val = document.getElementById('jumpDateInput').value;
  if (!val) { showToast('Pick a date first.', true); return; }

  const targetKey = weekKey(new Date(val + 'T00:00:00'));

  if (targetKey === currentKey) {
    document.getElementById('jumpModal').classList.remove('open');
    showToast('Already on that week.');
    return;
  }

  // If jumping backwards, just navigate — no carry-over needed
  if (targetKey < currentKey) {
    document.getElementById('jumpModal').classList.remove('open');
    currentKey = targetKey;
    render();
    showToast('Jumped to ' + fmtWeekLabel(targetKey));
    return;
  }

  // Jumping forward — chain carry-over through all weeks in between
  document.getElementById('jumpModal').classList.remove('open');
  const carried = chainCarryOver(currentKey, targetKey);
  currentKey = targetKey;
  render();
  showToast(`Jumped to ${fmtWeekLabel(targetKey)} — ${carried} task(s) carried forward.`);
}

function createNewWeek() {
  const nextDate = new Date(currentKey + 'T12:00:00');
  nextDate.setDate(nextDate.getDate() + 7);
  const nextKey = localDateStr(nextDate);

  if (db.weeks[nextKey]) {
    // Week already exists — compute what would be new before asking
    const sourceTasks = (db.weeks[currentKey]?.tasks || []).filter(t => !t.done);
    const existingIds = new Set(db.weeks[nextKey].tasks.map(t => t.sourceId || t.id));
    const wouldCarry = sourceTasks.filter(t => !existingIds.has(t.sourceId || t.id)).length;

    if (wouldCarry > 0) {
      showConfirm(
        `Week of ${fmtWeekLabel(nextKey)} already exists. Add ${wouldCarry} incomplete task(s) from this week into it?`,
        () => {
          const carried = executeCarryOver(currentKey, nextKey);
          saveDB(db);
          currentKey = nextKey;
          render();
          showToast(`Switched — ${carried} task(s) carried over.`);
        }
      );
    } else {
      currentKey = nextKey;
      render();
      showToast('Switched to next week — nothing new to carry over.');
    }
    return;
  }

  // New week: carry over, inject recurring, purge done reminders
  const carried = executeCarryOver(currentKey, nextKey);
  injectRecurringIntoWeek(nextKey);

  const purgedCount = reminders.filter(r => r.done).length;
  reminders = reminders.filter(r => !r.done);
  if (purgedCount > 0) { saveReminders(reminders); renderReminders(); }

  saveDB(db);
  currentKey = nextKey;
  render();
  showToast(carried > 0
    ? `New week created — ${carried} task(s) carried over.`
    : 'New week created.');
}

function buildMarkdown() {
  const week = getWeek(db, currentKey);
  const wn = getWeekNum(currentKey);
  const year = currentKey.slice(0,4);
  const lines = [];

  lines.push(`# Rui's Command Centre — ${fmtWeekLabel(currentKey)}`);
  lines.push('');
  lines.push(`> W${wn} ${year}`);
  lines.push('');

  const carried = week.tasks.filter(t => t.carried);
  const fresh = week.tasks.filter(t => !t.carried);

  if (carried.length) {
    lines.push('## Carried over');
    lines.push('');
    lines.push('| Task | Priority | Start | Due | Done |');
    lines.push('|------|----------|-------|-----|------|');
    carried.forEach(t => lines.push(`| ${t.name} | ${t.priority} | ${fmtDate(t.build) || '—'} | ${fmtDate(t.due) || '—'} | ${t.done ? '[x]' : '[ ]'} |`));
    lines.push('');
  }

  lines.push('## This week');
  lines.push('');
  lines.push('| Task | Priority | Start | Due | Done |');
  lines.push('|------|----------|-------|-----|------|');
  if (fresh.length) fresh.forEach(t => lines.push(`| ${t.name} | ${t.priority} | ${fmtDate(t.build) || '—'} | ${fmtDate(t.due) || '—'} | ${t.done ? '[x]' : '[ ]'} |`));
  else lines.push('| — | — | — | — | — |');
  lines.push('');

  if (week.notes) {
    lines.push('## Notes');
    lines.push('');
    lines.push(week.notes);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('**End of week review**');
  lines.push('');
  lines.push(`- What shipped: ${week.reviewShipped || ''}`);
  lines.push(`- Blockers: ${week.reviewBlockers || ''}`);

  return lines.join('\n');
}

document.getElementById('addTaskBtn').addEventListener('click', addTask);
document.getElementById('newTaskName').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
(function() {
  const prioSel = document.getElementById('newTaskPriority');
  function syncPrioColor() { prioSel.className = 'add-prio-' + prioSel.value; }
  prioSel.addEventListener('change', syncPrioColor);

  const openBtn = document.getElementById('addTaskOpenBtn');
  const row = document.getElementById('addRow');
  const closeBtn = document.getElementById('addTaskCloseBtn');

  function openTaskRow() {
    row.style.display = '';
    document.getElementById('newTaskBuild').value = localDateStr();
    document.getElementById('newTaskDue').value = '';
    document.getElementById('newTaskTime').value = '00:00';
    requestAnimationFrame(() => document.getElementById('newTaskName').focus());
  }
  function closeTaskRow() {
    row.style.display = 'none';
    document.getElementById('newTaskName').value = '';
  }
  window._closeTaskRow = closeTaskRow;

  openBtn.addEventListener('click', e => { e.stopPropagation(); openTaskRow(); });
  closeBtn.addEventListener('click', closeTaskRow);
  row.addEventListener('keydown', e => { if (e.key === 'Escape') closeTaskRow(); });
})();

document.getElementById('toggleDoneTasks').addEventListener('click', e => {
  e.stopPropagation();
  showDoneTasks = !showDoneTasks;
  localStorage.setItem('rcc_show_done_tasks', showDoneTasks ? '1' : '0');
  render();
});

document.getElementById('prevWeek').addEventListener('click', () => {
  const d = new Date(currentKey + 'T12:00:00');
  d.setDate(d.getDate() - 7);
  currentKey = localDateStr(d);
  render();
});

document.getElementById('nextWeek').addEventListener('click', () => {
  const d = new Date(currentKey + 'T12:00:00');
  d.setDate(d.getDate() + 7);
  currentKey = localDateStr(d);
  render();
});

document.getElementById('todayFilterBtn').addEventListener('click', () => {
  showTodayFilter = !showTodayFilter;
  document.getElementById('todayFilterBtn').classList.toggle('active', showTodayFilter);
  render();
});

document.getElementById('todayBtn').addEventListener('click', () => {
  currentKey = weekKey(new Date());
  render();
  showToast('Jumped to current week.');
});

document.getElementById('weekStaleBannerBtn').addEventListener('click', () => {
  currentKey = weekKey(new Date());
  render();
  showToast('Jumped to current week.');
});

document.getElementById('sortBy').addEventListener('change', () => { render(); renderReminders(); });
document.getElementById('filterPriority').addEventListener('change', () => { render(); renderReminders(); });

// Search
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
searchInput.addEventListener('input', () => {
  searchClear.classList.toggle('visible', searchInput.value.length > 0);
  scheduleRender();
  renderReminders();
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.classList.remove('visible');
  render();
  renderReminders();
});

// Overdue carry button
document.getElementById('overdueCarryBtn').addEventListener('click', () => {
  const prevDate = new Date(currentKey + 'T00:00:00'); prevDate.setDate(prevDate.getDate() - 7);
  const prevKey = weekKey(prevDate);
  const week = getWeek(db, currentKey);
  const prevTasks = db.weeks[prevKey] ? db.weeks[prevKey].tasks.filter(t => !t.done) : [];
  const existingSourceIds = new Set(week.tasks.map(t => t.sourceId || t.id));
  const toCarry = prevTasks.filter(t => !existingSourceIds.has(t.sourceId || t.id));
  const newCarry = toCarry.map(t => ({
    ...t, carried: true, done: false,
    id: crypto.randomUUID(),
    sourceId: t.sourceId || t.id
  }));
  week.tasks = [...week.tasks, ...newCarry];
  saveDB(db);
  render();
  showToast(`${newCarry.length} task(s) carried over.`);
});

// Drag to reorder
let dragSrcId = null;
function setupDrag(listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.addEventListener('dragstart', e => {
    const item = e.target.closest('.task-item');
    if (!item) return;
    dragSrcId = item.dataset.taskId;
    setTimeout(() => item.classList.add('dragging'), 0);
  });
  list.addEventListener('dragend', e => {
    const item = e.target.closest('.task-item');
    if (item) item.classList.remove('dragging');
    list.querySelectorAll('.task-item').forEach(i => i.classList.remove('drag-over'));
  });
  list.addEventListener('dragover', e => {
    e.preventDefault();
    const item = e.target.closest('.task-item');
    if (!item || item.dataset.taskId === dragSrcId) return;
    list.querySelectorAll('.task-item').forEach(i => i.classList.remove('drag-over'));
    item.classList.add('drag-over');
  });
  list.addEventListener('drop', e => {
    e.preventDefault();
    const target = e.target.closest('.task-item');
    if (!target || !dragSrcId || target.dataset.taskId === dragSrcId) return;
    target.classList.remove('drag-over');
    const week = getWeek(db, currentKey);
    const tasks = week.tasks;
    const srcIdx = tasks.findIndex(t => t.id === dragSrcId);
    const tgtIdx = tasks.findIndex(t => t.id === target.dataset.taskId);
    if (srcIdx === -1 || tgtIdx === -1) return;
    const [moved] = tasks.splice(srcIdx, 1);
    tasks.splice(tgtIdx, 0, moved);
    saveDB(db);
    render();
  });
}
setupDrag('carriedList');
setupDrag('newList');

document.getElementById('newWeekBtn').addEventListener('click', createNewWeek);


document.getElementById('clearAllBtn').addEventListener('click', () => {
  showConfirm('This will permanently delete ALL data — todos, recurring tasks, work log items, and links. Make sure you have a backup first. Continue?', () => {
    showConfirm('Are you absolutely sure? This cannot be undone.', async () => {
      localStorage.removeItem(DB_KEY);
      localStorage.removeItem(REC_KEY);
      localStorage.removeItem(REM_KEY);
      localStorage.removeItem(LINKS_KEY);
      localStorage.removeItem(LINKS_LAYOUT_KEY);
      db = { weeks: {}, currentWeek: weekKey(new Date()) };
      currentKey = db.currentWeek;
      saveDB(db);
      recTasks = []; saveRec(recTasks); renderRecPanel();
      wlItems = []; await saveWL(wlItems); renderWL();
      reminders = []; saveReminders(reminders); renderReminders();
      linkItems = []; saveLinks(linkItems);
      linkColWidths = {}; saveLinksLayout(linkColWidths);
      guideItems = []; await saveGuides(guideItems);
      contactItems = []; saveContacts(contactItems);
      dbAccessItems  = []; saveDbAccess(dbAccessItems);
      renderLinks();
      render();
      showToast('All data cleared.');
      setTimeout(() => location.reload(), 250);
    }, 'danger');
  }, 'warn');
});



document.getElementById('backupBtn').addEventListener('click', () => {
  const timestamp = localDateStr();
  const backup = buildBackupPayload();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `rcc-backup-${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Full backup saved — todos, recurring, worklog, reminders, links, snippets, guides & contacts.');
  writeAutoBackup(true); // also write to configured folder if set
});

// ── Auto-backup ──────────────────────────────────────────────────

const SETTINGS_KEY = 'rcc_settings_v1';

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
  catch { return {}; }
}
function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}

// IndexedDB helpers — FileSystemDirectoryHandle cannot be stored in localStorage
function _openHandleDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('rcc_fs', 8);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('handles'))        db.createObjectStore('handles');
      if (!db.objectStoreNames.contains('worklog'))        db.createObjectStore('worklog');
      if (!db.objectStoreNames.contains('snippets'))       db.createObjectStore('snippets');
      if (!db.objectStoreNames.contains('guides'))         db.createObjectStore('guides');
      if (!db.objectStoreNames.contains('clinical'))       db.createObjectStore('clinical');
      if (!db.objectStoreNames.contains('cogito'))         db.createObjectStore('cogito');
      if (!db.objectStoreNames.contains('reqproc'))        db.createObjectStore('reqproc');
      if (!db.objectStoreNames.contains('trustanalytics')) db.createObjectStore('trustanalytics');
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}
async function _saveBackupHandle(handle) {
  const idb = await _openHandleDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction('handles', 'readwrite');
    tx.objectStore('handles').put(handle, 'backupDir');
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
async function _loadBackupHandle() {
  try {
    const idb = await _openHandleDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('handles', 'readonly');
      const req = tx.objectStore('handles').get('backupDir');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch { return null; }
}

// One-time migration: move wlItems from localStorage → IndexedDB
async function _migrateWLToIDB() {
  if (localStorage.getItem('rcc_wl_migrated')) return;
  const raw = localStorage.getItem(WL_KEY);
  if (raw) {
    try { await saveWL(JSON.parse(raw)); localStorage.removeItem(WL_KEY); } catch {}
  }
  localStorage.setItem('rcc_wl_migrated', '1');
}

function buildBackupPayload() {
  return {
    version: 4,
    exportedAt: new Date().toISOString(),
    todos: db,
    recurring: recTasks,
    worklog: wlItems,
    reminders: reminders,
    links: linkItems,
    linksLayout: linkColWidths,
    snippets: snipItems,
    guides: guideItems,
    contacts: contactItems,
    databases: dbAccessItems,
    clinicalAreas: clinicalAreas,
    clinicalEntries: clinicalEntries,
    cogitoAreas: cogitoAreas,
    cogitoEntries: cogitoEntries,
    reqprocAreas: reqprocAreas,
    reqprocEntries: reqprocEntries,
    trustanalyticsAreas: trustanalyticsAreas,
    trustanalyticsEntries: trustanalyticsEntries,
    guidesAreas: guidesAreas,
    snippetsAreas: snippetsAreas,
    databasesAreas: databasesAreas
  };
}

async function writeAutoBackup(silent = false) {
  const handle = await _loadBackupHandle();
  if (!handle) return;
  let perm = await handle.queryPermission({ mode: 'readwrite' });
  if (perm !== 'granted') perm = await handle.requestPermission({ mode: 'readwrite' });
  if (perm !== 'granted') {
    if (!silent) showToast('Backup folder permission denied — re-select the folder in settings.', true);
    return;
  }
  const ts = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  try {
    const fileHandle = await handle.getFileHandle(`rcc-backup-${ts}.json`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(buildBackupPayload(), null, 2));
    await writable.close();
    const s = loadSettings();
    s.autoBackup = s.autoBackup || {};
    s.autoBackup.lastBackup = new Date().toISOString();
    saveSettings(s);
    updateAutoBackupStatus();
    if (!silent) showToast(`Auto-backup saved to ${handle.name}.`);
  } catch (e) {
    if (!silent) showToast('Auto-backup failed: ' + e.message, true);
  }
}

async function updateAutoBackupStatus() {
  const statusEl = document.getElementById('autoBackupStatus');
  if (!statusEl) return;
  const handle = await _loadBackupHandle();
  if (!handle) { statusEl.style.display = 'none'; return; }
  const s = loadSettings();
  const lastBackup = s.autoBackup?.lastBackup;
  const lastStr = lastBackup
    ? new Date(lastBackup).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'never';
  statusEl.style.display = 'block';
  statusEl.textContent = `${handle.name}  ·  Last: ${lastStr}`;
}

async function configureAutoBackupFolder() {
  if (!('showDirectoryPicker' in window)) {
    showToast('Auto-backup requires Chrome 86 or newer.', true);
    return;
  }
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    await _saveBackupHandle(handle);
    const s = loadSettings();
    s.autoBackup = s.autoBackup || {};
    s.autoBackup.enabled = true;
    s.autoBackup.folderName = handle.name;
    saveSettings(s);
    await updateAutoBackupStatus();
    writeAutoBackup(false); // write first backup immediately
  } catch (e) {
    if (e.name !== 'AbortError') showToast('Could not set backup folder: ' + e.message, true);
  }
}

document.getElementById('autoBackupFolderBtn').addEventListener('click', () => {
  document.getElementById('wrenchMenu').classList.remove('open');
  configureAutoBackupFolder();
});

// Periodic auto-backup — runs every 30 minutes if a folder is configured
const _AUTO_BACKUP_MS = 30 * 60 * 1000;
setInterval(async () => {
  const s = loadSettings();
  if (!s.autoBackup?.enabled) return;
  const last = s.autoBackup.lastBackup ? new Date(s.autoBackup.lastBackup) : null;
  if (!last || (Date.now() - last.getTime()) >= _AUTO_BACKUP_MS) writeAutoBackup(true);
}, _AUTO_BACKUP_MS);

// Initialise status display on load
updateAutoBackupStatus();

document.getElementById('restoreBtn').addEventListener('click', () => {
  document.getElementById('restoreInput').click();
});

document.getElementById('restoreInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const parsed = JSON.parse(evt.target.result);

      // Support v1 (todos only), v2 (unified), and v3 (+ links)
      const isV2 = parsed.version >= 2 && parsed.todos;
      const todosData = isV2 ? parsed.todos : parsed;

      if (!todosData.weeks) { showToast('Invalid backup file.', true); return; }

      const weekCount    = Object.keys(todosData.weeks).length;
      const recCount     = isV2 && parsed.recurring ? parsed.recurring.length : 0;
      const wlCount      = isV2 && parsed.worklog   ? parsed.worklog.length   : 0;
      const linksCount   = parsed.links    ? parsed.links.length    : 0;
      const guidesCount  = parsed.guides   ? parsed.guides.length   : 0;
      const contactsCount = parsed.contacts ? parsed.contacts.length : 0;

      showConfirm(
        `Restore from "${file.name}"?\n${weekCount} week(s), ${recCount} recurring, ${wlCount} work log, ${linksCount} links, ${guidesCount} guides, ${contactsCount} contacts will be loaded. Current data will be overwritten.`,
        async () => {
          // Snapshot current state so we can rollback on partial failure
          const wlSnapshot           = wlItems.slice();
          const guidesSnapshot       = guideItems.slice();
          const dbSnapshot           = dbAccessItems.slice();
          const clinicalAreasSnap    = clinicalAreas.slice();
          const clinicalEntriesSnap  = clinicalEntries.slice();
          const cogitoAreasSnap         = cogitoAreas.slice();
          const cogitoEntriesSnap       = cogitoEntries.slice();
          const reqprocAreasSnap        = reqprocAreas.slice();
          const reqprocEntriesSnap      = reqprocEntries.slice();
          const trustanalyticsAreasSnap   = trustanalyticsAreas.slice();
          const trustanalyticsEntriesSnap = trustanalyticsEntries.slice();
          const guidesAreasSnap    = guidesAreas.slice();
          const snippetsAreasSnap  = snippetsAreas.slice();
          const databasesAreasSnap = databasesAreas.slice();
          const snapshot = {
            db:        localStorage.getItem(DB_KEY),
            rec:       localStorage.getItem(REC_KEY),
            rem:       localStorage.getItem(REM_KEY),
            links:     localStorage.getItem(LINKS_KEY),
            layout:    localStorage.getItem(LINKS_LAYOUT_KEY),
            contacts:  localStorage.getItem(CONTACTS_KEY),
            databases: localStorage.getItem(DB_ACCESS_KEY)
          };
          try {
            db = todosData;
            currentKey = db.currentWeek || weekKey(new Date());
            saveDB(db);
            if (isV2 && parsed.recurring) { recTasks = parsed.recurring; saveRec(recTasks); renderRecPanel(); }
            if (isV2 && parsed.worklog)   { wlItems = parsed.worklog; await saveWL(wlItems); }
            if (isV2 && parsed.reminders) { reminders = parsed.reminders; saveReminders(reminders); renderReminders(); }
            if (parsed.links)       { linkItems = parsed.links; saveLinks(linkItems); }
            if (parsed.linksLayout) { linkColWidths = parsed.linksLayout; saveLinksLayout(linkColWidths); }
            if (parsed.guides)      { guideItems = parsed.guides; await saveGuides(guideItems); }
            if (parsed.contacts)    { contactItems = parsed.contacts; saveContacts(contactItems); }
            if (parsed.databases)      { dbAccessItems = parsed.databases; saveDbAccess(dbAccessItems); }
            if (parsed.clinicalAreas)  { clinicalAreas = parsed.clinicalAreas; saveClinicalAreas(clinicalAreas); }
            if (parsed.clinicalEntries){ clinicalEntries = parsed.clinicalEntries; await saveClinicalEntries(clinicalEntries); }
            if (parsed.cogitoAreas)    { cogitoAreas = parsed.cogitoAreas; saveCogitoAreas(cogitoAreas); }
            if (parsed.cogitoEntries)  { cogitoEntries = parsed.cogitoEntries; await saveCogitoEntries(cogitoEntries); }
            if (parsed.reqprocAreas)   { reqprocAreas = parsed.reqprocAreas; saveReqprocAreas(reqprocAreas); }
            if (parsed.reqprocEntries) { reqprocEntries = parsed.reqprocEntries; await saveReqprocEntries(reqprocEntries); }
            if (parsed.trustanalyticsAreas)   { trustanalyticsAreas = parsed.trustanalyticsAreas; saveTrustanalyticsAreas(trustanalyticsAreas); }
            if (parsed.trustanalyticsEntries) { trustanalyticsEntries = parsed.trustanalyticsEntries; await saveTrustanalyticsEntries(trustanalyticsEntries); }
            if (parsed.guidesAreas)    { guidesAreas = parsed.guidesAreas; saveGuidesAreas(guidesAreas); }
            if (parsed.snippetsAreas)  { snippetsAreas = parsed.snippetsAreas; saveSnippetsAreas(snippetsAreas); }
            if (parsed.databasesAreas) { databasesAreas = parsed.databasesAreas; saveDatabasesAreas(databasesAreas); }
            renderLinks();
            render();
            showToast(`Restored — ${weekCount} week(s), ${recCount} recurring, ${wlCount} worklog, ${linksCount} links, ${guidesCount} guides, ${contactsCount} contacts.`);
            setTimeout(() => location.reload(), 250);
          } catch (restoreErr) {
            // Rollback to snapshot
            try {
              if (snapshot.db)        localStorage.setItem(DB_KEY, snapshot.db);
              if (snapshot.rec)       localStorage.setItem(REC_KEY, snapshot.rec);
              if (snapshot.rem)       localStorage.setItem(REM_KEY, snapshot.rem);
              if (snapshot.links)     localStorage.setItem(LINKS_KEY, snapshot.links);
              if (snapshot.layout)    localStorage.setItem(LINKS_LAYOUT_KEY, snapshot.layout);
              if (snapshot.contacts)  localStorage.setItem(CONTACTS_KEY, snapshot.contacts);
              if (snapshot.databases) localStorage.setItem(DB_ACCESS_KEY, snapshot.databases);
            } catch {}
            wlItems = wlSnapshot; await saveWL(wlSnapshot);
            guideItems = guidesSnapshot; await saveGuides(guidesSnapshot);
            dbAccessItems = dbSnapshot; saveDbAccess(dbSnapshot);
            clinicalAreas = clinicalAreasSnap; saveClinicalAreas(clinicalAreasSnap);
            clinicalEntries = clinicalEntriesSnap; await saveClinicalEntries(clinicalEntriesSnap);
            cogitoAreas = cogitoAreasSnap; saveCogitoAreas(cogitoAreasSnap);
            cogitoEntries = cogitoEntriesSnap; await saveCogitoEntries(cogitoEntriesSnap);
            reqprocAreas = reqprocAreasSnap; saveReqprocAreas(reqprocAreasSnap);
            reqprocEntries = reqprocEntriesSnap; await saveReqprocEntries(reqprocEntriesSnap);
            trustanalyticsAreas = trustanalyticsAreasSnap; saveTrustanalyticsAreas(trustanalyticsAreasSnap);
            trustanalyticsEntries = trustanalyticsEntriesSnap; await saveTrustanalyticsEntries(trustanalyticsEntriesSnap);
            guidesAreas = guidesAreasSnap; saveGuidesAreas(guidesAreasSnap);
            snippetsAreas = snippetsAreasSnap; saveSnippetsAreas(snippetsAreasSnap);
            databasesAreas = databasesAreasSnap; saveDatabasesAreas(databasesAreasSnap);
            showToast('Restore failed — your original data has been preserved.', true);
          }
        }
      );
    } catch (err) {
      showToast('Failed to parse backup: ' + err.message, true);
    } finally {
      e.target.value = '';
    }
  };
  reader.onerror = () => { showToast('Could not read the file.', true); e.target.value = ''; };
  reader.readAsText(file);
});

// Declare wlItems here so renderList() (called inside render()) can safely reference it
let wlItems = [];
let selectedWLType = 'All';
let snipItems = [];
let guideItems = [];
let contactItems = loadContacts();
let dbAccessItems  = loadDbAccess();

// ── Reminders ───────────────────────────────────────────────────
const REM_KEY = 'work_todo_reminders_v1';

function loadReminders() {
  try { return JSON.parse(localStorage.getItem(REM_KEY)) || []; }
  catch { return []; }
}
function saveReminders(list) {
  try { localStorage.setItem(REM_KEY, JSON.stringify(list)); }
  catch (e) {
    const msg = e.name === 'QuotaExceededError'
      ? 'Storage full — reminders not saved. Export a backup to free space.'
      : 'Failed to save reminders: ' + e.message;
    showToast(msg, true);
  }
}

let reminders = loadReminders();
let showDoneReminders = localStorage.getItem('rcc_show_done_rem') === '1';
let showDoneTasks     = localStorage.getItem('rcc_show_done_tasks') === '1';

function getReminderStatus(rem) {
  if (rem.done) return 'done';
  if (!rem.date) return 'ok';
  const now = new Date();
  const remDt = new Date(rem.date + (rem.time ? 'T' + rem.time : 'T00:00:00'));
  const diffMs = remDt - now;
  if (diffMs < 0) return 'due';
  if (diffMs < 24 * 60 * 60 * 1000) return 'soon';
  return 'ok';
}

function fmtReminderDate(rem) {
  if (!rem.date) return '';
  const now = new Date();
  const today = localDateStr(now);
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = localDateStr(tomorrow);
  const t = rem.time ? ` · ${rem.time}` : '';
  if (rem.date === today)        return `Today${t}`;
  if (rem.date === tomorrowStr)  return `Tomorrow${t}`;
  const d = new Date(rem.date + 'T12:00:00');
  const diffDays = Math.round((d - now) / 86400000);
  if (diffDays > 0 && diffDays < 7) {
    return d.toLocaleDateString('en-GB', { weekday: 'short' }) + t;
  }
  const sameYear = d.getFullYear() === now.getFullYear();
  const dateStr = sameYear
    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  return dateStr + t;
}

function renderReminders() {
  const list = document.getElementById('reminderList');
  const empty = document.getElementById('reminderEmpty');
  const countEl = document.getElementById('reminderCount');
  const dotDueEl = document.getElementById('reminderDotDue');
  const dotSoonEl = document.getElementById('reminderDotSoon');

  const search = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const priorityFilter = (document.getElementById('filterPriority').value || '');
  const sortMode = (document.getElementById('sortBy').value || 'default');
  const priorityOrder = { High: 0, Med: 1, Low: 2 };

  const matchRem = r => {
    if (search && !r.text.toLowerCase().includes(search) && !(r.wlTitle && r.wlTitle.toLowerCase().includes(search))) return false;
    if (priorityFilter && r.priority !== priorityFilter) return false;
    return true;
  };

  const active = reminders.filter(r => !r.done && matchRem(r));
  const done = reminders.filter(r => r.done && matchRem(r));

  countEl.textContent = active.length;
  const dueCount = active.filter(r => getReminderStatus(r) === 'due').length;
  const soonCount = active.filter(r => getReminderStatus(r) === 'soon').length;
  dotDueEl.style.display = dueCount ? 'inline-flex' : 'none';
  dotDueEl.textContent = dueCount;
  dotSoonEl.style.display = soonCount ? 'inline-flex' : 'none';
  dotSoonEl.textContent = soonCount;

  const sortByDate = arr => arr.slice().sort((a, b) => {
    if (sortMode === 'priority') {
      const pa = priorityOrder[a.priority] ?? 3;
      const pb = priorityOrder[b.priority] ?? 3;
      if (pa !== pb) return pa - pb;
    }
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''));
  });

  const dueItems  = sortByDate(active.filter(r => getReminderStatus(r) === 'due'));
  const soonItems = sortByDate(active.filter(r => getReminderStatus(r) === 'soon'));
  const restItems = [...sortByDate(active.filter(r => getReminderStatus(r) === 'ok')), ...(showDoneReminders ? done : [])];

  list.innerHTML = '';
  empty.style.display = (dueItems.length + soonItems.length + restItems.length === 0) ? 'block' : 'none';

  function buildReminderEl(rem) {
    const status = getReminderStatus(rem);
    const div = document.createElement('div');
    div.className = 'reminder-item' +
      (status === 'due' ? ' reminder-due' : '') +
      (status === 'soon' ? ' reminder-soon' : '') +
      (rem.done ? ' reminder-done' : '');

    const isUrl = rem.link && (rem.link.startsWith('http://') || rem.link.startsWith('https://'));
    const linkedWl = rem.wlLink ? wlItems.find(w => w.id === rem.wlLink) : null;
    const linkHtml = [
      linkedWl ? `<span class="rem-link-icon" data-wlid="${linkedWl.id}" title="${escHtml(linkedWl.title)}">🔗</span>` : '',
      rem.link ? (isUrl
        ? `<a class="rem-link-icon" href="${escHtml(rem.link)}" target="_blank" title="${escHtml(rem.link)}">🔗</a>`
        : `<span class="rem-link-icon" title="${escHtml(rem.link)}">🔗</span>`) : ''
    ].join('');

    const hasNotes = rem.notes && rem.notes.trim();
    const notesIndicator = hasNotes
      ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;opacity:0.45;margin-left:4px" title="Has notes"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
      : '';
    const urgencyIcon = status === 'due'
      ? `<svg class="rem-urgency-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--high)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" title="Overdue"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
      : status === 'soon'
      ? `<svg class="rem-urgency-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--med)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" title="Due soon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
      : '';
    const dateFlagClass = status === 'due' ? ' rem-flag-due' : status === 'soon' ? ' rem-flag-soon' : '';
    div.style.cursor = 'pointer';
    div.innerHTML = `
      <div class="rem-card-inner">
        <div class="rem-card-left">
          <span class="reminder-text" data-tooltip="${escHtml(rem.text)}">${escHtml(rem.text)}${notesIndicator}</span>
          <div class="rem-row rem-row-meta">
            ${linkHtml}
            ${rem.date ? `<span class="reminder-date${dateFlagClass}">${urgencyIcon}${fmtReminderDate(rem)}</span>` : ''}
          </div>
        </div>
        ${hasNotes ? `<div class="rem-card-notes" data-tooltip="${escHtml(rem.notes.trim())}">${escHtml(rem.notes.trim())}</div>` : ''}
      </div>
      <div class="rem-card-actions">
        ${!rem.done
          ? `<button class="icon-btn rem-done-btn" data-id="${rem.id}" title="Mark done">&#10003;</button>`
          : `<button class="icon-btn rem-undo-btn" data-id="${rem.id}" title="Undo">&#8635;</button>`}
      </div>`;

    div.addEventListener('click', e => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      createReminderModal(rem.id);
    });
    div.querySelector('.rem-done-btn') && div.querySelector('.rem-done-btn').addEventListener('click', e => {
      e.stopPropagation();
      const r = reminders.find(r => r.id === rem.id);
      if (r) { r.done = true; r.doneAt = localDateStr(); saveReminders(reminders); renderReminders(); }
    });
    div.querySelector('.rem-undo-btn') && div.querySelector('.rem-undo-btn').addEventListener('click', e => {
      e.stopPropagation();
      const r = reminders.find(r => r.id === rem.id);
      if (r) { r.done = false; delete r.doneAt; saveReminders(reminders); renderReminders(); }
    });
    const wlBadge = div.querySelector('[data-wlid]');
    if (wlBadge) {
      wlBadge.addEventListener('click', e => {
        e.stopPropagation();
        switchTab('Worklog');
        setTimeout(() => createWLModal(wlBadge.getAttribute('data-wlid')), 150);
      });
    }

    // Inline date editor — click the date span to edit
    const dateSpan = div.querySelector('.reminder-date');
    if (dateSpan) {
      dateSpan.style.cursor = 'pointer';
      dateSpan.addEventListener('click', e => {
        e.stopPropagation();
        if (dateSpan.querySelector('input')) return;
        const input = document.createElement('input');
        input.type = 'date';
        input.value = rem.date || '';
        input.style.cssText = 'font-family:var(--font-mono);font-size:11px;background:var(--surface);border:1px solid var(--accent);border-radius:var(--radius-sm);padding:1px 4px;color:var(--text);width:120px;';
        dateSpan.innerHTML = '';
        dateSpan.appendChild(input);
        input.focus();
        input.showPicker?.();

        function commit() {
          const r = reminders.find(r => r.id === rem.id);
          if (r) { r.date = input.value || undefined; saveReminders(reminders); renderReminders(); }
        }
        input.addEventListener('change', () => { commit(); });
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { renderReminders(); }
        });
        input.addEventListener('blur', () => { commit(); });
      });
    }

    return div;
  }

  // Max 3 columns per row — items beyond that wrap to the next line
  const colCount = Math.min(Math.max(dueItems.length, soonItems.length, restItems.length, 1), 3);
  list.style.setProperty('--rem-col-count', colCount);

  function appendGroup(items, extraClass) {
    if (!items.length) return;
    const grid = document.createElement('div');
    grid.className = 'reminder-group-grid ' + extraClass;
    items.forEach(rem => grid.appendChild(buildReminderEl(rem)));
    list.appendChild(grid);
  }

  appendGroup(dueItems,  'reminder-group-due');
  appendGroup(soonItems, 'reminder-group-soon');
  appendGroup(restItems, 'reminder-group-rest');

  const toggleRemBtn = document.getElementById('toggleDoneReminders');
  if (toggleRemBtn) {
    toggleRemBtn.style.display = done.length ? '' : 'none';
    toggleRemBtn.classList.toggle('active', showDoneReminders);
    toggleRemBtn.title = showDoneReminders ? 'Hide completed' : 'Show completed';
  }
}

function populateWlDropdowns() {
  ['remWlLink'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Link to work log item (optional) —</option>';
    wlItems.filter(w => !w.archived).forEach(w => {
      const o = document.createElement('option');
      o.value = w.id;
      o.textContent = `[${w.type}] ${w.title}`;
      if (w.id === cur) o.selected = true;
      sel.appendChild(o);
    });
  });
}

(function() {
  const openBtn = document.getElementById('addReminderOpenBtn');
  const row = document.getElementById('addReminderRow');
  const closeBtn = document.getElementById('addReminderCloseBtn');
  openBtn.addEventListener('click', e => {
    e.stopPropagation();
    row.style.display = '';
    document.getElementById('remDate').value = localDateStr();
    requestAnimationFrame(() => document.getElementById('remText').focus());
  });
  function closeForm() {
    row.style.display = 'none';
    document.getElementById('remText').value = '';
    document.getElementById('remDate').value = '';
    document.getElementById('remTime').value = '';
    document.getElementById('remWlLink').value = '';
  }
  closeBtn.addEventListener('click', closeForm);
  row.addEventListener('keydown', e => { if (e.key === 'Escape') closeForm(); });
  window._closeReminderForm = closeForm;
})();

document.getElementById('toggleDoneReminders').addEventListener('click', e => {
  e.stopPropagation();
  showDoneReminders = !showDoneReminders;
  localStorage.setItem('rcc_show_done_rem', showDoneReminders ? '1' : '0');
  renderReminders();
});

document.getElementById('addReminderBtn').addEventListener('click', () => {
  const text = document.getElementById('remText').value.trim();
  if (!text) { showToast('Enter a reminder.', true); return; }
  const today = localDateStr();
  const wlId = document.getElementById('remWlLink').value;
  const linked = wlId ? wlItems.find(w => w.id === wlId) : null;
  reminders.push({
    id: crypto.randomUUID(),
    text,
    date: document.getElementById('remDate').value || today,
    time: document.getElementById('remTime').value,
    priority: document.getElementById('remPriority').value || undefined,
    wlLink: wlId,
    wlTitle: linked ? linked.title : '',
    wlType: linked ? linked.type : '',
    done: false,
    createdAt: new Date().toISOString()
  });
  saveReminders(reminders);
  if (window._closeReminderForm) window._closeReminderForm();
  renderReminders();
  showToast('Reminder added.');
});

document.getElementById('remText').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('addReminderBtn').click();
});

// Check reminders every minute and show toast for due ones
let _lastDueCheck = '';
function checkDueReminders() {
  const nowKey = new Date().toISOString().slice(0, 16);
  if (nowKey === _lastDueCheck) return;
  _lastDueCheck = nowKey;
  reminders.filter(r => !r.done && r.date && r.time).forEach(r => {
    const remKey = r.date + 'T' + r.time;
    if (remKey === nowKey) showToast(`⏰ Reminder: ${r.text}`, false);
  });
  renderReminders();
}
setInterval(checkDueReminders, 30000);

function autoArchiveReminders() {
  const today = localDateStr();
  let changed = false;
  reminders = reminders.filter(r => {
    if (r.done && r.doneAt && r.doneAt < today) { changed = true; return false; }
    return true;
  });
  if (changed) { saveReminders(reminders); }
}

// Run auto-archive on load
autoArchiveReminders();
renderReminders();

// Reminder card tooltips (title = left of card, notes = right of card)
(function setupRemTooltip() {
  const tip = document.createElement('div');
  tip.id = 'rem-hover-tip';
  document.body.appendChild(tip);
  let hideTimer;

  function show(text, refEl, side) {
    clearTimeout(hideTimer);
    const card = refEl.closest('.reminder-item');
    const r = card.getBoundingClientRect();
    tip.textContent = text;
    tip.className = 'rem-hover-tip-visible';
    tip.style.maxWidth = '280px';
    // Position after paint so we know tip dimensions
    requestAnimationFrame(() => {
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;
      const top = window.scrollY + r.top + r.height / 2 - th / 2;
      let left;
      if (side === 'left') {
        left = window.scrollX + r.left - tw - 10;
      } else {
        left = window.scrollX + r.right + 10;
      }
      tip.style.top = top + 'px';
      tip.style.left = left + 'px';
    });
  }

  function hide() {
    hideTimer = setTimeout(() => { tip.className = ''; }, 80);
  }

  document.addEventListener('mouseover', e => {
    const title = e.target.closest('.reminder-text[data-tooltip]');
    const notes = e.target.closest('.rem-card-notes[data-tooltip]');
    if (title) show(title.dataset.tooltip, title, 'left');
    else if (notes) show(notes.dataset.tooltip, notes, 'right');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('.reminder-text[data-tooltip]') || e.target.closest('.rem-card-notes[data-tooltip]')) hide();
  });
})();

const REC_KEY = 'work_todo_recurring_v1';

function loadRec() {
  try { return JSON.parse(localStorage.getItem(REC_KEY)) || []; }
  catch { return []; }
}

function saveRec(list) {
  try { localStorage.setItem(REC_KEY, JSON.stringify(list)); }
  catch (e) {
    const msg = e.name === 'QuotaExceededError'
      ? 'Storage full — recurring tasks not saved. Export a backup to free space.'
      : 'Failed to save recurring tasks: ' + e.message;
    showToast(msg, true);
  }
}

let recTasks = loadRec();
let recFilter = 'active'; // 'active' | 'inactive'

// Populate category dropdown
const recCatSel = document.getElementById('recCategory');
OUTLOOK_CATS.forEach(c => {
  const o = document.createElement('option');
  o.value = c.label; o.textContent = c.label;
  recCatSel.appendChild(o);
});

function nextOccurrence(rec, fromKey) {
  // Returns the ISO week-monday key of the next due occurrence
  const from = new Date(fromKey + 'T00:00:00');
  if (rec.freq === 'weekly') return fromKey;
  if (rec.freq === 'fortnightly') {
    // Due every other week from createdWeek
    const created = new Date(rec.createdWeek + 'T00:00:00');
    const diffWeeks = Math.round((from - created) / (7 * 86400000));
    return diffWeeks % 2 === 0 ? fromKey : null;
  }
  if (rec.freq === 'monthly') {
    // Due on the week containing the same day-of-month as created
    const created = new Date(rec.createdWeek + 'T00:00:00');
    const fromEnd = new Date(from); fromEnd.setDate(fromEnd.getDate() + 6);
    const dayOfMonth = created.getDate();
    // Check if any day this week matches the day of month
    for (let i = 0; i < 7; i++) {
      const d = new Date(from); d.setDate(d.getDate() + i);
      if (d.getDate() === dayOfMonth) return fromKey;
    }
    return null;
  }
  return null;
}

function injectRecurringIntoWeek(weekKey) {
  const week = getWeek(db, weekKey);
  recTasks.forEach(rec => {
    if (rec.active === false) return; // skip inactive
    if (!nextOccurrence(rec, weekKey)) return;
    // Check if already present (by recId) and not done
    const already = week.tasks.find(t => t.recId === rec.id);
    if (already && !already.done) return;   // exists and not done — skip
    if (already && already.done) return;    // done this week — skip (user completed it)
    // Not present — inject
    week.tasks.push({
      id: crypto.randomUUID(),
      recId: rec.id,
      name: rec.name,
      priority: rec.priority,
      category: rec.category || '',
      build: weekKey,
      time: rec.time || '',
      due: weekKey,
      done: false,
      carried: false,
      notes: ''
    });
  });
  saveDB(db);
}

function recPriorityIcon(priority) {
  if (priority === 'High') return '<span class="rec-pri-icon rec-pri-high">&#10071;</span>'; // ❗
  if (priority === 'Med')  return '<span class="rec-pri-icon rec-pri-med">&#9651;</span>';   // △
  return '';
}

function renderRecPanel() {
  const list = document.getElementById('recList');
  const empty = document.getElementById('recEmpty');
  const activeCount = recTasks.filter(r => r.active !== false).length;
  document.getElementById('recCount').textContent = activeCount;

  const shown = recTasks.filter(r =>
    recFilter === 'active' ? r.active !== false : r.active === false
  );
  list.innerHTML = '';
  empty.style.display = shown.length === 0 ? 'block' : 'none';

  // Sync filter tab styles
  document.querySelectorAll('.rec-filter-tab').forEach(btn => {
    btn.classList.toggle('rec-filter-active', btn.dataset.filter === recFilter);
  });

  shown.forEach(rec => {
    const inactive = rec.active === false;
    const hasTime = !!rec.time;
    const div = document.createElement('div');
    div.className = 'rec-card' + (inactive ? ' rec-inactive' : '');
    div.innerHTML = `
      ${recPriorityIcon(rec.priority)}
      <span class="rec-card-name">${escHtml(rec.name)}</span>
      <span class="rec-card-freq">${rec.freq}</span>
      <div class="rec-card-actions">
        ${hasTime ? `<button class="icon-btn rec-cal-btn" title="Add to calendar">&#128197;</button>` : ''}
        <button class="icon-btn del rec-del-btn" title="Delete">&#x2715;</button>
      </div>`;

    div.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      createRecModal(rec.id);
    });
    div.querySelector('.rec-del-btn').addEventListener('click', e => {
      e.stopPropagation();
      showConfirm(`Delete "${rec.name}"?`, () => {
        recTasks = recTasks.filter(r => r.id !== rec.id);
        saveRec(recTasks);
        renderRecPanel();
      });
    });
    if (hasTime) {
      div.querySelector('.rec-cal-btn').addEventListener('click', e => {
        e.stopPropagation();
        const startDate = rec.startDate || localDateStr();
        const rruleMap = { weekly: 'FREQ=WEEKLY;INTERVAL=1', fortnightly: 'FREQ=WEEKLY;INTERVAL=2', monthly: 'FREQ=MONTHLY;INTERVAL=1' };
        const freqLabels = { weekly: 'Weekly', fortnightly: 'Every 2 weeks', monthly: 'Monthly' };
        addToCalendar({ name: rec.name, priority: rec.priority, build: startDate, time: rec.time, due: startDate, category: rec.category || '', notes: '', recLabel: `${freqLabels[rec.freq] || rec.freq} from ${fmtDate(startDate)}` }, rruleMap[rec.freq] || 'FREQ=WEEKLY;INTERVAL=1');
      });
    }
    list.appendChild(div);
  });
}

function createRecModal(recId) {
  document.getElementById('recViewModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'recViewModal';
  modal.className = 'rem-edit-modal';

  const dragBar = document.createElement('div');
  dragBar.className = 'wl-drag-bar';
  dragBar.innerHTML = '&#8942;&#8942;&#8942;';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn';
  closeBtn.style.cssText = 'font-size:16px;opacity:0.6;margin-left:auto';
  closeBtn.innerHTML = '&#x2715;';
  dragBar.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'rem-edit-body';
  modal.append(dragBar, body);
  document.body.appendChild(modal); modal._openModal?.();

  const removeListeners = setupWLModalDrag(modal, dragBar);
  function close() { removeListeners(); modal.remove(); }
  closeBtn.addEventListener('click', close);
  document.addEventListener('mousedown', function onOut(e) {
    if (!modal.contains(e.target)) { close(); document.removeEventListener('mousedown', onOut); }
  }, true);

  function getRec() { return recTasks.find(r => r.id === recId); }

  function renderView() {
    body.innerHTML = '';
    const r = getRec(); if (!r) { close(); return; }

    const nameEl = document.createElement('div');
    nameEl.className = 'rem-modal-text';
    nameEl.innerHTML = recPriorityIcon(r.priority) + ' ' + escHtml(r.name);

    const meta = document.createElement('div');
    meta.className = 'rem-modal-meta';
    meta.innerHTML = `
      <span class="rec-card-freq">${r.freq}</span>
      ${r.priority !== 'Low' ? `<span class="badge badge-${r.priority}">${r.priority}</span>` : ''}
      ${r.startDate ? `<span class="reminder-date">from ${fmtDate(r.startDate)}</span>` : ''}
      ${r.time ? `<span class="reminder-date">&#128336; ${r.time}</span>` : ''}
      ${r.active === false ? `<span class="wl-status-badge wl-status-Blocked">Inactive</span>` : `<span class="wl-status-badge wl-status-In-Progress">Active</span>`}`;

    const footer = document.createElement('div');
    footer.className = 'rem-edit-footer';
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'icon-btn';
    toggleBtn.style.marginRight = 'auto';
    toggleBtn.textContent = r.active === false ? 'Set active' : 'Set inactive';
    toggleBtn.addEventListener('click', () => {
      const live = getRec(); if (!live) return;
      live.active = live.active === false ? true : false;
      saveRec(recTasks); renderRecPanel(); renderView();
      if (live.active) { injectRecurringIntoWeek(currentKey); render(); }
    });
    const editBtn = document.createElement('button');
    editBtn.className = 'add-rec-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', renderEdit);
    footer.append(toggleBtn, editBtn);

    body.append(nameEl, meta, footer);
  }

  function renderEdit() {
    body.innerHTML = '';
    const r = getRec(); if (!r) { close(); return; }

    const nameIn = document.createElement('input');
    nameIn.type = 'text'; nameIn.className = 'rem-edit-input'; nameIn.value = r.name; nameIn.placeholder = 'Task name…';

    const row1 = document.createElement('div'); row1.className = 'rem-edit-row';
    const priSel = document.createElement('select'); priSel.className = 'rem-edit-input';
    ['High','Med','Low'].forEach(v => { const o = document.createElement('option'); o.value = o.textContent = v; if (r.priority === v) o.selected = true; priSel.appendChild(o); });
    const freqSel = document.createElement('select'); freqSel.className = 'rem-edit-input';
    ['weekly','fortnightly','monthly'].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v.charAt(0).toUpperCase() + v.slice(1); if (r.freq === v) o.selected = true; freqSel.appendChild(o); });
    row1.append(priSel, freqSel);

    const row2 = document.createElement('div'); row2.className = 'rem-edit-row';
    const startIn = document.createElement('input'); startIn.type = 'date'; startIn.className = 'rem-edit-input'; startIn.style.flex = '1'; startIn.value = r.startDate || '';
    const timeSel = document.createElement('select'); timeSel.className = 'rem-edit-input';
    const timeNone = document.createElement('option'); timeNone.value = ''; timeNone.textContent = 'No time'; timeSel.appendChild(timeNone);
    // populate time options
    for (let h = 7; h <= 20; h++) { ['00','30'].forEach(m => { const v = `${String(h).padStart(2,'0')}:${m}`; const o = document.createElement('option'); o.value = v; o.textContent = v; if (r.time === v) o.selected = true; timeSel.appendChild(o); }); }
    row2.append(startIn, timeSel);

    const catSel = document.createElement('select'); catSel.className = 'rem-edit-input';
    const catNone = document.createElement('option'); catNone.value = ''; catNone.textContent = '— Category —'; catSel.appendChild(catNone);
    OUTLOOK_CATS.forEach(c => { const o = document.createElement('option'); o.value = c.label; o.textContent = c.label; if (r.category === c.label) o.selected = true; catSel.appendChild(o); });

    const footer = document.createElement('div'); footer.className = 'rem-edit-footer';
    const cancelBtn = document.createElement('button'); cancelBtn.className = 'icon-btn'; cancelBtn.style.marginRight = 'auto'; cancelBtn.textContent = 'Cancel'; cancelBtn.addEventListener('click', renderView);
    const saveBtn = document.createElement('button'); saveBtn.className = 'add-rec-btn'; saveBtn.textContent = 'Save';

    footer.append(cancelBtn, saveBtn);
    body.append(nameIn, row1, row2, catSel, footer);
    requestAnimationFrame(() => nameIn.focus());

    function save() {
      const newName = nameIn.value.trim();
      if (!newName) { showToast('Enter a task name.', true); return; }
      const live = getRec(); if (!live) { close(); return; }
      live.name = newName; live.priority = priSel.value; live.freq = freqSel.value;
      live.startDate = startIn.value; live.time = timeSel.value; live.category = catSel.value;
      saveRec(recTasks); renderRecPanel();
      showToast('Recurring task saved.'); renderView();
    }
    saveBtn.addEventListener('click', save);
    nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
    modal.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });
  }

  renderView();
}

// ── Recurring: open/close add row ───────────────────────────────
(function() {
  const openBtn = document.getElementById('addRecOpenBtn');
  const row = document.getElementById('addRecRow');
  const closeBtn = document.getElementById('addRecCloseBtn');
  function openRecRow() {
    row.style.display = '';
    document.getElementById('recStartDate').value = localDateStr();
    requestAnimationFrame(() => document.getElementById('recName').focus());
  }
  function closeRecRow() {
    row.style.display = 'none';
    document.getElementById('recName').value = '';
  }
  window._closeRecRow = closeRecRow;
  if (openBtn) openBtn.addEventListener('click', e => { e.stopPropagation(); openRecRow(); });
  if (closeBtn) closeBtn.addEventListener('click', closeRecRow);
  if (row) row.addEventListener('keydown', e => { if (e.key === 'Escape') closeRecRow(); });
})();

// ── Recurring: filter tabs ───────────────────────────────────────
document.querySelectorAll('.rec-filter-tab').forEach(btn => {
  btn.addEventListener('click', () => { recFilter = btn.dataset.filter; renderRecPanel(); });
});

// ── Recurring: add button ────────────────────────────────────────
document.getElementById('addRecBtn').addEventListener('click', () => {
  const name = document.getElementById('recName').value.trim();
  if (!name) { showToast('Enter a task name.', true); return; }
  const today = localDateStr();
  const rec = {
    id: crypto.randomUUID(),
    name,
    priority: document.getElementById('recPriority').value,
    freq: document.getElementById('recFreq').value,
    startDate: document.getElementById('recStartDate').value || today,
    time: document.getElementById('recTime').value,
    category: document.getElementById('recCategory').value,
    createdWeek: currentKey
  };
  recTasks.push(rec);
  saveRec(recTasks);
  window._closeRecRow?.();
  renderRecPanel();
  injectRecurringIntoWeek(currentKey);
  render();
  showToast(`Recurring task added — ${rec.freq}.`);
});

renderRecPanel();
injectRecurringIntoWeek(currentKey);
render();

// ── Work Log ────────────────────────────────────────────────────
const WL_KEY = 'work_todo_worklog_v1';

async function loadWL() {
  try {
    const idb = await _openHandleDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('worklog', 'readonly');
      const req = tx.objectStore('worklog').get('data');
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch { return []; }
}
async function saveWL(items) {
  try {
    const idb = await _openHandleDB();
    await new Promise((resolve, reject) => {
      const tx = idb.transaction('worklog', 'readwrite');
      tx.objectStore('worklog').put(items, 'data');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    // Signal other tabs to reload from IDB
    try { localStorage.setItem('rcc_wl_sync', Date.now()); } catch {}
  } catch (e) {
    showToast('Failed to save work log: ' + e.message, true);
  }
}

async function loadSnippets() {
  try {
    const idb = await _openHandleDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('snippets', 'readonly');
      const req = tx.objectStore('snippets').get('data');
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch { return []; }
}
async function saveSnippets(items) {
  try {
    const idb = await _openHandleDB();
    await new Promise((resolve, reject) => {
      const tx = idb.transaction('snippets', 'readwrite');
      tx.objectStore('snippets').put(items, 'data');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    showToast('Failed to save snippet: ' + e.message, true);
  }
}

async function loadGuides() {
  try {
    const idb = await _openHandleDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('guides', 'readonly');
      const req = tx.objectStore('guides').get('data');
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch { return []; }
}
async function saveGuides(items) {
  try {
    const idb = await _openHandleDB();
    await new Promise((resolve, reject) => {
      const tx = idb.transaction('guides', 'readwrite');
      tx.objectStore('guides').put(items, 'data');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    showToast('Failed to save guide: ' + e.message, true);
  }
}

// ── Clinical Areas ────────────────────────────────────────────────
const CLINICAL_AREAS_KEY = 'rcc_clinical_areas';
let clinicalAreas = [];
let clinicalEntries = [];
let selectedClinicalAreaId = localStorage.getItem('rcc_clinical_area') || null;
let clinicalTagFilters = new Set();

function loadClinicalAreas() {
  try { return JSON.parse(localStorage.getItem(CLINICAL_AREAS_KEY)) || []; } catch { return []; }
}
function saveClinicalAreas(areas) {
  localStorage.setItem(CLINICAL_AREAS_KEY, JSON.stringify(areas));
}
async function loadClinicalEntries() {
  try {
    const idb = await _openHandleDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('clinical', 'readonly');
      const req = tx.objectStore('clinical').get('data');
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch { return []; }
}
async function saveClinicalEntries(items) {
  try {
    const idb = await _openHandleDB();
    await new Promise((resolve, reject) => {
      const tx = idb.transaction('clinical', 'readwrite');
      tx.objectStore('clinical').put(items, 'data');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    showToast('Failed to save clinical entry: ' + e.message, true);
  }
}

function renderClinicalSidebar() {
  const list = document.getElementById('clinicalAreaList');
  if (!list) return;
  list.innerHTML = '';
  clinicalAreas.forEach(area => {
    const count = clinicalEntries.filter(e => e.areaId === area.id).length;
    const item = document.createElement('div');
    item.className = 'clinical-area-item' + (area.id === selectedClinicalAreaId ? ' active' : '');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'clinical-area-name';
    nameSpan.title = area.name;
    nameSpan.textContent = area.name;

    const menuBtn = document.createElement('button');
    menuBtn.className = 'clinical-area-menu-btn icon-btn';
    menuBtn.innerHTML = '&#8943;';
    menuBtn.title = 'Rename / Delete';
    menuBtn.addEventListener('click', e => { e.stopPropagation(); showClinicalAreaMenu(area, menuBtn); });

    item.append(nameSpan);
    if (count) {
      const countSpan = document.createElement('span');
      countSpan.className = 'clinical-area-count';
      countSpan.textContent = count;
      item.appendChild(countSpan);
    }
    item.appendChild(menuBtn);
    item.addEventListener('click', () => selectClinicalArea(area.id));
    list.appendChild(item);
  });
}

function selectClinicalArea(areaId) {
  selectedClinicalAreaId = areaId;
  localStorage.setItem('rcc_clinical_area', areaId);
  clinicalTagFilters.clear();
  renderClinicalHub();
}

function renderClinicalHub() {
  renderClinicalSidebar();
  const placeholder = document.getElementById('clinicalPlaceholder');
  const content = document.getElementById('clinicalContent');
  const addEntryBtn = document.getElementById('clinicalAddEntryBtn');
  const areaExists = selectedClinicalAreaId && clinicalAreas.find(a => a.id === selectedClinicalAreaId);
  if (!areaExists) {
    if (placeholder) placeholder.style.display = '';
    if (content) content.style.display = 'none';
    if (addEntryBtn) addEntryBtn.style.display = 'none';
    return;
  }
  if (placeholder) placeholder.style.display = 'none';
  if (content) content.style.display = '';
  if (addEntryBtn) addEntryBtn.style.display = '';
  renderClinicalEntries();
}

function renderClinicalEntries() {
  const area = clinicalAreas.find(a => a.id === selectedClinicalAreaId);
  if (!area) return;
  const toolbar = document.getElementById('clinicalToolbar');
  const tagFilter = document.getElementById('clinicalTagFilter');
  const entryList = document.getElementById('clinicalEntryList');
  const emptyEl = document.getElementById('clinicalEmpty');
  if (!toolbar || !entryList) return;

  const prevSearch = toolbar.querySelector('.clinical-search')?.value || '';

  // Rebuild toolbar
  toolbar.innerHTML = '';
  const searchIn = document.createElement('input');
  searchIn.type = 'text';
  searchIn.className = 'wl-search clinical-search';
  searchIn.placeholder = `Search ${escHtml(area.name)}…`;
  searchIn.value = prevSearch;
  searchIn.addEventListener('input', renderClinicalEntries);
  const countEl = document.createElement('span');
  countEl.style.cssText = 'font-family:var(--font-mono);font-size:11px;color:var(--text-faint);white-space:nowrap;margin-left:auto;';
  toolbar.append(searchIn, countEl);

  // Tag filter pills
  const areaEntries = clinicalEntries.filter(e => e.areaId === selectedClinicalAreaId && !e.archived);
  const allTags = [...new Set(areaEntries.flatMap(e => e.tags || []))].sort();
  tagFilter.innerHTML = '';
  if (allTags.length) {
    const lbl = document.createElement('span');
    lbl.className = 'clinical-tag-filter-label';
    lbl.textContent = 'Tags:';
    tagFilter.appendChild(lbl);
    allTags.forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'clinical-tag-pill' + (clinicalTagFilters.has(tag) ? ' active' : '');
      pill.textContent = tag;
      pill.addEventListener('click', () => {
        clinicalTagFilters.has(tag) ? clinicalTagFilters.delete(tag) : clinicalTagFilters.add(tag);
        renderClinicalEntries();
      });
      tagFilter.appendChild(pill);
    });
    tagFilter.style.display = '';
  } else {
    tagFilter.style.display = 'none';
  }

  // Filter + sort
  let entries = areaEntries.slice();
  const q = searchIn.value.toLowerCase().trim();
  if (q) entries = entries.filter(e =>
    e.title.toLowerCase().includes(q) ||
    (e.tags || []).some(t => t.toLowerCase().includes(q))
  );
  if (clinicalTagFilters.size) entries = entries.filter(e =>
    [...clinicalTagFilters].some(t => (e.tags || []).includes(t))
  );
  entries.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  countEl.textContent = `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`;

  entryList.innerHTML = '';
  if (!entries.length) {
    emptyEl.style.display = '';
  } else {
    emptyEl.style.display = 'none';
    entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'clinical-entry-card';
      const tagsHtml = (entry.tags || []).map(t => `<span class="clinical-tag-badge">${escHtml(t)}</span>`).join('');
      card.innerHTML = `
        <div class="clinical-entry-card-header">
          <div>
            <div class="clinical-entry-title">${escHtml(entry.title)}</div>
            <div class="clinical-entry-meta">Updated ${wlFmtTs(entry.updatedAt)}</div>
          </div>
        </div>
        ${tagsHtml ? `<div class="clinical-entry-tags">${tagsHtml}</div>` : ''}
      `;
      card.addEventListener('click', () => openClinicalEntryViewModal(entry.id));
      entryList.appendChild(card);
    });
  }
}

function showClinicalAreaMenu(area, anchor) {
  document.getElementById('clinicalAreaMenu')?.remove();
  const menu = document.createElement('div');
  menu.id = 'clinicalAreaMenu';
  menu.className = 'wrench-popup';
  menu.style.cssText = 'display:block;position:fixed;z-index:9999;';

  const renameBtn = document.createElement('button');
  renameBtn.className = 'wrench-item';
  renameBtn.textContent = 'Rename';
  renameBtn.addEventListener('click', () => {
    menu.remove();
    showClinicalRenameModal(area);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'wrench-item danger';
  deleteBtn.textContent = 'Delete area';
  deleteBtn.addEventListener('click', () => {
    menu.remove();
    const count = clinicalEntries.filter(e => e.areaId === area.id).length;
    const msg = count
      ? `Delete "${area.name}" and its ${count} entr${count === 1 ? 'y' : 'ies'}? This cannot be undone.`
      : `Delete area "${area.name}"?`;
    showConfirm(msg, async () => {
      clinicalAreas = clinicalAreas.filter(a => a.id !== area.id);
      clinicalEntries = clinicalEntries.filter(e => e.areaId !== area.id);
      saveClinicalAreas(clinicalAreas);
      await saveClinicalEntries(clinicalEntries);
      if (selectedClinicalAreaId === area.id) selectedClinicalAreaId = null;
      renderClinicalHub();
    });
  });

  menu.append(renameBtn, deleteBtn);
  document.body.appendChild(menu);
  const rect = anchor.getBoundingClientRect();
  menu.style.top = (rect.bottom + 4) + 'px';
  menu.style.left = rect.left + 'px';

  const close = e => {
    if (!menu.contains(e.target) && e.target !== anchor) {
      menu.remove();
      document.removeEventListener('click', close);
    }
  };
  setTimeout(() => document.addEventListener('click', close), 0);
}

function showClinicalRenameModal(area) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:10000;display:flex;align-items:center;justify-content:center;';
  const box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border:1px solid var(--border-light);border-radius:var(--radius);padding:20px;width:300px;display:flex;flex-direction:column;gap:12px;';
  const title = document.createElement('div');
  title.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-primary);';
  title.textContent = 'Rename area';
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'wl-search';
  inp.value = area.name;
  inp.style.fontSize = '13px';
  const btns = document.createElement('div');
  btns.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'tool-btn';
  cancelBtn.textContent = 'Cancel';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'tool-btn primary';
  saveBtn.textContent = 'Save';
  btns.append(cancelBtn, saveBtn);
  box.append(title, inp, btns);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  inp.focus(); inp.select();
  const close = () => overlay.remove();
  cancelBtn.addEventListener('click', close);
  saveBtn.addEventListener('click', () => {
    const name = inp.value.trim();
    if (!name) return;
    area.name = name;
    saveClinicalAreas(clinicalAreas);
    close();
    renderClinicalHub();
  });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn.click(); if (e.key === 'Escape') close(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function createClinicalEntryModal(editId, areaId) {
  if (editId && document.querySelector(`.wl-float-modal[data-edit-id="${CSS.escape(editId)}"]`)) return;
  const entry = editId ? clinicalEntries.find(e => e.id === editId) : null;
  const effectiveAreaId = areaId || (entry && entry.areaId) || selectedClinicalAreaId;
  const area = clinicalAreas.find(a => a.id === effectiveAreaId);

  const modal = buildWLModalShell();
  if (editId) modal.dataset.editId = editId;
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  // Area label
  const areaLabel = document.createElement('div');
  areaLabel.className = 'clinical-area-header';
  areaLabel.textContent = area ? area.name : 'Clinical Entry';

  // Header: title + close
  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const titleIn = document.createElement('input');
  titleIn.type = 'text';
  titleIn.className = 'wl-title-input';
  titleIn.placeholder = 'Entry title…';
  titleIn.value = entry ? entry.title : '';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'wl-close-btn';
  closeBtn.innerHTML = '&#x2715;';
  header.append(titleIn, closeBtn);

  // Tags row
  const tagsRow = document.createElement('div');
  tagsRow.className = 'clinical-tags-row';
  const tagsLabel = document.createElement('span');
  tagsLabel.className = 'clinical-tags-label';
  tagsLabel.textContent = 'Tags:';
  const tagsChips = document.createElement('div');
  tagsChips.className = 'clinical-tags-chips';
  let entryTags = entry ? [...(entry.tags || [])] : [];
  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.className = 'clinical-tags-input';
  tagsInput.placeholder = 'Add tag, press Enter…';
  const tagsDL = document.createElement('datalist');
  tagsDL.id = 'clinical-tags-dl-' + (editId || 'new');
  getAllKnownTags().forEach(t => { const o = document.createElement('option'); o.value = t; tagsDL.appendChild(o); });
  tagsInput.setAttribute('list', tagsDL.id);
  tagsChips.appendChild(tagsDL);

  function renderTagChips() {
    tagsChips.innerHTML = '';
    tagsChips.appendChild(tagsDL);
    entryTags.forEach((tag, i) => {
      const chip = document.createElement('span');
      chip.className = 'snip-tag-chip';
      chip.innerHTML = `${escHtml(tag)}<button class="icon-btn del" style="font-size:9px;padding:0 2px" title="Remove">&#x2715;</button>`;
      chip.querySelector('button').addEventListener('click', () => { entryTags.splice(i, 1); renderTagChips(); });
      tagsChips.appendChild(chip);
    });
    tagsChips.appendChild(tagsInput);
  }
  tagsInput.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && tagsInput.value.trim()) {
      e.preventDefault();
      const tag = tagsInput.value.trim().replace(/,$/, '');
      if (tag && !entryTags.includes(tag)) { entryTags.push(tag); renderTagChips(); }
      tagsInput.value = '';
    }
    if (e.key === 'Backspace' && !tagsInput.value && entryTags.length) {
      entryTags.pop(); renderTagChips();
    }
  });
  tagsInput.addEventListener('blur', () => {
    const tag = tagsInput.value.trim();
    if (tag && !entryTags.includes(tag)) { entryTags.push(tag); renderTagChips(); }
    tagsInput.value = '';
  });
  renderTagChips();
  tagsRow.append(tagsLabel, tagsChips);

  // Action bar + sections
  const { bar: topBar, addSectionBtn: addSectionBtnTop, copyMdBtn: copyMdBtnTop, dlMdBtn: dlMdBtnTop, saveBtn: saveBtnTop } = buildWLActionBar(true);
  const formatBar = buildWLFormatBar();
  const sectionsEl = buildWLSectionsContainer(entry, null);
  const { bar: footer, addSectionBtn, saveBtn } = buildWLActionBar(false);
  const linksSection = buildWLLinksSection(entry?.links);
  const editFooter = editId ? buildWLEditFooter({
    onDelete: async () => {
      clinicalEntries = clinicalEntries.filter(e => e.id !== editId);
      await saveClinicalEntries(clinicalEntries);
      modal._onClose = renderClinicalHub;
      closeModal();
    },
    onArchive: async () => {
      const e = clinicalEntries.find(e => e.id === editId);
      if (e) { e.archived = true; e.archivedAt = new Date().toISOString(); }
      await saveClinicalEntries(clinicalEntries);
      modal._onClose = renderClinicalHub;
      closeModal();
    },
  }) : null;

  modal.append(dragBar, areaLabel, header, tagsRow, topBar, formatBar, sectionsEl, footer, linksSection);
  if (editFooter) modal.appendChild(editFooter);
  document.body.appendChild(modal); modal._openModal?.();
  titleIn.focus();

  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }

  closeBtn.addEventListener('click', closeModal);

  async function saveModal() {
    const title = titleIn.value.trim();
    if (!title) { showToast('Enter a title.', true); return; }
    const now = new Date().toISOString();
    if (editId) {
      const existing = clinicalEntries.find(e => e.id === editId);
      if (existing) {
        existing.title = title;
        existing.tags = entryTags.slice();
        existing.sections = collectWLSections(sectionsEl);
        existing.links = linksSection._getLinks();
        existing.updatedAt = now;
      }
    } else {
      clinicalEntries.unshift({ id: crypto.randomUUID(), areaId: effectiveAreaId, title, tags: entryTags.slice(), sections: collectWLSections(sectionsEl), links: linksSection._getLinks(), createdAt: now, updatedAt: now });
    }
    await saveClinicalEntries(clinicalEntries);
    showToast('Entry saved.');
    modal._onClose = renderClinicalHub;
    closeModal();
  }

  [saveBtn, saveBtnTop].forEach(b => b.addEventListener('click', saveModal));
  [addSectionBtn, addSectionBtnTop].forEach(b => b.addEventListener('click', () => sectionsEl.appendChild(buildWLSectionEditor({ title: '', nodes: [] }))));
  modal.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveModal(); } });
  titleIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveModal(); } });
}

function openClinicalEntryViewModal(entryId) {
  if (document.querySelector(`.wl-float-modal[data-view-id="${CSS.escape(entryId)}"]`)) return;
  const entry = clinicalEntries.find(e => e.id === entryId);
  if (!entry) return;
  const area = clinicalAreas.find(a => a.id === entry.areaId);

  const modal = buildWLModalShell();
  modal.dataset.viewId = entryId;
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  // Header
  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const headerLeft = document.createElement('div');
  headerLeft.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:1;min-width:0';
  const titleEl = document.createElement('div');
  titleEl.className = 'wl-view-title';
  titleEl.textContent = entry.title;
  const metaRow = document.createElement('div');
  metaRow.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap';
  if (area) {
    const areaSpan = document.createElement('span');
    areaSpan.style.cssText = 'font-family:var(--font-mono);font-size:10px;color:var(--accent);text-transform:uppercase;letter-spacing:0.05em;';
    areaSpan.textContent = area.name;
    metaRow.appendChild(areaSpan);
  }
  (entry.tags || []).forEach(tag => {
    const t = document.createElement('span');
    t.className = 'clinical-tag-badge';
    t.textContent = tag;
    metaRow.appendChild(t);
  });
  const ts = document.createElement('span');
  ts.style.cssText = 'font-family:var(--font-mono);font-size:10px;color:var(--text-faint);margin-left:auto';
  ts.textContent = wlFmtTs(entry.updatedAt);
  metaRow.appendChild(ts);
  headerLeft.append(titleEl, metaRow);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn wl-close-btn';
  closeBtn.style.cssText = 'font-size:18px;opacity:0.6;align-self:flex-start;flex-shrink:0';
  closeBtn.innerHTML = '&#x2715;';
  header.append(headerLeft, closeBtn);

  // Sections (rendered markdown, collapsible)
  const sectionsEl = document.createElement('div');
  sectionsEl.className = 'wl-view-sections';
  (entry.sections || []).forEach((s, sIdx) => {
    const hasContent = (s.nodes || []).some(n => (n.value || '').trim() || n.type === 'image') || (s.content || '').trim();
    if (!hasContent) return;
    sectionsEl.appendChild(_buildViewSection(s, entryId, sIdx));
  });

  // Footer — Edit button right-aligned
  const footer = document.createElement('div');
  footer.className = 'wl-modal-footer';
  const editBtn = document.createElement('button');
  editBtn.className = 'tool-btn primary';
  editBtn.style.marginLeft = 'auto';
  editBtn.innerHTML = '&#9998; Edit';
  footer.appendChild(editBtn);

  modal.append(dragBar, header, sectionsEl, footer);
  document.body.appendChild(modal); modal._openModal?.();

  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  editBtn.addEventListener('click', () => { closeModal(); createClinicalEntryModal(entryId); });
}

// ── Cogito Tools ──────────────────────────────────────────────────
const COGITO_AREAS_KEY = 'rcc_cogito_areas';
let cogitoAreas = [];
let cogitoEntries = [];
let selectedCogitoAreaId = localStorage.getItem('rcc_cogito_area') || null;
let cogitoTagFilters = new Set();

function loadCogitoAreas() {
  try { return JSON.parse(localStorage.getItem(COGITO_AREAS_KEY)) || []; } catch { return []; }
}
function saveCogitoAreas(areas) {
  localStorage.setItem(COGITO_AREAS_KEY, JSON.stringify(areas));
}
async function loadCogitoEntries() {
  try {
    const idb = await _openHandleDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('cogito', 'readonly');
      const req = tx.objectStore('cogito').get('data');
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch { return []; }
}
async function saveCogitoEntries(items) {
  try {
    const idb = await _openHandleDB();
    await new Promise((resolve, reject) => {
      const tx = idb.transaction('cogito', 'readwrite');
      tx.objectStore('cogito').put(items, 'data');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    showToast('Failed to save Cogito entry: ' + e.message, true);
  }
}

function renderCogitoSidebar() {
  const list = document.getElementById('cogitoAreaList');
  if (!list) return;
  list.innerHTML = '';
  cogitoAreas.forEach(area => {
    const count = cogitoEntries.filter(e => e.areaId === area.id).length;
    const item = document.createElement('div');
    item.className = 'clinical-area-item' + (area.id === selectedCogitoAreaId ? ' active' : '');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'clinical-area-name';
    nameSpan.title = area.name;
    nameSpan.textContent = area.name;

    const menuBtn = document.createElement('button');
    menuBtn.className = 'clinical-area-menu-btn icon-btn';
    menuBtn.innerHTML = '&#8943;';
    menuBtn.title = 'Rename / Delete';
    menuBtn.addEventListener('click', e => { e.stopPropagation(); showCogitoAreaMenu(area, menuBtn); });

    item.append(nameSpan);
    if (count) {
      const countSpan = document.createElement('span');
      countSpan.className = 'clinical-area-count';
      countSpan.textContent = count;
      item.appendChild(countSpan);
    }
    item.appendChild(menuBtn);
    item.addEventListener('click', () => selectCogitoArea(area.id));
    list.appendChild(item);
  });
}

function selectCogitoArea(areaId) {
  selectedCogitoAreaId = areaId;
  localStorage.setItem('rcc_cogito_area', areaId);
  cogitoTagFilters.clear();
  renderCogitoHub();
}

function renderCogitoHub() {
  renderCogitoSidebar();
  const placeholder = document.getElementById('cogitoPlaceholder');
  const content = document.getElementById('cogitoContent');
  const addEntryBtn = document.getElementById('cogitoAddEntryBtn');
  const areaExists = selectedCogitoAreaId && cogitoAreas.find(a => a.id === selectedCogitoAreaId);
  if (!areaExists) {
    if (placeholder) placeholder.style.display = '';
    if (content) content.style.display = 'none';
    if (addEntryBtn) addEntryBtn.style.display = 'none';
    return;
  }
  if (placeholder) placeholder.style.display = 'none';
  if (content) content.style.display = '';
  if (addEntryBtn) addEntryBtn.style.display = '';
  renderCogitoEntries();
}

function renderCogitoEntries() {
  const area = cogitoAreas.find(a => a.id === selectedCogitoAreaId);
  if (!area) return;
  const toolbar = document.getElementById('cogitoToolbar');
  const tagFilter = document.getElementById('cogitoTagFilter');
  const entryList = document.getElementById('cogitoEntryList');
  const emptyEl = document.getElementById('cogitoEmpty');
  if (!toolbar || !entryList) return;

  const prevSearch = toolbar.querySelector('.clinical-search')?.value || '';

  // Rebuild toolbar
  toolbar.innerHTML = '';
  const searchIn = document.createElement('input');
  searchIn.type = 'text';
  searchIn.className = 'wl-search clinical-search';
  searchIn.placeholder = `Search ${escHtml(area.name)}…`;
  searchIn.value = prevSearch;
  searchIn.addEventListener('input', renderCogitoEntries);
  const countEl = document.createElement('span');
  countEl.style.cssText = 'font-family:var(--font-mono);font-size:11px;color:var(--text-faint);white-space:nowrap;margin-left:auto;';
  toolbar.append(searchIn, countEl);

  // Tag filter pills
  const areaEntries = cogitoEntries.filter(e => e.areaId === selectedCogitoAreaId && !e.archived);
  const allTags = [...new Set(areaEntries.flatMap(e => e.tags || []))].sort();
  tagFilter.innerHTML = '';
  if (allTags.length) {
    const lbl = document.createElement('span');
    lbl.className = 'clinical-tag-filter-label';
    lbl.textContent = 'Tags:';
    tagFilter.appendChild(lbl);
    allTags.forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'clinical-tag-pill' + (cogitoTagFilters.has(tag) ? ' active' : '');
      pill.textContent = tag;
      pill.addEventListener('click', () => {
        cogitoTagFilters.has(tag) ? cogitoTagFilters.delete(tag) : cogitoTagFilters.add(tag);
        renderCogitoEntries();
      });
      tagFilter.appendChild(pill);
    });
    tagFilter.style.display = '';
  } else {
    tagFilter.style.display = 'none';
  }

  // Filter + sort
  let entries = areaEntries.slice();
  const q = searchIn.value.toLowerCase().trim();
  if (q) entries = entries.filter(e =>
    e.title.toLowerCase().includes(q) ||
    (e.tags || []).some(t => t.toLowerCase().includes(q))
  );
  if (cogitoTagFilters.size) entries = entries.filter(e =>
    [...cogitoTagFilters].some(t => (e.tags || []).includes(t))
  );
  entries.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  countEl.textContent = `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`;

  entryList.innerHTML = '';
  if (!entries.length) {
    emptyEl.style.display = '';
  } else {
    emptyEl.style.display = 'none';
    entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'clinical-entry-card';
      const tagsHtml = (entry.tags || []).map(t => `<span class="clinical-tag-badge">${escHtml(t)}</span>`).join('');
      card.innerHTML = `
        <div class="clinical-entry-card-header">
          <div>
            <div class="clinical-entry-title">${escHtml(entry.title)}</div>
            <div class="clinical-entry-meta">Updated ${wlFmtTs(entry.updatedAt)}</div>
          </div>
        </div>
        ${tagsHtml ? `<div class="clinical-entry-tags">${tagsHtml}</div>` : ''}
      `;
      card.addEventListener('click', () => openCogitoEntryViewModal(entry.id));
      entryList.appendChild(card);
    });
  }
}

function showCogitoAreaMenu(area, anchor) {
  document.getElementById('cogitoAreaMenu')?.remove();
  const menu = document.createElement('div');
  menu.id = 'cogitoAreaMenu';
  menu.className = 'wrench-popup';
  menu.style.cssText = 'display:block;position:fixed;z-index:9999;';

  const renameBtn = document.createElement('button');
  renameBtn.className = 'wrench-item';
  renameBtn.textContent = 'Rename';
  renameBtn.addEventListener('click', () => {
    menu.remove();
    showCogitoRenameModal(area);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'wrench-item danger';
  deleteBtn.textContent = 'Delete area';
  deleteBtn.addEventListener('click', () => {
    menu.remove();
    const count = cogitoEntries.filter(e => e.areaId === area.id).length;
    const msg = count
      ? `Delete "${area.name}" and its ${count} entr${count === 1 ? 'y' : 'ies'}? This cannot be undone.`
      : `Delete area "${area.name}"?`;
    showConfirm(msg, async () => {
      cogitoAreas = cogitoAreas.filter(a => a.id !== area.id);
      cogitoEntries = cogitoEntries.filter(e => e.areaId !== area.id);
      saveCogitoAreas(cogitoAreas);
      await saveCogitoEntries(cogitoEntries);
      if (selectedCogitoAreaId === area.id) selectedCogitoAreaId = null;
      renderCogitoHub();
    });
  });

  menu.append(renameBtn, deleteBtn);
  document.body.appendChild(menu);
  const rect = anchor.getBoundingClientRect();
  menu.style.top = (rect.bottom + 4) + 'px';
  menu.style.left = rect.left + 'px';

  const close = e => {
    if (!menu.contains(e.target) && e.target !== anchor) {
      menu.remove();
      document.removeEventListener('click', close);
    }
  };
  setTimeout(() => document.addEventListener('click', close), 0);
}

function showCogitoRenameModal(area) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:10000;display:flex;align-items:center;justify-content:center;';
  const box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border:1px solid var(--border-light);border-radius:var(--radius);padding:20px;width:300px;display:flex;flex-direction:column;gap:12px;';
  const title = document.createElement('div');
  title.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-primary);';
  title.textContent = 'Rename area';
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'wl-search';
  inp.value = area.name;
  inp.style.fontSize = '13px';
  const btns = document.createElement('div');
  btns.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'tool-btn';
  cancelBtn.textContent = 'Cancel';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'tool-btn primary';
  saveBtn.textContent = 'Save';
  btns.append(cancelBtn, saveBtn);
  box.append(title, inp, btns);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  inp.focus(); inp.select();
  const close = () => overlay.remove();
  cancelBtn.addEventListener('click', close);
  saveBtn.addEventListener('click', () => {
    const name = inp.value.trim();
    if (!name) return;
    area.name = name;
    saveCogitoAreas(cogitoAreas);
    close();
    renderCogitoHub();
  });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn.click(); if (e.key === 'Escape') close(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function createCogitoEntryModal(editId, areaId) {
  if (editId && document.querySelector(`.wl-float-modal[data-edit-id="${CSS.escape(editId)}"]`)) return;
  const entry = editId ? cogitoEntries.find(e => e.id === editId) : null;
  const effectiveAreaId = areaId || (entry && entry.areaId) || selectedCogitoAreaId;
  const area = cogitoAreas.find(a => a.id === effectiveAreaId);

  const modal = buildWLModalShell();
  if (editId) modal.dataset.editId = editId;
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  // Area label
  const areaLabel = document.createElement('div');
  areaLabel.className = 'clinical-area-header';
  areaLabel.textContent = area ? area.name : 'Cogito Entry';

  // Header: title + close
  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const titleIn = document.createElement('input');
  titleIn.type = 'text';
  titleIn.className = 'wl-title-input';
  titleIn.placeholder = 'Entry title…';
  titleIn.value = entry ? entry.title : '';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'wl-close-btn';
  closeBtn.innerHTML = '&#x2715;';
  header.append(titleIn, closeBtn);

  // Tags row
  const tagsRow = document.createElement('div');
  tagsRow.className = 'clinical-tags-row';
  const tagsLabel = document.createElement('span');
  tagsLabel.className = 'clinical-tags-label';
  tagsLabel.textContent = 'Tags:';
  const tagsChips = document.createElement('div');
  tagsChips.className = 'clinical-tags-chips';
  let entryTags = entry ? [...(entry.tags || [])] : [];
  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.className = 'clinical-tags-input';
  tagsInput.placeholder = 'Add tag, press Enter…';
  const tagsDL = document.createElement('datalist');
  tagsDL.id = 'cogito-tags-dl-' + (editId || 'new');
  getAllKnownTags().forEach(t => { const o = document.createElement('option'); o.value = t; tagsDL.appendChild(o); });
  tagsInput.setAttribute('list', tagsDL.id);
  tagsChips.appendChild(tagsDL);

  function renderTagChips() {
    tagsChips.innerHTML = '';
    tagsChips.appendChild(tagsDL);
    entryTags.forEach((tag, i) => {
      const chip = document.createElement('span');
      chip.className = 'snip-tag-chip';
      chip.innerHTML = `${escHtml(tag)}<button class="icon-btn del" style="font-size:9px;padding:0 2px" title="Remove">&#x2715;</button>`;
      chip.querySelector('button').addEventListener('click', () => { entryTags.splice(i, 1); renderTagChips(); });
      tagsChips.appendChild(chip);
    });
    tagsChips.appendChild(tagsInput);
  }
  tagsInput.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && tagsInput.value.trim()) {
      e.preventDefault();
      const tag = tagsInput.value.trim().replace(/,$/, '');
      if (tag && !entryTags.includes(tag)) { entryTags.push(tag); renderTagChips(); }
      tagsInput.value = '';
    }
    if (e.key === 'Backspace' && !tagsInput.value && entryTags.length) {
      entryTags.pop(); renderTagChips();
    }
  });
  tagsInput.addEventListener('blur', () => {
    const tag = tagsInput.value.trim();
    if (tag && !entryTags.includes(tag)) { entryTags.push(tag); renderTagChips(); }
    tagsInput.value = '';
  });
  renderTagChips();
  tagsRow.append(tagsLabel, tagsChips);

  // Action bar + sections
  const { bar: topBar, addSectionBtn: addSectionBtnTop, copyMdBtn: copyMdBtnTop, dlMdBtn: dlMdBtnTop, saveBtn: saveBtnTop } = buildWLActionBar(true);
  const formatBar = buildWLFormatBar();
  const sectionsEl = buildWLSectionsContainer(entry, null);
  const { bar: footer, addSectionBtn, saveBtn } = buildWLActionBar(false);
  const linksSection = buildWLLinksSection(entry?.links);
  const editFooter = editId ? buildWLEditFooter({
    onDelete: async () => {
      cogitoEntries = cogitoEntries.filter(e => e.id !== editId);
      await saveCogitoEntries(cogitoEntries);
      modal._onClose = renderCogitoHub;
      closeModal();
    },
    onArchive: async () => {
      const e = cogitoEntries.find(e => e.id === editId);
      if (e) { e.archived = true; e.archivedAt = new Date().toISOString(); }
      await saveCogitoEntries(cogitoEntries);
      modal._onClose = renderCogitoHub;
      closeModal();
    },
  }) : null;

  modal.append(dragBar, areaLabel, header, tagsRow, topBar, formatBar, sectionsEl, footer, linksSection);
  if (editFooter) modal.appendChild(editFooter);
  document.body.appendChild(modal); modal._openModal?.();
  titleIn.focus();

  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }

  closeBtn.addEventListener('click', closeModal);

  async function saveModal() {
    const title = titleIn.value.trim();
    if (!title) { showToast('Enter a title.', true); return; }
    const now = new Date().toISOString();
    if (editId) {
      const existing = cogitoEntries.find(e => e.id === editId);
      if (existing) { existing.title = title; existing.tags = entryTags.slice(); existing.sections = collectWLSections(sectionsEl); existing.links = linksSection._getLinks(); existing.updatedAt = now; }
    } else {
      cogitoEntries.unshift({ id: crypto.randomUUID(), areaId: effectiveAreaId, title, tags: entryTags.slice(), sections: collectWLSections(sectionsEl), links: linksSection._getLinks(), createdAt: now, updatedAt: now });
    }
    await saveCogitoEntries(cogitoEntries);
    showToast('Entry saved.');
    modal._onClose = renderCogitoHub;
    closeModal();
  }

  [saveBtn, saveBtnTop].forEach(b => b.addEventListener('click', saveModal));
  [addSectionBtn, addSectionBtnTop].forEach(b => b.addEventListener('click', () => sectionsEl.appendChild(buildWLSectionEditor({ title: '', nodes: [] }))));
  modal.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveModal(); } });
  titleIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveModal(); } });
}

function openCogitoEntryViewModal(entryId) {
  if (document.querySelector(`.wl-float-modal[data-view-id="${CSS.escape(entryId)}"]`)) return;
  const entry = cogitoEntries.find(e => e.id === entryId);
  if (!entry) return;
  const area = cogitoAreas.find(a => a.id === entry.areaId);

  const modal = buildWLModalShell();
  modal.dataset.viewId = entryId;
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  // Header
  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const headerLeft = document.createElement('div');
  headerLeft.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:1;min-width:0';
  const titleEl = document.createElement('div');
  titleEl.className = 'wl-view-title';
  titleEl.textContent = entry.title;
  const metaRow = document.createElement('div');
  metaRow.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap';
  if (area) {
    const areaSpan = document.createElement('span');
    areaSpan.style.cssText = 'font-family:var(--font-mono);font-size:10px;color:var(--accent);text-transform:uppercase;letter-spacing:0.05em;';
    areaSpan.textContent = area.name;
    metaRow.appendChild(areaSpan);
  }
  (entry.tags || []).forEach(tag => {
    const t = document.createElement('span');
    t.className = 'clinical-tag-badge';
    t.textContent = tag;
    metaRow.appendChild(t);
  });
  const ts = document.createElement('span');
  ts.style.cssText = 'font-family:var(--font-mono);font-size:10px;color:var(--text-faint);margin-left:auto';
  ts.textContent = wlFmtTs(entry.updatedAt);
  metaRow.appendChild(ts);
  headerLeft.append(titleEl, metaRow);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn wl-close-btn';
  closeBtn.style.cssText = 'font-size:18px;opacity:0.6;align-self:flex-start;flex-shrink:0';
  closeBtn.innerHTML = '&#x2715;';
  header.append(headerLeft, closeBtn);

  // Sections (rendered markdown, collapsible)
  const sectionsEl = document.createElement('div');
  sectionsEl.className = 'wl-view-sections';
  (entry.sections || []).forEach((s, sIdx) => {
    const hasContent = (s.nodes || []).some(n => (n.value || '').trim() || n.type === 'image') || (s.content || '').trim();
    if (!hasContent) return;
    sectionsEl.appendChild(_buildViewSection(s, entryId, sIdx));
  });

  // Footer — Edit right-aligned
  const footer = document.createElement('div');
  footer.className = 'wl-modal-footer';
  const editBtn = document.createElement('button');
  editBtn.className = 'tool-btn primary';
  editBtn.style.marginLeft = 'auto';
  editBtn.innerHTML = '&#9998; Edit';
  footer.appendChild(editBtn);

  modal.append(dragBar, header, sectionsEl, footer);
  document.body.appendChild(modal); modal._openModal?.();

  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  editBtn.addEventListener('click', () => { closeModal(); createCogitoEntryModal(entryId); });
}

// ── Requests & Processes ──────────────────────────────────────────
const REQPROC_AREAS_KEY = 'rcc_reqproc_areas';
let reqprocAreas = [];
let reqprocEntries = [];
let selectedReqprocAreaId = localStorage.getItem('rcc_reqproc_area') || null;
let reqprocTagFilters = new Set();

function loadReqprocAreas() {
  try { return JSON.parse(localStorage.getItem(REQPROC_AREAS_KEY)) || []; } catch { return []; }
}
function saveReqprocAreas(areas) {
  localStorage.setItem(REQPROC_AREAS_KEY, JSON.stringify(areas));
}
async function loadReqprocEntries() {
  try {
    const idb = await _openHandleDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('reqproc', 'readonly');
      const req = tx.objectStore('reqproc').get('data');
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch { return []; }
}
async function saveReqprocEntries(items) {
  try {
    const idb = await _openHandleDB();
    await new Promise((resolve, reject) => {
      const tx = idb.transaction('reqproc', 'readwrite');
      tx.objectStore('reqproc').put(items, 'data');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    showToast('Failed to save entry: ' + e.message, true);
  }
}

function renderReqprocSidebar() {
  const list = document.getElementById('reqprocAreaList');
  if (!list) return;
  list.innerHTML = '';
  reqprocAreas.forEach(area => {
    const count = reqprocEntries.filter(e => e.areaId === area.id).length;
    const item = document.createElement('div');
    item.className = 'clinical-area-item' + (area.id === selectedReqprocAreaId ? ' active' : '');
    const nameSpan = document.createElement('span');
    nameSpan.className = 'clinical-area-name';
    nameSpan.title = area.name;
    nameSpan.textContent = area.name;
    const menuBtn = document.createElement('button');
    menuBtn.className = 'clinical-area-menu-btn icon-btn';
    menuBtn.innerHTML = '&#8943;';
    menuBtn.title = 'Rename / Delete';
    menuBtn.addEventListener('click', e => { e.stopPropagation(); showReqprocAreaMenu(area, menuBtn); });
    item.append(nameSpan);
    if (count) {
      const countSpan = document.createElement('span');
      countSpan.className = 'clinical-area-count';
      countSpan.textContent = count;
      item.appendChild(countSpan);
    }
    item.appendChild(menuBtn);
    item.addEventListener('click', () => selectReqprocArea(area.id));
    list.appendChild(item);
  });
}

function selectReqprocArea(areaId) {
  selectedReqprocAreaId = areaId;
  localStorage.setItem('rcc_reqproc_area', areaId);
  reqprocTagFilters.clear();
  renderReqprocHub();
}

function renderReqprocHub() {
  renderReqprocSidebar();
  const placeholder = document.getElementById('reqprocPlaceholder');
  const content = document.getElementById('reqprocContent');
  const addEntryBtn = document.getElementById('reqprocAddEntryBtn');
  const areaExists = selectedReqprocAreaId && reqprocAreas.find(a => a.id === selectedReqprocAreaId);
  if (!areaExists) {
    if (placeholder) placeholder.style.display = '';
    if (content) content.style.display = 'none';
    if (addEntryBtn) addEntryBtn.style.display = 'none';
    return;
  }
  if (placeholder) placeholder.style.display = 'none';
  if (content) content.style.display = '';
  if (addEntryBtn) addEntryBtn.style.display = '';
  renderReqprocEntries();
}

function renderReqprocEntries() {
  const area = reqprocAreas.find(a => a.id === selectedReqprocAreaId);
  if (!area) return;
  const toolbar = document.getElementById('reqprocToolbar');
  const tagFilter = document.getElementById('reqprocTagFilter');
  const entryList = document.getElementById('reqprocEntryList');
  const emptyEl = document.getElementById('reqprocEmpty');
  if (!toolbar || !entryList) return;
  const prevSearch = toolbar.querySelector('.clinical-search')?.value || '';
  toolbar.innerHTML = '';
  const searchIn = document.createElement('input');
  searchIn.type = 'text';
  searchIn.className = 'wl-search clinical-search';
  searchIn.placeholder = `Search ${escHtml(area.name)}…`;
  searchIn.value = prevSearch;
  searchIn.addEventListener('input', renderReqprocEntries);
  const countEl = document.createElement('span');
  countEl.style.cssText = 'font-family:var(--font-mono);font-size:11px;color:var(--text-faint);white-space:nowrap;margin-left:auto;';
  toolbar.append(searchIn, countEl);
  const areaEntries = reqprocEntries.filter(e => e.areaId === selectedReqprocAreaId && !e.archived);
  const allTags = [...new Set(areaEntries.flatMap(e => e.tags || []))].sort();
  tagFilter.innerHTML = '';
  if (allTags.length) {
    const lbl = document.createElement('span');
    lbl.className = 'clinical-tag-filter-label';
    lbl.textContent = 'Tags:';
    tagFilter.appendChild(lbl);
    allTags.forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'clinical-tag-pill' + (reqprocTagFilters.has(tag) ? ' active' : '');
      pill.textContent = tag;
      pill.addEventListener('click', () => {
        reqprocTagFilters.has(tag) ? reqprocTagFilters.delete(tag) : reqprocTagFilters.add(tag);
        renderReqprocEntries();
      });
      tagFilter.appendChild(pill);
    });
    tagFilter.style.display = '';
  } else {
    tagFilter.style.display = 'none';
  }
  let entries = areaEntries.slice();
  const q = searchIn.value.toLowerCase().trim();
  if (q) entries = entries.filter(e =>
    e.title.toLowerCase().includes(q) || (e.tags || []).some(t => t.toLowerCase().includes(q))
  );
  if (reqprocTagFilters.size) entries = entries.filter(e =>
    [...reqprocTagFilters].some(t => (e.tags || []).includes(t))
  );
  entries.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  countEl.textContent = `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`;
  entryList.innerHTML = '';
  if (!entries.length) {
    emptyEl.style.display = '';
  } else {
    emptyEl.style.display = 'none';
    entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'clinical-entry-card';
      const tagsHtml = (entry.tags || []).map(t => `<span class="clinical-tag-badge">${escHtml(t)}</span>`).join('');
      card.innerHTML = `
        <div class="clinical-entry-card-header">
          <div>
            <div class="clinical-entry-title">${escHtml(entry.title)}</div>
            <div class="clinical-entry-meta">Updated ${wlFmtTs(entry.updatedAt)}</div>
          </div>
        </div>
        ${tagsHtml ? `<div class="clinical-entry-tags">${tagsHtml}</div>` : ''}
      `;
      card.addEventListener('click', () => openReqprocEntryViewModal(entry.id));
      entryList.appendChild(card);
    });
  }
}

function showReqprocAreaMenu(area, anchor) {
  document.getElementById('reqprocAreaMenu')?.remove();
  const menu = document.createElement('div');
  menu.id = 'reqprocAreaMenu';
  menu.className = 'wrench-popup';
  menu.style.cssText = 'display:block;position:fixed;z-index:9999;';
  const renameBtn = document.createElement('button');
  renameBtn.className = 'wrench-item';
  renameBtn.textContent = 'Rename';
  renameBtn.addEventListener('click', () => { menu.remove(); showReqprocRenameModal(area); });
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'wrench-item danger';
  deleteBtn.textContent = 'Delete area';
  deleteBtn.addEventListener('click', () => {
    menu.remove();
    const count = reqprocEntries.filter(e => e.areaId === area.id).length;
    showConfirm(
      count ? `Delete "${area.name}" and its ${count} entr${count === 1 ? 'y' : 'ies'}? This cannot be undone.` : `Delete area "${area.name}"?`,
      async () => {
        reqprocAreas = reqprocAreas.filter(a => a.id !== area.id);
        reqprocEntries = reqprocEntries.filter(e => e.areaId !== area.id);
        saveReqprocAreas(reqprocAreas);
        await saveReqprocEntries(reqprocEntries);
        if (selectedReqprocAreaId === area.id) selectedReqprocAreaId = null;
        renderReqprocHub();
      }
    );
  });
  menu.append(renameBtn, deleteBtn);
  document.body.appendChild(menu);
  const rect = anchor.getBoundingClientRect();
  menu.style.top = (rect.bottom + 4) + 'px';
  menu.style.left = rect.left + 'px';
  const close = e => {
    if (!menu.contains(e.target) && e.target !== anchor) { menu.remove(); document.removeEventListener('click', close); }
  };
  setTimeout(() => document.addEventListener('click', close), 0);
}

function showReqprocRenameModal(area) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:10000;display:flex;align-items:center;justify-content:center;';
  const box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border:1px solid var(--border-light);border-radius:var(--radius);padding:20px;width:300px;display:flex;flex-direction:column;gap:12px;';
  const title = document.createElement('div');
  title.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-primary);';
  title.textContent = 'Rename area';
  const inp = document.createElement('input');
  inp.type = 'text'; inp.className = 'wl-search'; inp.value = area.name; inp.style.fontSize = '13px';
  const btns = document.createElement('div');
  btns.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';
  const cancelBtn = document.createElement('button'); cancelBtn.className = 'tool-btn'; cancelBtn.textContent = 'Cancel';
  const saveBtn = document.createElement('button'); saveBtn.className = 'tool-btn primary'; saveBtn.textContent = 'Save';
  btns.append(cancelBtn, saveBtn);
  box.append(title, inp, btns);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  inp.focus(); inp.select();
  const close = () => overlay.remove();
  cancelBtn.addEventListener('click', close);
  saveBtn.addEventListener('click', () => { const name = inp.value.trim(); if (!name) return; area.name = name; saveReqprocAreas(reqprocAreas); close(); renderReqprocHub(); });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn.click(); if (e.key === 'Escape') close(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function createReqprocEntryModal(editId, areaId) {
  if (editId && document.querySelector(`.wl-float-modal[data-edit-id="${CSS.escape(editId)}"]`)) return;
  const entry = editId ? reqprocEntries.find(e => e.id === editId) : null;
  const effectiveAreaId = areaId || (entry && entry.areaId) || selectedReqprocAreaId;
  const area = reqprocAreas.find(a => a.id === effectiveAreaId);
  const modal = buildWLModalShell();
  if (editId) modal.dataset.editId = editId;
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';
  const areaLabel = document.createElement('div');
  areaLabel.className = 'clinical-area-header';
  areaLabel.textContent = area ? area.name : 'Entry';
  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const titleIn = document.createElement('input');
  titleIn.type = 'text'; titleIn.className = 'wl-title-input'; titleIn.placeholder = 'Entry title…'; titleIn.value = entry ? entry.title : '';
  const closeBtn = document.createElement('button'); closeBtn.className = 'wl-close-btn'; closeBtn.innerHTML = '&#x2715;';
  header.append(titleIn, closeBtn);
  const tagsRow = document.createElement('div'); tagsRow.className = 'clinical-tags-row';
  const tagsLabel = document.createElement('span'); tagsLabel.className = 'clinical-tags-label'; tagsLabel.textContent = 'Tags:';
  const tagsChips = document.createElement('div'); tagsChips.className = 'clinical-tags-chips';
  let entryTags = entry ? [...(entry.tags || [])] : [];
  const tagsInput = document.createElement('input'); tagsInput.type = 'text'; tagsInput.className = 'clinical-tags-input'; tagsInput.placeholder = 'Add tag, press Enter…';
  const tagsDL = document.createElement('datalist');
  tagsDL.id = 'reqproc-tags-dl-' + (editId || 'new');
  getAllKnownTags().forEach(t => { const o = document.createElement('option'); o.value = t; tagsDL.appendChild(o); });
  tagsInput.setAttribute('list', tagsDL.id);
  tagsChips.appendChild(tagsDL);
  function renderTagChips() {
    tagsChips.innerHTML = '';
    tagsChips.appendChild(tagsDL);
    entryTags.forEach((tag, i) => {
      const chip = document.createElement('span'); chip.className = 'snip-tag-chip';
      chip.innerHTML = `${escHtml(tag)}<button class="icon-btn del" style="font-size:9px;padding:0 2px" title="Remove">&#x2715;</button>`;
      chip.querySelector('button').addEventListener('click', () => { entryTags.splice(i, 1); renderTagChips(); });
      tagsChips.appendChild(chip);
    });
    tagsChips.appendChild(tagsInput);
  }
  tagsInput.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && tagsInput.value.trim()) {
      e.preventDefault();
      const tag = tagsInput.value.trim().replace(/,$/, '');
      if (tag && !entryTags.includes(tag)) { entryTags.push(tag); renderTagChips(); }
      tagsInput.value = '';
    }
    if (e.key === 'Backspace' && !tagsInput.value && entryTags.length) { entryTags.pop(); renderTagChips(); }
  });
  tagsInput.addEventListener('blur', () => {
    const tag = tagsInput.value.trim();
    if (tag && !entryTags.includes(tag)) { entryTags.push(tag); renderTagChips(); }
    tagsInput.value = '';
  });
  renderTagChips();
  tagsRow.append(tagsLabel, tagsChips);
  const { bar: topBar, addSectionBtn: addSectionBtnTop, saveBtn: saveBtnTop } = buildWLActionBar(true);
  const formatBar = buildWLFormatBar();
  const sectionsEl = buildWLSectionsContainer(entry, null);
  const { bar: footer, addSectionBtn, saveBtn } = buildWLActionBar(false);
  const linksSection = buildWLLinksSection(entry?.links);
  const editFooter = editId ? buildWLEditFooter({
    onDelete: async () => {
      reqprocEntries = reqprocEntries.filter(e => e.id !== editId);
      await saveReqprocEntries(reqprocEntries);
      modal._onClose = renderReqprocHub;
      closeModal();
    },
    onArchive: async () => {
      const e = reqprocEntries.find(e => e.id === editId);
      if (e) { e.archived = true; e.archivedAt = new Date().toISOString(); }
      await saveReqprocEntries(reqprocEntries);
      modal._onClose = renderReqprocHub;
      closeModal();
    },
  }) : null;
  modal.append(dragBar, areaLabel, header, tagsRow, topBar, formatBar, sectionsEl, footer, linksSection);
  if (editFooter) modal.appendChild(editFooter);
  document.body.appendChild(modal); modal._openModal?.();
  titleIn.focus();
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }
  closeBtn.addEventListener('click', closeModal);
  async function saveModal() {
    const title = titleIn.value.trim();
    if (!title) { showToast('Enter a title.', true); return; }
    const now = new Date().toISOString();
    if (editId) {
      const existing = reqprocEntries.find(e => e.id === editId);
      if (existing) { existing.title = title; existing.tags = entryTags.slice(); existing.sections = collectWLSections(sectionsEl); existing.links = linksSection._getLinks(); existing.updatedAt = now; }
    } else {
      reqprocEntries.unshift({ id: crypto.randomUUID(), areaId: effectiveAreaId, title, tags: entryTags.slice(), sections: collectWLSections(sectionsEl), links: linksSection._getLinks(), createdAt: now, updatedAt: now });
    }
    await saveReqprocEntries(reqprocEntries);
    showToast('Entry saved.');
    modal._onClose = renderReqprocHub;
    closeModal();
  }
  [saveBtn, saveBtnTop].forEach(b => b.addEventListener('click', saveModal));
  [addSectionBtn, addSectionBtnTop].forEach(b => b.addEventListener('click', () => sectionsEl.appendChild(buildWLSectionEditor({ title: '', nodes: [] }))));
  modal.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveModal(); } });
  titleIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveModal(); } });
}

function openReqprocEntryViewModal(entryId) {
  if (document.querySelector(`.wl-float-modal[data-view-id="${CSS.escape(entryId)}"]`)) return;
  const entry = reqprocEntries.find(e => e.id === entryId);
  if (!entry) return;
  const area = reqprocAreas.find(a => a.id === entry.areaId);
  const modal = buildWLModalShell();
  modal.dataset.viewId = entryId;
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';
  const header = document.createElement('div'); header.className = 'wl-modal-header';
  const headerLeft = document.createElement('div'); headerLeft.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:1;min-width:0';
  const titleEl = document.createElement('div'); titleEl.className = 'wl-view-title'; titleEl.textContent = entry.title;
  const metaRow = document.createElement('div'); metaRow.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap';
  if (area) {
    const areaSpan = document.createElement('span');
    areaSpan.style.cssText = 'font-family:var(--font-mono);font-size:10px;color:var(--accent);text-transform:uppercase;letter-spacing:0.05em;';
    areaSpan.textContent = area.name; metaRow.appendChild(areaSpan);
  }
  (entry.tags || []).forEach(tag => { const t = document.createElement('span'); t.className = 'clinical-tag-badge'; t.textContent = tag; metaRow.appendChild(t); });
  const ts = document.createElement('span'); ts.style.cssText = 'font-family:var(--font-mono);font-size:10px;color:var(--text-faint);margin-left:auto'; ts.textContent = wlFmtTs(entry.updatedAt); metaRow.appendChild(ts);
  headerLeft.append(titleEl, metaRow);
  const closeBtn = document.createElement('button'); closeBtn.className = 'icon-btn wl-close-btn'; closeBtn.style.cssText = 'font-size:18px;opacity:0.6;align-self:flex-start;flex-shrink:0'; closeBtn.innerHTML = '&#x2715;';
  header.append(headerLeft, closeBtn);
  const sectionsEl = document.createElement('div'); sectionsEl.className = 'wl-view-sections';
  (entry.sections || []).forEach((s, sIdx) => {
    const hasContent = (s.nodes || []).some(n => (n.value || '').trim() || n.type === 'image') || (s.content || '').trim();
    if (!hasContent) return;
    sectionsEl.appendChild(_buildViewSection(s, entryId, sIdx));
  });
  const footer = document.createElement('div'); footer.className = 'wl-modal-footer';
  const editBtn = document.createElement('button'); editBtn.className = 'tool-btn primary';
  editBtn.style.marginLeft = 'auto'; editBtn.innerHTML = '&#9998; Edit';
  footer.appendChild(editBtn);
  modal.append(dragBar, header, sectionsEl, footer);
  document.body.appendChild(modal); modal._openModal?.();
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  editBtn.addEventListener('click', () => { closeModal(); createReqprocEntryModal(entryId); });
}

// ── Trust Analytics ────────────────────────────────────────────────
const TRUSTANALYTICS_AREAS_KEY = 'rcc_trustanalytics_areas';
let trustanalyticsAreas = [];
let trustanalyticsEntries = [];
let selectedTrustanalyticsAreaId = localStorage.getItem('rcc_trustanalytics_area') || null;
let trustanalyticsTagFilters = new Set();

// ── Guides / Snippets / Databases sidebar categories ──────────────
const GUIDES_AREAS_KEY    = 'rcc_guides_areas';
const SNIPPETS_AREAS_KEY  = 'rcc_snippets_areas';
const DATABASES_AREAS_KEY = 'rcc_databases_areas';
let guidesAreas    = [];
let snippetsAreas  = [];
let databasesAreas = [];
let selectedGuidesAreaId    = localStorage.getItem('rcc_guides_area')    || '__all__';
let selectedSnippetsAreaId  = localStorage.getItem('rcc_snippets_area')  || '__all__';
let selectedDatabasesAreaId = localStorage.getItem('rcc_databases_area') || '__all__';
let guidesTagFilters    = new Set();
let snippetsTagFilters  = new Set();

function loadTrustanalyticsAreas() {
  try { return JSON.parse(localStorage.getItem(TRUSTANALYTICS_AREAS_KEY)) || []; } catch { return []; }
}
function saveTrustanalyticsAreas(areas) {
  localStorage.setItem(TRUSTANALYTICS_AREAS_KEY, JSON.stringify(areas));
}
async function loadTrustanalyticsEntries() {
  try {
    const idb = await _openHandleDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('trustanalytics', 'readonly');
      const req = tx.objectStore('trustanalytics').get('data');
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch { return []; }
}
async function saveTrustanalyticsEntries(items) {
  try {
    const idb = await _openHandleDB();
    await new Promise((resolve, reject) => {
      const tx = idb.transaction('trustanalytics', 'readwrite');
      tx.objectStore('trustanalytics').put(items, 'data');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    showToast('Failed to save entry: ' + e.message, true);
  }
}

function loadGuidesAreas()      { try { return JSON.parse(localStorage.getItem(GUIDES_AREAS_KEY))    || []; } catch { return []; } }
function saveGuidesAreas(a)     { localStorage.setItem(GUIDES_AREAS_KEY,    JSON.stringify(a)); }
function loadSnippetsAreas()    { try { return JSON.parse(localStorage.getItem(SNIPPETS_AREAS_KEY))  || []; } catch { return []; } }
function saveSnippetsAreas(a)   { localStorage.setItem(SNIPPETS_AREAS_KEY,  JSON.stringify(a)); }
function loadDatabasesAreas()   { try { return JSON.parse(localStorage.getItem(DATABASES_AREAS_KEY)) || []; } catch { return []; } }
function saveDatabasesAreas(a)  { localStorage.setItem(DATABASES_AREAS_KEY, JSON.stringify(a)); }

function renderTrustanalyticsSidebar() {
  const list = document.getElementById('trustanalyticsAreaList');
  if (!list) return;
  list.innerHTML = '';
  trustanalyticsAreas.forEach(area => {
    const count = trustanalyticsEntries.filter(e => e.areaId === area.id).length;
    const item = document.createElement('div');
    item.className = 'clinical-area-item' + (area.id === selectedTrustanalyticsAreaId ? ' active' : '');
    const nameSpan = document.createElement('span'); nameSpan.className = 'clinical-area-name'; nameSpan.title = area.name; nameSpan.textContent = area.name;
    const menuBtn = document.createElement('button'); menuBtn.className = 'clinical-area-menu-btn icon-btn'; menuBtn.innerHTML = '&#8943;'; menuBtn.title = 'Rename / Delete';
    menuBtn.addEventListener('click', e => { e.stopPropagation(); showTrustanalyticsAreaMenu(area, menuBtn); });
    item.append(nameSpan);
    if (count) { const countSpan = document.createElement('span'); countSpan.className = 'clinical-area-count'; countSpan.textContent = count; item.appendChild(countSpan); }
    item.appendChild(menuBtn);
    item.addEventListener('click', () => selectTrustanalyticsArea(area.id));
    list.appendChild(item);
  });
}

function selectTrustanalyticsArea(areaId) {
  selectedTrustanalyticsAreaId = areaId;
  localStorage.setItem('rcc_trustanalytics_area', areaId);
  trustanalyticsTagFilters.clear();
  renderTrustanalyticsHub();
}

function renderTrustanalyticsHub() {
  renderTrustanalyticsSidebar();
  const placeholder = document.getElementById('trustanalyticsPlaceholder');
  const content = document.getElementById('trustanalyticsContent');
  const addEntryBtn = document.getElementById('trustanalyticsAddEntryBtn');
  const areaExists = selectedTrustanalyticsAreaId && trustanalyticsAreas.find(a => a.id === selectedTrustanalyticsAreaId);
  if (!areaExists) {
    if (placeholder) placeholder.style.display = '';
    if (content) content.style.display = 'none';
    if (addEntryBtn) addEntryBtn.style.display = 'none';
    return;
  }
  if (placeholder) placeholder.style.display = 'none';
  if (content) content.style.display = '';
  if (addEntryBtn) addEntryBtn.style.display = '';
  renderTrustanalyticsEntries();
}

function renderTrustanalyticsEntries() {
  const area = trustanalyticsAreas.find(a => a.id === selectedTrustanalyticsAreaId);
  if (!area) return;
  const toolbar = document.getElementById('trustanalyticsToolbar');
  const tagFilter = document.getElementById('trustanalyticsTagFilter');
  const entryList = document.getElementById('trustanalyticsEntryList');
  const emptyEl = document.getElementById('trustanalyticsEmpty');
  if (!toolbar || !entryList) return;
  const prevSearch = toolbar.querySelector('.clinical-search')?.value || '';
  toolbar.innerHTML = '';
  const searchIn = document.createElement('input');
  searchIn.type = 'text'; searchIn.className = 'wl-search clinical-search';
  searchIn.placeholder = `Search ${escHtml(area.name)}…`; searchIn.value = prevSearch;
  searchIn.addEventListener('input', renderTrustanalyticsEntries);
  const countEl = document.createElement('span');
  countEl.style.cssText = 'font-family:var(--font-mono);font-size:11px;color:var(--text-faint);white-space:nowrap;margin-left:auto;';
  toolbar.append(searchIn, countEl);
  const areaEntries = trustanalyticsEntries.filter(e => e.areaId === selectedTrustanalyticsAreaId && !e.archived);
  const allTags = [...new Set(areaEntries.flatMap(e => e.tags || []))].sort();
  tagFilter.innerHTML = '';
  if (allTags.length) {
    const lbl = document.createElement('span'); lbl.className = 'clinical-tag-filter-label'; lbl.textContent = 'Tags:'; tagFilter.appendChild(lbl);
    allTags.forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'clinical-tag-pill' + (trustanalyticsTagFilters.has(tag) ? ' active' : '');
      pill.textContent = tag;
      pill.addEventListener('click', () => { trustanalyticsTagFilters.has(tag) ? trustanalyticsTagFilters.delete(tag) : trustanalyticsTagFilters.add(tag); renderTrustanalyticsEntries(); });
      tagFilter.appendChild(pill);
    });
    tagFilter.style.display = '';
  } else { tagFilter.style.display = 'none'; }
  let entries = areaEntries.slice();
  const q = searchIn.value.toLowerCase().trim();
  if (q) entries = entries.filter(e => e.title.toLowerCase().includes(q) || (e.tags || []).some(t => t.toLowerCase().includes(q)));
  if (trustanalyticsTagFilters.size) entries = entries.filter(e => [...trustanalyticsTagFilters].some(t => (e.tags || []).includes(t)));
  entries.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  countEl.textContent = `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`;
  entryList.innerHTML = '';
  if (!entries.length) {
    emptyEl.style.display = '';
  } else {
    emptyEl.style.display = 'none';
    entries.forEach(entry => {
      const card = document.createElement('div'); card.className = 'clinical-entry-card';
      const tagsHtml = (entry.tags || []).map(t => `<span class="clinical-tag-badge">${escHtml(t)}</span>`).join('');
      card.innerHTML = `
        <div class="clinical-entry-card-header">
          <div>
            <div class="clinical-entry-title">${escHtml(entry.title)}</div>
            <div class="clinical-entry-meta">Updated ${wlFmtTs(entry.updatedAt)}</div>
          </div>
        </div>
        ${tagsHtml ? `<div class="clinical-entry-tags">${tagsHtml}</div>` : ''}
      `;
      card.addEventListener('click', () => openTrustanalyticsEntryViewModal(entry.id));
      entryList.appendChild(card);
    });
  }
}

function showTrustanalyticsAreaMenu(area, anchor) {
  document.getElementById('trustanalyticsAreaMenu')?.remove();
  const menu = document.createElement('div'); menu.id = 'trustanalyticsAreaMenu'; menu.className = 'wrench-popup'; menu.style.cssText = 'display:block;position:fixed;z-index:9999;';
  const renameBtn = document.createElement('button'); renameBtn.className = 'wrench-item'; renameBtn.textContent = 'Rename';
  renameBtn.addEventListener('click', () => { menu.remove(); showTrustanalyticsRenameModal(area); });
  const deleteBtn = document.createElement('button'); deleteBtn.className = 'wrench-item danger'; deleteBtn.textContent = 'Delete area';
  deleteBtn.addEventListener('click', () => {
    menu.remove();
    const count = trustanalyticsEntries.filter(e => e.areaId === area.id).length;
    showConfirm(
      count ? `Delete "${area.name}" and its ${count} entr${count === 1 ? 'y' : 'ies'}? This cannot be undone.` : `Delete area "${area.name}"?`,
      async () => {
        trustanalyticsAreas = trustanalyticsAreas.filter(a => a.id !== area.id);
        trustanalyticsEntries = trustanalyticsEntries.filter(e => e.areaId !== area.id);
        saveTrustanalyticsAreas(trustanalyticsAreas);
        await saveTrustanalyticsEntries(trustanalyticsEntries);
        if (selectedTrustanalyticsAreaId === area.id) selectedTrustanalyticsAreaId = null;
        renderTrustanalyticsHub();
      }
    );
  });
  menu.append(renameBtn, deleteBtn);
  document.body.appendChild(menu);
  const rect = anchor.getBoundingClientRect();
  menu.style.top = (rect.bottom + 4) + 'px'; menu.style.left = rect.left + 'px';
  const close = e => { if (!menu.contains(e.target) && e.target !== anchor) { menu.remove(); document.removeEventListener('click', close); } };
  setTimeout(() => document.addEventListener('click', close), 0);
}

function showTrustanalyticsRenameModal(area) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:10000;display:flex;align-items:center;justify-content:center;';
  const box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border:1px solid var(--border-light);border-radius:var(--radius);padding:20px;width:300px;display:flex;flex-direction:column;gap:12px;';
  const title = document.createElement('div'); title.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-primary);'; title.textContent = 'Rename area';
  const inp = document.createElement('input'); inp.type = 'text'; inp.className = 'wl-search'; inp.value = area.name; inp.style.fontSize = '13px';
  const btns = document.createElement('div'); btns.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';
  const cancelBtn = document.createElement('button'); cancelBtn.className = 'tool-btn'; cancelBtn.textContent = 'Cancel';
  const saveBtn = document.createElement('button'); saveBtn.className = 'tool-btn primary'; saveBtn.textContent = 'Save';
  btns.append(cancelBtn, saveBtn); box.append(title, inp, btns); overlay.appendChild(box); document.body.appendChild(overlay);
  inp.focus(); inp.select();
  const close = () => overlay.remove();
  cancelBtn.addEventListener('click', close);
  saveBtn.addEventListener('click', () => { const name = inp.value.trim(); if (!name) return; area.name = name; saveTrustanalyticsAreas(trustanalyticsAreas); close(); renderTrustanalyticsHub(); });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn.click(); if (e.key === 'Escape') close(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function createTrustanalyticsEntryModal(editId, areaId) {
  if (editId && document.querySelector(`.wl-float-modal[data-edit-id="${CSS.escape(editId)}"]`)) return;
  const entry = editId ? trustanalyticsEntries.find(e => e.id === editId) : null;
  const effectiveAreaId = areaId || (entry && entry.areaId) || selectedTrustanalyticsAreaId;
  const area = trustanalyticsAreas.find(a => a.id === effectiveAreaId);
  const modal = buildWLModalShell();
  if (editId) modal.dataset.editId = editId;
  const { dragBar, popoutBtn } = buildWLModalDragBar(); popoutBtn.style.display = 'none';
  const areaLabel = document.createElement('div'); areaLabel.className = 'clinical-area-header'; areaLabel.textContent = area ? area.name : 'Entry';
  const header = document.createElement('div'); header.className = 'wl-modal-header';
  const titleIn = document.createElement('input'); titleIn.type = 'text'; titleIn.className = 'wl-title-input'; titleIn.placeholder = 'Entry title…'; titleIn.value = entry ? entry.title : '';
  const closeBtn = document.createElement('button'); closeBtn.className = 'wl-close-btn'; closeBtn.innerHTML = '&#x2715;';
  header.append(titleIn, closeBtn);
  const tagsRow = document.createElement('div'); tagsRow.className = 'clinical-tags-row';
  const tagsLabel = document.createElement('span'); tagsLabel.className = 'clinical-tags-label'; tagsLabel.textContent = 'Tags:';
  const tagsChips = document.createElement('div'); tagsChips.className = 'clinical-tags-chips';
  let entryTags = entry ? [...(entry.tags || [])] : [];
  const tagsInput = document.createElement('input'); tagsInput.type = 'text'; tagsInput.className = 'clinical-tags-input'; tagsInput.placeholder = 'Add tag, press Enter…';
  const tagsDL = document.createElement('datalist');
  tagsDL.id = 'trustanalytics-tags-dl-' + (editId || 'new');
  getAllKnownTags().forEach(t => { const o = document.createElement('option'); o.value = t; tagsDL.appendChild(o); });
  tagsInput.setAttribute('list', tagsDL.id);
  tagsChips.appendChild(tagsDL);
  function renderTagChips() {
    tagsChips.innerHTML = '';
    tagsChips.appendChild(tagsDL);
    entryTags.forEach((tag, i) => {
      const chip = document.createElement('span'); chip.className = 'snip-tag-chip';
      chip.innerHTML = `${escHtml(tag)}<button class="icon-btn del" style="font-size:9px;padding:0 2px" title="Remove">&#x2715;</button>`;
      chip.querySelector('button').addEventListener('click', () => { entryTags.splice(i, 1); renderTagChips(); });
      tagsChips.appendChild(chip);
    });
    tagsChips.appendChild(tagsInput);
  }
  tagsInput.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && tagsInput.value.trim()) { e.preventDefault(); const tag = tagsInput.value.trim().replace(/,$/, ''); if (tag && !entryTags.includes(tag)) { entryTags.push(tag); renderTagChips(); } tagsInput.value = ''; }
    if (e.key === 'Backspace' && !tagsInput.value && entryTags.length) { entryTags.pop(); renderTagChips(); }
  });
  tagsInput.addEventListener('blur', () => { const tag = tagsInput.value.trim(); if (tag && !entryTags.includes(tag)) { entryTags.push(tag); renderTagChips(); } tagsInput.value = ''; });
  renderTagChips();
  tagsRow.append(tagsLabel, tagsChips);
  const { bar: topBar, addSectionBtn: addSectionBtnTop, saveBtn: saveBtnTop } = buildWLActionBar(true);
  const formatBar = buildWLFormatBar();
  const sectionsEl = buildWLSectionsContainer(entry, null);
  const { bar: footer, addSectionBtn, saveBtn } = buildWLActionBar(false);
  const linksSection = buildWLLinksSection(entry?.links);
  const editFooter = editId ? buildWLEditFooter({
    onDelete: async () => {
      trustanalyticsEntries = trustanalyticsEntries.filter(e => e.id !== editId);
      await saveTrustanalyticsEntries(trustanalyticsEntries);
      modal._onClose = renderTrustanalyticsHub;
      closeModal();
    },
    onArchive: async () => {
      const e = trustanalyticsEntries.find(e => e.id === editId);
      if (e) { e.archived = true; e.archivedAt = new Date().toISOString(); }
      await saveTrustanalyticsEntries(trustanalyticsEntries);
      modal._onClose = renderTrustanalyticsHub;
      closeModal();
    },
  }) : null;
  modal.append(dragBar, areaLabel, header, tagsRow, topBar, formatBar, sectionsEl, footer, linksSection);
  if (editFooter) modal.appendChild(editFooter);
  document.body.appendChild(modal); modal._openModal?.();
  titleIn.focus();
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }
  closeBtn.addEventListener('click', closeModal);
  async function saveModal() {
    const title = titleIn.value.trim();
    if (!title) { showToast('Enter a title.', true); return; }
    const now = new Date().toISOString();
    if (editId) {
      const existing = trustanalyticsEntries.find(e => e.id === editId);
      if (existing) { existing.title = title; existing.tags = entryTags.slice(); existing.sections = collectWLSections(sectionsEl); existing.links = linksSection._getLinks(); existing.updatedAt = now; }
    } else {
      trustanalyticsEntries.unshift({ id: crypto.randomUUID(), areaId: effectiveAreaId, title, tags: entryTags.slice(), sections: collectWLSections(sectionsEl), links: linksSection._getLinks(), createdAt: now, updatedAt: now });
    }
    await saveTrustanalyticsEntries(trustanalyticsEntries);
    showToast('Entry saved.');
    modal._onClose = renderTrustanalyticsHub;
    closeModal();
  }
  [saveBtn, saveBtnTop].forEach(b => b.addEventListener('click', saveModal));
  [addSectionBtn, addSectionBtnTop].forEach(b => b.addEventListener('click', () => sectionsEl.appendChild(buildWLSectionEditor({ title: '', nodes: [] }))));
  modal.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveModal(); } });
  titleIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveModal(); } });
}

function openTrustanalyticsEntryViewModal(entryId) {
  if (document.querySelector(`.wl-float-modal[data-view-id="${CSS.escape(entryId)}"]`)) return;
  const entry = trustanalyticsEntries.find(e => e.id === entryId);
  if (!entry) return;
  const area = trustanalyticsAreas.find(a => a.id === entry.areaId);
  const modal = buildWLModalShell(); modal.dataset.viewId = entryId;
  const { dragBar, popoutBtn } = buildWLModalDragBar(); popoutBtn.style.display = 'none';
  const header = document.createElement('div'); header.className = 'wl-modal-header';
  const headerLeft = document.createElement('div'); headerLeft.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:1;min-width:0';
  const titleEl = document.createElement('div'); titleEl.className = 'wl-view-title'; titleEl.textContent = entry.title;
  const metaRow = document.createElement('div'); metaRow.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap';
  if (area) { const areaSpan = document.createElement('span'); areaSpan.style.cssText = 'font-family:var(--font-mono);font-size:10px;color:var(--accent);text-transform:uppercase;letter-spacing:0.05em;'; areaSpan.textContent = area.name; metaRow.appendChild(areaSpan); }
  (entry.tags || []).forEach(tag => { const t = document.createElement('span'); t.className = 'clinical-tag-badge'; t.textContent = tag; metaRow.appendChild(t); });
  const ts = document.createElement('span'); ts.style.cssText = 'font-family:var(--font-mono);font-size:10px;color:var(--text-faint);margin-left:auto'; ts.textContent = wlFmtTs(entry.updatedAt); metaRow.appendChild(ts);
  headerLeft.append(titleEl, metaRow);
  const closeBtn = document.createElement('button'); closeBtn.className = 'icon-btn wl-close-btn'; closeBtn.style.cssText = 'font-size:18px;opacity:0.6;align-self:flex-start;flex-shrink:0'; closeBtn.innerHTML = '&#x2715;';
  header.append(headerLeft, closeBtn);
  const sectionsEl = document.createElement('div'); sectionsEl.className = 'wl-view-sections';
  (entry.sections || []).forEach((s, sIdx) => {
    const hasContent = (s.nodes || []).some(n => (n.value || '').trim() || n.type === 'image') || (s.content || '').trim();
    if (!hasContent) return;
    sectionsEl.appendChild(_buildViewSection(s, entryId, sIdx));
  });
  const footer = document.createElement('div'); footer.className = 'wl-modal-footer';
  const editBtn = document.createElement('button'); editBtn.className = 'tool-btn primary';
  editBtn.style.marginLeft = 'auto'; editBtn.innerHTML = '&#9998; Edit'; footer.appendChild(editBtn);
  modal.append(dragBar, header, sectionsEl, footer);
  document.body.appendChild(modal); modal._openModal?.();
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  editBtn.addEventListener('click', () => { closeModal(); createTrustanalyticsEntryModal(entryId); });
}

// ── Contacts ─────────────────────────────────────────────────────
const CONTACTS_KEY = 'rcc_contacts_v1';
function loadContacts() {
  try { return JSON.parse(localStorage.getItem(CONTACTS_KEY)) || []; } catch { return []; }
}
function saveContacts(arr) {
  try { localStorage.setItem(CONTACTS_KEY, JSON.stringify(arr)); }
  catch (e) {
    const msg = e.name === 'QuotaExceededError'
      ? 'Storage full — contacts not saved.'
      : 'Failed to save contacts: ' + e.message;
    showToast(msg, true);
  }
}

const DB_ACCESS_KEY = 'rcc_databases_v1';
function loadDbAccess() {
  try { return JSON.parse(localStorage.getItem(DB_ACCESS_KEY)) || []; } catch { return []; }
}
function saveDbAccess(arr) {
  try { localStorage.setItem(DB_ACCESS_KEY, JSON.stringify(arr)); }
  catch (e) {
    showToast(e.name === 'QuotaExceededError' ? 'Storage full — databases not saved.' : 'Failed to save databases: ' + e.message, true);
  }
}

let wlShowArchived = false;
let wlViewMode = localStorage.getItem('rcc_wl_view') || 'list';

function migrateWLItems() {
  let changed = false;
  wlItems.forEach(item => {
    if (item.archived && item.status !== 'Archived') { item.status = 'Archived'; changed = true; }
    if (item.status === 'Complete' && !item.completedAt) { item.completedAt = item.updatedAt; changed = true; }
  });
  if (changed) saveWL(wlItems);
}

function autoArchiveComplete() {
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let changed = false;
  wlItems.forEach(item => {
    if (item.status === 'Complete') {
      const ref = item.completedAt || item.updatedAt;
      if (ref && now - new Date(ref).getTime() >= TWO_DAYS_MS) {
        item.status = 'Archived'; item.archived = true; item.archivedAt = new Date().toISOString();
        changed = true;
      }
    }
  });
  if (changed) saveWL(wlItems);
}

(async () => {
  await _migrateWLToIDB();
  wlItems = await loadWL();
  clinicalAreas = loadClinicalAreas();
  clinicalEntries = await loadClinicalEntries();
  cogitoAreas = loadCogitoAreas();
  if (cogitoAreas.length === 0) {
    cogitoAreas = [
      { id: crypto.randomUUID(), name: 'Workbench Report', createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'SlicerDicer',      createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Caboodle',         createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Metrics',          createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Radar',            createdAt: new Date().toISOString() },
    ];
    saveCogitoAreas(cogitoAreas);
  }
  cogitoEntries = await loadCogitoEntries();
  reqprocAreas = loadReqprocAreas();
  reqprocEntries = await loadReqprocEntries();
  trustanalyticsAreas = loadTrustanalyticsAreas();
  trustanalyticsEntries = await loadTrustanalyticsEntries();
  snipItems = await loadSnippets();
  guideItems = await loadGuides();
  contactItems = loadContacts();
  guidesAreas    = loadGuidesAreas();
  snippetsAreas  = loadSnippetsAreas();
  databasesAreas = loadDatabasesAreas();
  migrateWLItems();
  autoArchiveComplete();
  populateWlDropdowns();
  // switchTab() runs synchronously below before this IIFE resolves,
  // so if the active tab was set, re-render once data is loaded (<10ms locally).
  renderWLSidebar();
  if (localStorage.getItem('rcc_active_tab') === 'Worklog') renderWL();
  if (localStorage.getItem('rcc_active_tab') === 'References') {
    const hub = localStorage.getItem('rcc_hub_tab') || 'links';
    if (hub === 'contacts') renderContacts();
    if (hub === 'snippets') renderSnippetsHub();
    if (hub === 'guides')   renderGuidesHub();
    if (hub === 'databases') renderDatabasesHub();
    if (hub === 'clinical') renderClinicalHub();
    if (hub === 'cogito')          renderCogitoHub();
    if (hub === 'reqproc')         renderReqprocHub();
    if (hub === 'trustanalytics')  renderTrustanalyticsHub();
  }
})();

// Populate category filter dropdown (modal categories populated per-instance in createWLModal)
function populateCatSelect(sel) {
  OUTLOOK_CATS.forEach(c => {
    const o = document.createElement('option');
    o.value = c.label; o.textContent = c.label;
    sel.appendChild(o);
  });
}
// wlFilterCat removed — populateCatSelect kept for reminders modal

function wlFmtTs(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) + ' ' +
    d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
}

function wlStatusClass(s) { return 'wl-status-badge wl-status-' + s.replace(/ /g,'-'); }
function wlTicketLabel(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url.slice(0, 40); }
}

function renderChecklist(text) {
  const lines = text.split('\n');
  const ul = document.createElement('ul');
  ul.className = 'wl-checklist';
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const isDone = /^-\s*\[x\]/i.test(trimmed);
    const isTodo = /^-\s*\[\s*\]/.test(trimmed);
    if (isDone || isTodo) {
      const li = document.createElement('li');
      if (isDone) li.classList.add('checked');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = isDone;
      cb.addEventListener('change', () => {
        li.classList.toggle('checked', cb.checked);
      });
      const label = document.createElement('span');
      label.textContent = trimmed.replace(/^-\s*\[[x\s]\]\s*/i, '');
      li.appendChild(cb);
      li.appendChild(label);
      ul.appendChild(li);
    } else {
      const li = document.createElement('li');
      li.style.listStyle = 'disc';
      li.style.marginLeft = '18px';
      li.style.display = 'list-item';
      li.textContent = trimmed.replace(/^-\s*/, '');
      ul.appendChild(li);
    }
  });
  return ul;
}

function isChecklist(text) { return /^-\s*\[[x\s]\]/im.test(text); }

function wlPreviewText(item) {
  const overview = item.sections && item.sections.find(s => s.title === 'Overview');
  if (!overview) return '';
  const text = (overview.nodes || [])
    .filter(n => n.type === 'text' || n.type === 'markdown')
    .map(n => n.value.replace(/[#*_`\[\]!>]/g, '').replace(/\n/g, ' ').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 120 ? text.slice(0, 117) + '\u2026' : text;
}

const WL_TYPES = ['All', 'Halo', 'Sherlock', 'Ad-hoc', 'CMT', 'Nova', 'Upgrade', 'Meetings', 'Training', 'SOP', 'Report', 'Research', 'Other'];

function renderWLSidebar() {
  const sidebar = document.getElementById('wlTypeSidebar');
  if (!sidebar) return;
  sidebar.innerHTML = '';
  WL_TYPES.forEach(type => {
    const item = document.createElement('div');
    item.className = 'wl-type-sidebar-item' + (selectedWLType === type ? ' active' : '');
    item.textContent = type;
    item.addEventListener('click', () => {
      selectedWLType = type;
      renderWLSidebar();
      renderWL();
    });
    sidebar.appendChild(item);
  });
}

function renderWL() {
  const list = document.getElementById('wlList');
  const empty = document.getElementById('wlEmpty');
  const search = document.getElementById('wlSearch').value.toLowerCase().trim();
  const filterType = document.getElementById('wlFilterType').value;
  const filterStatus = document.getElementById('wlFilterStatus').value;

  let filtered = wlItems.filter(item => {
    if (item.archived) return false;
    if (!wlShowArchived && item.status === 'Archived') return false;
    if (selectedWLType !== 'All' && item.type !== selectedWLType) return false;
    if (filterType && item.type !== filterType) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (search) {
      const sectionText = item.sections.map(s => {
        const nodeText = (s.nodes || []).filter(n => n.type === 'text' || n.type === 'html' || n.type === 'markdown').map(n =>
          n.type === 'html' ? n.value.replace(/<[^>]+>/g, ' ') : n.value
        ).join(' ');
        return s.title + ' ' + (nodeText || s.content || '');
      }).join(' ');
      const haystack = (item.title + ' ' + (item.ticket||'') + ' ' + sectionText).toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  // Sort
  const wlSortEl = document.getElementById('wlSort');
  const wlSort = wlSortEl ? wlSortEl.value : 'updated';
  filtered.sort((a,b) => {
    if (wlSort === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
    if (wlSort === 'title') return a.title.localeCompare(b.title);
    if (wlSort === 'status') {
      const ord = {'In Progress':0,'Blocked':1,'Under Review':2,'Complete':3};
      return (ord[a.status]||0) - (ord[b.status]||0);
    }
    if (wlSort === 'type') return a.type.localeCompare(b.type);
    // default 'updated': open items first, complete last, then by updatedAt desc
    const aD = a.status === 'Complete' ? 1 : 0;
    const bD = b.status === 'Complete' ? 1 : 0;
    if (aD !== bD) return aD - bD;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  empty.style.display = filtered.length === 0 ? 'block' : 'none';
  const wlCountEl = document.getElementById('wlCount');
  if (wlCountEl) wlCountEl.textContent = filtered.length + (filtered.length === 1 ? ' item' : ' items');

  if (wlViewMode === 'board') { renderWLBoard(list, filtered); return; }

  document.querySelector('.wl-layout').classList.remove('wl-board-mode');
  list.innerHTML = '';

  filtered.forEach(item => {
    const div = document.createElement('div');
    div.className = 'wl-item' + (item.status === 'Complete' ? ' wl-complete' : '') + (item.status === 'Archived' ? ' wl-archived' : '') + (item.timerStart ? ' timer-active' : '');
    div.dataset.id = item.id;

    const archivedBadge = item.status === 'Archived' ? `<span class="wl-archived-badge">archived</span>` : '';
    const wlTotalSecs = getTotalSecs(item);
    const wlTimerRunning = !!item.timerStart;
    const wlTimeBadge = ((item.timeLogs || []).length > 0 || wlTimerRunning) ? `<span class="time-badge">⏱ ${wlTimerRunning ? 'running' : fmtDuration(wlTotalSecs)}</span>` : '';
    const preview = wlPreviewText(item);

    div.innerHTML = `
      <div class="wl-item-header">
        <span class="wl-item-title">${escHtml(item.title)}</span>
        <span class="wl-type-badge wl-type-${item.type}">${item.type}</span>
        ${archivedBadge}
        <span class="${wlStatusClass(item.status)} wl-status-btn" title="Click to change status">${item.status}</span>
        ${wlTimeBadge}
        <span class="wl-timestamp">${wlFmtTs(item.updatedAt)}</span>
        <div class="wl-item-actions">
          <button class="timer-btn wl-timer-btn${wlTimerRunning ? ' running' : ''}" title="${wlTimerRunning ? 'Stop timer' : 'Start timer'}">${wlTimerRunning ? '■ stop' : '▶ start'}</button>
          <button class="icon-btn wl-edit-btn" title="Edit">&#9998;</button>
          <button class="icon-btn wl-export-btn" title="Download .md">&#8659;</button>
          <button class="icon-btn wl-dup-btn" title="Duplicate">&#10697;</button>
          <button class="icon-btn wl-archive-btn" title="${item.status === 'Archived' ? 'Unarchive' : 'Archive'}" style="color:var(--accent)">${item.status === 'Archived' ? '&#8635;' : '&#x229F;'}</button>
          <button class="icon-btn del wl-del-btn" title="Delete">&#x2715;</button>
        </div>
      </div>
      ${preview ? `<div class="wl-preview-text">${escHtml(preview)}</div>` : ''}
      ${item.ticket ? `<div class="wl-card-ticket-row"><a class="wl-card-ticket" href="${escHtml(item.ticket)}" target="_blank" title="${escHtml(item.ticket)}">&#128279; ${escHtml(wlTicketLabel(item.ticket))}</a></div>` : ''}
      <div class="wl-item-body">
        ${item.sections.map((s, sIdx) => `
          <div class="wl-section">
            <div class="wl-section-title">${escHtml(s.title)}</div>
            <div class="wl-section-body" data-item-id="${item.id}" data-section-idx="${sIdx}" data-nodes="${encodeURIComponent(JSON.stringify(s.nodes || []))}"></div>
          </div>`).join('')}
        ${(item.linkedItems || []).length > 0 ? `<div class="wl-linked-display">${
          (item.linkedItems || []).map((l, i) => {
            const icon = l.type === 'task' ? '📋' : '🔔';
            const label = resolveLinkedLabel(l);
            return `<span class="wl-linked-badge type-${l.type} clickable" data-linkidx="${i}" title="Go to: ${escHtml(label)}">${icon} ${escHtml(label)}</span>`;
          }).join('')
        }</div>` : ''}
        <div class="wl-time-log-wrap">${buildTimeLogHtml(item)}</div>
      </div>`;

    div.querySelector('.wl-item-header').addEventListener('click', e => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.wl-status-btn')) return;
      openWLViewModal(item.id);
    });

    div.querySelectorAll('.wl-linked-badge.clickable').forEach(badge => {
      badge.addEventListener('click', e => {
        e.stopPropagation();
        const link = (item.linkedItems || [])[parseInt(badge.dataset.linkidx)];
        if (link) navigateToLinkedItem(link);
      });
    });
    div.querySelector('.wl-status-btn').addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.wl-status-popup').forEach(p => p.remove());
      const STATUSES = ['Not Started', 'In Progress', 'Blocked', 'Under Review', 'Complete', 'Archived'];
      const popup = document.createElement('div');
      popup.className = 'wl-status-popup';
      STATUSES.forEach(s => {
        const btn = document.createElement('button');
        btn.className = wlStatusClass(s) + (s === item.status ? ' wl-status-current' : '');
        btn.textContent = s;
        btn.addEventListener('click', async ev => {
          ev.stopPropagation();
          const i = wlItems.find(x => x.id === item.id);
          if (i && i.status !== s) {
            const prev = i.status;
            i.status = s; i.updatedAt = new Date().toISOString();
            if (s === 'Complete' && prev !== 'Complete') i.completedAt = i.updatedAt;
            else if (s !== 'Complete') delete i.completedAt;
            if (s === 'Archived') { i.archived = true; i.archivedAt = i.updatedAt; }
            else { i.archived = false; delete i.archivedAt; }
            await saveWL(wlItems); renderWL();
          }
          popup.remove();
        });
        popup.appendChild(btn);
      });
      const rect = e.target.getBoundingClientRect();
      popup.style.cssText = `position:fixed;top:${rect.bottom + 4}px;left:${rect.left}px;z-index:9999`;
      document.body.appendChild(popup);
      setTimeout(() => {
        const close = ev => { if (!popup.contains(ev.target)) { popup.remove(); document.removeEventListener('click', close); } };
        document.addEventListener('click', close);
      }, 0);
    });
    div.querySelector('.wl-timer-btn').addEventListener('click', e => { e.stopPropagation(); wlTimerToggle(item.id); });
    div.querySelectorAll('.wl-time-log-wrap .time-log-del').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        wlDeleteTimeLog(item.id, parseInt(btn.dataset.logidx));
      });
    });
    div.querySelector('.wl-edit-btn').addEventListener('click', e => { e.stopPropagation(); createWLModal(item.id); });
    div.querySelector('.wl-export-btn').addEventListener('click', e => { e.stopPropagation(); downloadWLItemMd(item); });
    div.querySelector('.wl-dup-btn').addEventListener('click', async e => {
      e.stopPropagation();
      const now = new Date().toISOString();
      const copy = {
        id: crypto.randomUUID(),
        title: 'Copy of ' + item.title,
        type: item.type,
        category: item.category || '',
        status: 'Not Started',
        ticket: '',
        sections: item.sections.map(s => ({ title: s.title, nodes: [] })),
        linkedItems: [],
        createdAt: now,
        updatedAt: now
      };
      wlItems.unshift(copy);
      await saveWL(wlItems);
      renderWL();
      showToast('Item duplicated.');
    });
    div.querySelector('.wl-archive-btn').addEventListener('click', e => {
      e.stopPropagation();
      const i = wlItems.find(i => i.id === item.id);
      if (!i) return;
      if (i.status === 'Archived') {
        i.status = 'Not Started'; i.archived = false; delete i.archivedAt;
      } else {
        i.status = 'Archived'; i.archived = true; i.archivedAt = new Date().toISOString();
      }
      saveWL(wlItems);
      renderWL();
      showToast(i.status === 'Archived' ? 'Item archived.' : 'Item unarchived.');
    });
    div.querySelector('.wl-del-btn').addEventListener('click', e => {
      e.stopPropagation();
      showConfirm(`Delete "${item.title}"?`, () => {
        wlItems = wlItems.filter(i => i.id !== item.id);
        saveWL(wlItems);
        renderWL();
      });
    });

    list.appendChild(div);
  });
}

// ── Shared helper: render section nodes into a .wl-section-body element ──────
function _renderWLSectionNodes(el, nodes, itemId, sectionIdx) {
  nodes.forEach((node, nodeIdx) => {
    if (node.type === 'image') {
      const img = document.createElement('img');
      img.src = node.value;
      img.style.cssText = 'max-width:100%;max-height:280px;border-radius:var(--radius-sm);border:1px solid var(--border);margin:6px 0;display:block;cursor:pointer;object-fit:contain';
      img.addEventListener('click', () => openLightbox(node.value));
      el.appendChild(img);
    } else {
      let mdText = node.value || '';
      if (node.type === 'html') {
        mdText = mdText
          .replace(/<h1>([\s\S]*?)<\/h1>/gi, '# $1\n')
          .replace(/<h2>([\s\S]*?)<\/h2>/gi, '## $1\n')
          .replace(/<h3>([\s\S]*?)<\/h3>/gi, '### $1\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
          .replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*')
          .replace(/<u>([\s\S]*?)<\/u>/gi, '<u>$1</u>')
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      }
      const wrapper = document.createElement('div');
      wrapper.className = 'wl-md-rendered';
      const _parsedHtml = marked.parse(mdText, { gfm: true, breaks: true });
      const _tempDiv = document.createElement('div');
      _tempDiv.innerHTML = _parsedHtml;
      _tempDiv.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());
      _tempDiv.querySelectorAll('*').forEach(el => {
        for (const attr of [...el.attributes]) {
          if (attr.name.startsWith('on') || (attr.name === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:'))) {
            el.removeAttribute(attr.name);
          }
        }
      });
      _tempDiv.querySelectorAll('a[href]').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      });
      wrapper.innerHTML = _tempDiv.innerHTML;
      // Syntax highlighting via highlight.js (no theme CSS needed — colours defined in rcc.css)
      if (typeof hljs !== 'undefined') {
        wrapper.querySelectorAll('pre code[class*="language-"]').forEach(codeEl => {
          hljs.highlightElement(codeEl);
        });
      }
      // Language label + copy button on every fenced code block
      wrapper.querySelectorAll('pre').forEach(preEl => {
        const codeEl = preEl.querySelector('code');
        const langMatch = (codeEl?.className || '').match(/language-(\w+)/);
        const lang = langMatch ? langMatch[1] : '';
        if (lang) {
          const langLabel = document.createElement('span');
          langLabel.className = 'wl-code-lang';
          langLabel.textContent = lang.toUpperCase();
          preEl.insertBefore(langLabel, preEl.firstChild);
        }
        const copyBtn = document.createElement('button');
        copyBtn.className = 'wl-code-copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', e => {
          e.stopPropagation();
          navigator.clipboard.writeText(codeEl?.textContent || '').then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
          });
        });
        preEl.appendChild(copyBtn);
      });
      let cbIdx = 0;
      wrapper.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        const idx = cbIdx++;
        cb.removeAttribute('disabled');
        const li = cb.closest('li');
        if (cb.checked && li) li.classList.add('md-checked');
        cb.addEventListener('change', () => {
          if (li) li.classList.toggle('md-checked', cb.checked);
          const item = wlItems.find(i => i.id === itemId);
          if (!item) return;
          const targetNode = item.sections[sectionIdx]?.nodes?.[nodeIdx];
          if (!targetNode) return;
          let count = 0;
          targetNode.value = targetNode.value.replace(/- \[([ xX])\]/g, match => {
            if (count++ === idx) return cb.checked ? '- [x]' : '- [ ]';
            return match;
          });
          saveWL(wlItems);
        });
      });
      el.appendChild(wrapper);
    }
  });
}

// ── Shared helper: build a collapsible view section ──────────────
function _buildViewSection(s, entryId, sIdx) {
  const secDiv = document.createElement('div');
  secDiv.className = 'wl-view-section';
  const secTitle = document.createElement('div');
  secTitle.className = 'wl-view-section-title';
  const chevron = document.createElement('button');
  chevron.className = 'wl-view-section-chevron';
  chevron.innerHTML = '&#9660;';
  chevron.setAttribute('aria-label', 'Toggle section');
  secTitle.append(chevron, document.createTextNode(' ' + s.title));
  secTitle.style.cursor = 'pointer';
  secTitle.addEventListener('click', () => secDiv.classList.toggle('collapsed'));
  const secBody = document.createElement('div');
  secBody.className = 'wl-view-section-body';
  _renderWLSectionNodes(secBody, s.nodes || [], entryId, sIdx);
  secDiv.append(secTitle, secBody);
  return secDiv;
}

// ── B1: Kanban board ──────────────────────────────────────────────────────────
function renderWLBoard(list, filtered) {
  const STATUSES = wlShowArchived
    ? ['Not Started', 'In Progress', 'Blocked', 'Under Review', 'Complete', 'Archived']
    : ['Not Started', 'In Progress', 'Blocked', 'Under Review', 'Complete'];
  document.querySelector('.wl-layout').classList.add('wl-board-mode');

  const board = document.createElement('div');
  board.className = 'wl-board';

  STATUSES.forEach(status => {
    const colItems = filtered.filter(i => i.status === status);

    const col = document.createElement('div');
    col.className = 'wl-board-col';

    const colKey = 'rcc_board_col_' + status.replace(/\s+/g, '_');
    const isCollapsed = localStorage.getItem(colKey) === '1';

    const colHeader = document.createElement('div');
    colHeader.className = 'wl-board-col-header';
    colHeader.style.cursor = 'pointer';
    const statusSpan = document.createElement('span');
    statusSpan.className = wlStatusClass(status);
    statusSpan.textContent = status;
    const countSpan = document.createElement('span');
    countSpan.className = 'wl-board-col-count';
    countSpan.textContent = colItems.length;
    const chevron = document.createElement('span');
    chevron.className = 'wl-board-col-chevron';
    chevron.innerHTML = '&#9660;';
    colHeader.append(statusSpan, countSpan, chevron);

    const colBody = document.createElement('div');
    colBody.className = 'wl-board-col-body';

    if (isCollapsed) {
      col.classList.add('wl-board-col-collapsed');
      chevron.style.transform = 'rotate(-90deg)';
    }

    colHeader.addEventListener('click', () => {
      const collapsed = col.classList.toggle('wl-board-col-collapsed');
      chevron.style.transform = collapsed ? 'rotate(-90deg)' : '';
      localStorage.setItem(colKey, collapsed ? '1' : '0');
    });

    colBody.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      colBody.classList.add('wl-board-drop-over');
    });
    colBody.addEventListener('dragleave', e => {
      if (!colBody.contains(e.relatedTarget)) colBody.classList.remove('wl-board-drop-over');
    });
    colBody.addEventListener('drop', async e => {
      e.preventDefault();
      colBody.classList.remove('wl-board-drop-over');
      const draggedId = e.dataTransfer.getData('wl-item-id');
      if (!draggedId) return;
      const item = wlItems.find(i => i.id === draggedId);
      if (item && item.status !== status) {
        item.status = status;
        item.updatedAt = new Date().toISOString();
        await saveWL(wlItems);
        renderWL();
      }
    });

    colItems.forEach(item => colBody.appendChild(buildWLBoardCard(item)));

    if (colItems.length === 0) {
      const emptyCol = document.createElement('div');
      emptyCol.className = 'wl-board-col-empty';
      emptyCol.textContent = 'No items';
      colBody.appendChild(emptyCol);
    }

    col.append(colHeader, colBody);
    board.appendChild(col);
  });

  list.innerHTML = '';
  list.appendChild(board);

  // Pan-to-scroll: attach once per list element
  if (!list.dataset.panSetup) {
    list.dataset.panSetup = '1';
    let panning = false, startX = 0, scrollLeft = 0;
    list.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      if (e.target.closest('.wl-board-card') || e.target.closest('button') || e.target.closest('a')) return;
      panning = true;
      startX = e.pageX - list.getBoundingClientRect().left;
      scrollLeft = list.scrollLeft;
      list.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mouseup', () => { panning = false; list.style.cursor = ''; });
    list.addEventListener('mouseleave', () => { panning = false; list.style.cursor = ''; });
    list.addEventListener('mousemove', e => {
      if (!panning) return;
      const x = e.pageX - list.getBoundingClientRect().left;
      list.scrollLeft = scrollLeft - (x - startX);
    });
  }
}

function buildWLBoardCard(item) {
  const div = document.createElement('div');
  div.className = 'wl-item wl-board-card' +
    (item.status === 'Complete' ? ' wl-complete' : '') +
    (item.archived ? ' wl-archived' : '') +
    (item.timerStart ? ' timer-active' : '');
  div.dataset.id = item.id;
  div.setAttribute('draggable', 'true');

  div.addEventListener('dragstart', e => {
    e.dataTransfer.setData('wl-item-id', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => div.classList.add('wl-board-dragging'), 0);
  });
  div.addEventListener('dragend', () => div.classList.remove('wl-board-dragging'));

  const preview = wlPreviewText(item);
  const wlTimerRunning = !!item.timerStart;

  div.innerHTML = `
    <div class="wl-board-card-top">
      <span class="wl-item-title">${escHtml(item.title)}</span>
      <div class="wl-item-actions">
        <button class="timer-btn wl-timer-btn${wlTimerRunning ? ' running' : ''}" title="${wlTimerRunning ? 'Stop timer' : 'Start timer'}">${wlTimerRunning ? '■' : '▶'}</button>
        <button class="icon-btn wl-edit-btn" title="Edit">&#9998;</button>
        <button class="icon-btn wl-dup-btn" title="Duplicate">&#10697;</button>
        <button class="icon-btn wl-archive-btn" title="${item.status === 'Archived' ? 'Unarchive' : 'Archive'}" style="color:var(--accent)">${item.status === 'Archived' ? '&#8635;' : '&#x229F;'}</button>
        <button class="icon-btn del wl-del-btn" title="Delete">&#x2715;</button>
      </div>
    </div>
    <div class="wl-board-card-meta">
      <span class="wl-type-badge wl-type-${item.type}">${item.type}</span>
      ${item.downloadedAt && item.status === 'Archived' ? `<span class="wl-downloaded-check" title="Downloaded ${wlFmtTs(item.downloadedAt)}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>` : ''}
    </div>
    ${preview ? `<div class="wl-preview-text">${escHtml(preview)}</div>` : ''}
    ${(item.linkedItems || []).length > 0 ? `<div class="wl-linked-display wl-board-linked">${
      (item.linkedItems || []).map((l, li) => {
        const icon = l.type === 'task' ? '📋' : '🔔';
        const label = resolveLinkedLabel(l);
        return `<span class="wl-linked-badge type-${l.type} clickable" data-linkidx="${li}" title="Go to: ${escHtml(label)}">${icon} ${escHtml(label)}</span>`;
      }).join('')
    }</div>` : ''}
    ${item.ticket ? `<div class="wl-card-ticket-row"><a class="wl-card-ticket" href="${escHtml(item.ticket)}" target="_blank" title="${escHtml(item.ticket)}">&#128279; ${escHtml(wlTicketLabel(item.ticket))}</a></div>` : ''}`;

  // Click anywhere on card (except buttons/links) opens view modal
  div.addEventListener('click', e => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    openWLViewModal(item.id);
  });

  div.querySelector('.wl-timer-btn').addEventListener('click', e => { e.stopPropagation(); wlTimerToggle(item.id); });
  div.querySelector('.wl-edit-btn').addEventListener('click', e => { e.stopPropagation(); createWLModal(item.id); });
  div.querySelector('.wl-dup-btn').addEventListener('click', async e => {
    e.stopPropagation();
    const now = new Date().toISOString();
    const copy = { id: crypto.randomUUID(), title: 'Copy of ' + item.title, type: item.type, category: item.category || '', status: 'Not Started', ticket: '', sections: item.sections.map(s => ({ title: s.title, nodes: [] })), linkedItems: [], createdAt: now, updatedAt: now };
    wlItems.unshift(copy);
    await saveWL(wlItems);
    renderWL();
    showToast('Item duplicated.');
  });
  div.querySelector('.wl-archive-btn').addEventListener('click', e => {
    e.stopPropagation();
    const i = wlItems.find(i => i.id === item.id);
    if (!i) return;
    if (i.status === 'Archived') {
      i.status = 'Not Started'; i.archived = false; delete i.archivedAt;
    } else {
      i.status = 'Archived'; i.archived = true; i.archivedAt = new Date().toISOString();
    }
    saveWL(wlItems); renderWL();
    showToast(i.status === 'Archived' ? 'Item archived.' : 'Item unarchived.');
  });
  div.querySelector('.wl-del-btn').addEventListener('click', e => {
    e.stopPropagation();
    showConfirm(`Delete "${item.title}"?`, () => {
      wlItems = wlItems.filter(i => i.id !== item.id);
      saveWL(wlItems); renderWL();
    });
  });
  div.querySelectorAll('.wl-board-linked .wl-linked-badge.clickable').forEach(badge => {
    badge.addEventListener('click', e => {
      e.stopPropagation();
      const link = (item.linkedItems || [])[parseInt(badge.dataset.linkidx)];
      if (link) navigateToLinkedItem(link);
    });
  });

  return div;
}

function compressImage(dataUrl, callback) {
  const img = new Image();
  img.onload = () => {
    const MAX = 1200;
    let w = img.width, h = img.height;
    if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    callback(canvas.toDataURL('image/jpeg', 0.85));
  };
  img.src = dataUrl;
}

function buildWLSectionEditor(section) {
  const div = document.createElement('div');
  div.className = 'wl-section-editor';

  const LOCKED_TITLES = ['Overview', 'Notes', 'Next steps'];
  const isLocked = section.locked === true || LOCKED_TITLES.includes(section.title);

  const headerDiv = document.createElement('div');
  headerDiv.className = 'wl-section-editor-header';

  const dragHandle = document.createElement('span');
  dragHandle.className = 'wl-section-drag-handle';
  dragHandle.innerHTML = `<svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor"><circle cx="2" cy="2.5" r="1.1"/><circle cx="6" cy="2.5" r="1.1"/><circle cx="2" cy="7" r="1.1"/><circle cx="6" cy="7" r="1.1"/><circle cx="2" cy="11.5" r="1.1"/><circle cx="6" cy="11.5" r="1.1"/></svg>`;
  dragHandle.title = 'Drag to reorder';
  dragHandle.addEventListener('click', e => e.stopPropagation());

  const chevron = document.createElement('span');
  chevron.className = 'wl-section-chevron';
  chevron.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

  if (isLocked) {
    const nameSpan = document.createElement('span');
    nameSpan.className = 'wl-section-name-locked';
    nameSpan.textContent = section.title;
    const imgBtn = document.createElement('button');
    imgBtn.className = 'wl-insert-img-btn';
    imgBtn.title = 'Insert image at cursor';
    imgBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> image`;
    const removeLockedBtn = document.createElement('button');
    removeLockedBtn.className = 'icon-btn del wl-remove-section';
    removeLockedBtn.title = 'Remove section';
    removeLockedBtn.innerHTML = '&#x2715;';
    removeLockedBtn.addEventListener('click', e => e.stopPropagation());
    headerDiv.append(dragHandle, chevron, nameSpan, imgBtn, removeLockedBtn);
  } else {
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'wl-section-name-input';
    nameInput.placeholder = 'Section title…';
    nameInput.value = section.title;
    nameInput.addEventListener('click', e => e.stopPropagation());
    const imgBtn = document.createElement('button');
    imgBtn.className = 'wl-insert-img-btn';
    imgBtn.title = 'Insert image at cursor';
    imgBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> image`;
    imgBtn.addEventListener('click', e => e.stopPropagation());
    const removeBtn = document.createElement('button');
    removeBtn.className = 'icon-btn del wl-remove-section';
    removeBtn.title = 'Remove section';
    removeBtn.innerHTML = '&#x2715;';
    removeBtn.addEventListener('click', e => e.stopPropagation());
    headerDiv.append(dragHandle, chevron, nameInput, imgBtn, removeBtn);
  }

  headerDiv.addEventListener('click', () => div.classList.toggle('collapsed'));

  // Drag-to-reorder within .wl-sections
  // Start as false — only enable dragging when mousedown is on the drag handle,
  // preventing text-selection in the editor from triggering a drag.
  div.setAttribute('draggable', 'false');
  dragHandle.addEventListener('mousedown', () => div.setAttribute('draggable', 'true'));
  div.addEventListener('mousedown', e => { if (!dragHandle.contains(e.target)) div.setAttribute('draggable', 'false'); });
  div.addEventListener('dragend', () => div.setAttribute('draggable', 'false'));
  div.addEventListener('dragstart', e => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // required for Firefox
    div._wlDragSrc = true;
    setTimeout(() => div.classList.add('wl-sec-dragging'), 0);
  });
  div.addEventListener('dragend', () => {
    div._wlDragSrc = false;
    div.classList.remove('wl-sec-dragging');
    div.closest('.wl-sections') && div.closest('.wl-sections').querySelectorAll('.wl-section-editor')
      .forEach(s => s.classList.remove('wl-sec-drag-over-top', 'wl-sec-drag-over-bot'));
  });
  div.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = div.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    div.classList.toggle('wl-sec-drag-over-top', !after);
    div.classList.toggle('wl-sec-drag-over-bot', after);
  });
  div.addEventListener('dragleave', e => {
    if (!div.contains(e.relatedTarget)) {
      div.classList.remove('wl-sec-drag-over-top', 'wl-sec-drag-over-bot');
    }
  });
  div.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    div.classList.remove('wl-sec-drag-over-top', 'wl-sec-drag-over-bot');
    const container = div.closest('.wl-sections');
    if (!container) return;
    const src = Array.from(container.querySelectorAll('.wl-section-editor')).find(s => s._wlDragSrc);
    if (!src || src === div) return;
    const rect = div.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    container.insertBefore(src, after ? div.nextSibling : div);
  });

  // ── CodeMirror 6 editor ──────────────────────────────────────────
  const editorWrap = document.createElement('div');
  editorWrap.className = 'wl-cm-wrap';

  div.appendChild(headerDiv);
  div.appendChild(editorWrap);

  const initialMd = buildSectionMdText(section);

  // Mount CM6 asynchronously (will be ready well before user interaction)
  (async () => {
    const { EditorView, EditorState, basicSetup, markdown, closeBrackets } = await waitForCM6();
    const appTheme = EditorView.theme({
      '&': { background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '13px' },
      '.cm-content': { padding: '8px 12px', minHeight: '80px', caretColor: 'var(--accent)' },
      '.cm-focused': { outline: 'none' },
      '.cm-line': { lineHeight: '1.65' },
      '.cm-gutters': { background: 'var(--surface)', borderRight: '1px solid var(--border-light)', color: 'var(--text-faint)', minWidth: '32px' },
      '.cm-activeLineGutter': { background: 'var(--border-light)' },
      '.cm-selectionBackground, ::selection': { background: 'rgba(var(--accent-rgb),0.18) !important' },
    });
    const state = EditorState.create({
      doc: initialMd,
      extensions: [basicSetup, markdown(), closeBrackets(), appTheme, EditorView.lineWrapping],
    });
    div._cmView = new EditorView({ state, parent: editorWrap });

    // Image paste support
    editorWrap.addEventListener('paste', e => {
      const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items || [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = evt => {
            compressImage(evt.target.result, src => {
              const view = div._cmView;
              if (!view) return;
              const { from, to } = view.state.selection.main;
              view.dispatch({ changes: { from, to, insert: `![](${src})\n` } });
            });
          };
          reader.readAsDataURL(item.getAsFile());
          return;
        }
      }
    });
  })();

  // Insert image button (file picker)
  headerDiv.querySelector('.wl-insert-img-btn').addEventListener('click', e => {
    e.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = () => {
      if (!input.files[0]) return;
      const reader = new FileReader();
      reader.onload = evt => {
        compressImage(evt.target.result, src => {
          const view = div._cmView;
          if (!view) return;
          const { from, to } = view.state.selection.main;
          view.dispatch({ changes: { from, to, insert: `![](${src})\n` } });
          view.focus();
        });
      };
      reader.readAsDataURL(input.files[0]);
    };
    input.click();
  });

  const removeBtn = headerDiv.querySelector('.wl-remove-section');
  if (removeBtn) removeBtn.addEventListener('click', () => div.remove());
  return div;
}

function collectWLSections(container) {
  return Array.from((container || document).querySelectorAll('.wl-section-editor')).map(el => {
    const nameInput  = el.querySelector('.wl-section-name-input');
    const nameLocked = el.querySelector('.wl-section-name-locked');
    const title = nameInput ? (nameInput.value.trim() || 'Notes') : (nameLocked ? nameLocked.textContent : 'Notes');
    // CM6 editor — read from EditorView state
    const value = el._cmView ? el._cmView.state.doc.toString() : (el._cmLastSource || '');
    const nodes = value.trim() ? [{ type: 'text', value }] : [];
    return { title, nodes };
  });
}

function openLightbox(src) {
  document.getElementById('wlLightboxImg').src = src;
  document.getElementById('wlLightbox').classList.add('open');
}

document.getElementById('wlLightboxClose').addEventListener('click', () => {
  document.getElementById('wlLightbox').classList.remove('open');
});
document.getElementById('wlLightbox').addEventListener('click', e => {
  if (e.target === document.getElementById('wlLightbox')) document.getElementById('wlLightbox').classList.remove('open');
});

// ── WL linked items ────────────────────────────────────────────

// Sync bidirectional links when a WL item is saved
function syncWlLinks(wlItemId, wlTitle, wlType, oldLinks, newLinks) {
  const removed = oldLinks.filter(ol => !newLinks.find(nl => nl.type === ol.type && nl.id === ol.id));
  const added   = newLinks.filter(nl => !oldLinks.find(ol => ol.type === nl.type && ol.id === nl.id));

  removed.forEach(link => {
    if (link.type === 'task') {
      const week = db.weeks[link.weekKey];
      const task = week ? (week.tasks || []).find(t => t.id === link.id) : null;
      if (task && task.wlLink === wlItemId) { task.wlLink = ''; saveDB(db); }
    } else if (link.type === 'reminder') {
      const rem = reminders.find(r => r.id === link.id);
      if (rem && rem.wlLink === wlItemId) { rem.wlLink = ''; rem.wlTitle = ''; rem.wlType = ''; saveReminders(reminders); }
    }
  });

  added.forEach(link => {
    if (link.type === 'task') {
      const week = db.weeks[link.weekKey];
      const task = week ? (week.tasks || []).find(t => t.id === link.id) : null;
      if (task) { task.wlLink = wlItemId; saveDB(db); }
    } else if (link.type === 'reminder') {
      const rem = reminders.find(r => r.id === link.id);
      if (rem) { rem.wlLink = wlItemId; rem.wlTitle = wlTitle; rem.wlType = wlType; saveReminders(reminders); }
    }
  });
}

function resolveLinkedLabel(link) {
  if (link.type === 'task') {
    const week = db.weeks[link.weekKey];
    const task = week ? (week.tasks || []).find(t => t.id === link.id) : null;
    return task ? task.name : `${link.label} (removed)`;
  }
  if (link.type === 'reminder') {
    const rem = reminders.find(r => r.id === link.id);
    return rem ? rem.text : `${link.label} (removed)`;
  }
  return link.label;
}

function navigateToLinkedItem(link) {
  if (link.type === 'task') {
    document.getElementById('tabTodos').click();
    if (link.weekKey && link.weekKey !== currentKey) currentKey = link.weekKey;
    render();
    setTimeout(() => createTaskModal(link.id, link.weekKey), 150);
  } else if (link.type === 'rec' || link.type === 'reminder') {
    document.getElementById('tabTodos').click();
    if (link.id) setTimeout(() => createReminderModal(link.id), 150);
  }
}

// ── Task view/edit modal ──────────────────────────────────────────────────────
function createTaskModal(taskId, weekKey) {
  // Find the task — try supplied weekKey first, then search all weeks
  let task = null, foundWeekKey = weekKey;
  if (weekKey && db.weeks[weekKey]) {
    task = db.weeks[weekKey].tasks.find(t => t.id === taskId);
  }
  if (!task) {
    for (const wk of Object.keys(db.weeks || {})) {
      task = db.weeks[wk].tasks.find(t => t.id === taskId);
      if (task) { foundWeekKey = wk; break; }
    }
  }
  if (!task) { showToast('Task not found.', true); return; }

  document.getElementById('taskViewModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'taskViewModal';
  modal.className = 'rem-edit-modal';

  const dragBar = document.createElement('div');
  dragBar.className = 'wl-drag-bar';
  dragBar.innerHTML = '&#8942;&#8942;&#8942;';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn';
  closeBtn.style.cssText = 'font-size:16px;opacity:0.6;margin-left:auto';
  closeBtn.innerHTML = '&#x2715;';
  dragBar.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'rem-edit-body';

  modal.append(dragBar, body);
  document.body.appendChild(modal); modal._openModal?.();

  const removeListeners = setupWLModalDrag(modal, dragBar);

  function close() { removeListeners(); modal.remove(); }

  function getTask() {
    // Re-fetch live reference each time
    return (db.weeks[foundWeekKey]?.tasks || []).find(t => t.id === taskId);
  }

  function renderView() {
    body.innerHTML = '';
    const t = getTask();
    if (!t) { close(); return; }

    const nameEl = document.createElement('div');
    nameEl.className = 'rem-modal-text' + (t.done ? ' task-modal-done' : '');
    nameEl.textContent = t.name;

    const metaEl = document.createElement('div');
    metaEl.className = 'rem-modal-meta';

    if (t.priority) {
      const pBadge = document.createElement('span');
      pBadge.className = `priority-badge priority-${t.priority}`;
      pBadge.textContent = t.priority;
      metaEl.appendChild(pBadge);
    }
    if (t.taskType) {
      const tBadge = document.createElement('span');
      tBadge.className = `wl-type-badge wl-type-${t.taskType}`;
      tBadge.textContent = t.taskType;
      metaEl.appendChild(tBadge);
    }
    if (t.due) {
      const dueEl = document.createElement('span');
      dueEl.className = 'reminder-date';
      dueEl.textContent = 'Due: ' + t.due;
      metaEl.appendChild(dueEl);
    }
    if (t.done) {
      const doneBadge = document.createElement('span');
      doneBadge.className = 'wl-status-badge wl-status-Complete';
      doneBadge.textContent = 'Done';
      metaEl.appendChild(doneBadge);
    }
    if (t.wlLink) {
      const linked = wlItems.find(w => w.id === t.wlLink);
      if (linked) {
        const badge = document.createElement('span');
        badge.className = `wl-type-badge wl-type-${linked.type}`;
        badge.style.cssText = 'font-size:9px;cursor:pointer';
        badge.textContent = `🔗 ${linked.title.slice(0,30)}${linked.title.length>30?'…':''}`;
        badge.addEventListener('click', () => { close(); switchTab('Worklog'); setTimeout(() => createWLModal(linked.id), 150); });
        metaEl.appendChild(badge);
      }
    }

    body.appendChild(nameEl);
    body.appendChild(metaEl);

    if (t.notes && t.notes.trim()) {
      const notesEl = document.createElement('div');
      notesEl.className = 'task-modal-notes';
      notesEl.textContent = t.notes.trim();
      body.appendChild(notesEl);
    }

    const footer = document.createElement('div');
    footer.className = 'rem-edit-footer';
    const editBtn = document.createElement('button');
    editBtn.className = 'add-rec-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', renderEdit);
    footer.appendChild(editBtn);
    body.appendChild(footer);
  }

  function renderEdit() {
    body.innerHTML = '';
    const t = getTask();
    if (!t) { close(); return; }

    const nameIn = document.createElement('input');
    nameIn.type = 'text';
    nameIn.className = 'rem-edit-input';
    nameIn.value = t.name || '';
    nameIn.placeholder = 'Task name…';

    const row1 = document.createElement('div');
    row1.className = 'rem-edit-row';

    const priSel = document.createElement('select');
    priSel.className = 'rem-edit-input';
    ['High','Med','Low'].forEach(v => {
      const o = document.createElement('option');
      o.value = o.textContent = v;
      if (t.priority === v) o.selected = true;
      priSel.appendChild(o);
    });

    const dueIn = document.createElement('input');
    dueIn.type = 'date';
    dueIn.className = 'rem-edit-input';
    dueIn.style.flex = '1';
    dueIn.value = t.due || '';

    row1.append(priSel, dueIn);

    const typeSel = document.createElement('select');
    typeSel.className = 'rem-edit-input';
    const typeNone = document.createElement('option');
    typeNone.value = ''; typeNone.textContent = '— Type —';
    typeSel.appendChild(typeNone);
    ['Halo','Sherlock','Ad-hoc','CMT','Nova','Upgrade','Meetings','Training','SOP','Report','Research','Other'].forEach(v => {
      const o = document.createElement('option');
      o.value = o.textContent = v;
      if (t.taskType === v) o.selected = true;
      typeSel.appendChild(o);
    });

    const notesIn = document.createElement('textarea');
    notesIn.className = 'rem-edit-input';
    notesIn.rows = 3;
    notesIn.placeholder = 'Notes / next steps…';
    notesIn.value = t.notes || '';
    notesIn.style.resize = 'vertical';

    const wlSel = document.createElement('select');
    wlSel.className = 'rem-edit-input';
    wlSel.innerHTML = '<option value="">— Link to work log item (optional) —</option>';
    wlItems.filter(w => !w.archived).forEach(w => {
      const o = document.createElement('option');
      o.value = w.id; o.textContent = `[${w.type}] ${w.title}`;
      if (w.id === t.wlLink) o.selected = true;
      wlSel.appendChild(o);
    });

    const footer = document.createElement('div');
    footer.className = 'rem-edit-footer';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'icon-btn';
    cancelBtn.style.marginRight = 'auto';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', renderView);
    const saveBtn = document.createElement('button');
    saveBtn.className = 'add-rec-btn';
    saveBtn.textContent = 'Save';
    footer.append(cancelBtn, saveBtn);

    body.append(nameIn, row1, typeSel, notesIn, wlSel, footer);
    requestAnimationFrame(() => nameIn.focus());

    function save() {
      const newName = nameIn.value.trim();
      if (!newName) { showToast('Enter a task name.', true); return; }
      const live = getTask();
      if (!live) { close(); return; }
      live.name = newName;
      live.priority = priSel.value;
      live.due = dueIn.value;
      live.taskType = typeSel.value;
      live.notes = notesIn.value;
      const oldWlLink = live.wlLink;
      const newWlLink = wlSel.value;
      live.wlLink = newWlLink;
      if (oldWlLink !== newWlLink) {
        if (oldWlLink) {
          const oldWl = wlItems.find(w => w.id === oldWlLink);
          if (oldWl) { oldWl.linkedItems = (oldWl.linkedItems || []).filter(l => !(l.type === 'task' && l.id === taskId)); saveWL(wlItems); }
        }
        if (newWlLink) {
          const newWl = wlItems.find(w => w.id === newWlLink);
          if (newWl) {
            if (!newWl.linkedItems) newWl.linkedItems = [];
            if (!newWl.linkedItems.find(l => l.type === 'task' && l.id === taskId)) {
              newWl.linkedItems.push({ type: 'task', id: taskId, weekKey: foundWeekKey, label: live.name });
              saveWL(wlItems);
            }
          }
        }
      }
      saveDB(db);
      render();
      showToast('Task saved.');
      renderView();
    }

    saveBtn.addEventListener('click', save);
    nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
    modal.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });
  }

  closeBtn.addEventListener('click', close);
  document.addEventListener('mousedown', function onOutside(e) {
    if (!modal.contains(e.target)) { close(); document.removeEventListener('mousedown', onOutside); }
  }, true);

  renderView();
}

// ── CodeMirror 6 loader ───────────────────────────────────────────
function waitForCM6() {
  if (window.CM6) return Promise.resolve(window.CM6);
  return new Promise(r => window.addEventListener('cm6loaded', () => r(window.CM6), { once: true }));
}

// Convert stored nodes[] → plain markdown string for CM6 initial value
function buildSectionMdText(section) {
  const nodes = section.nodes || [];
  if (nodes.length === 0 && section.content) return section.content;
  return nodes.map(n => {
    if (n.type === 'image') return `![](${n.value})`;
    if (n.type === 'html') {
      // Migrate stored HTML to markdown
      return (n.value || '')
        .replace(/<h1>([\s\S]*?)<\/h1>/gi, '# $1').replace(/<h2>([\s\S]*?)<\/h2>/gi, '## $1')
        .replace(/<h3>([\s\S]*?)<\/h3>/gi, '### $1').replace(/<br\s*\/?>/gi, '\n')
        .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**').replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**')
        .replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*').replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*')
        .replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }
    return n.value || '';
  }).join('\n');
}

// ── WL modal factory — creates a self-contained draggable modal instance ──
let _wlModalZ = 200;
let _modalCount = 0;

function showModalBackdrop() {
  _modalCount++;
  const bd = document.getElementById('modalBackdrop');
  if (!bd) return;
  bd.style.display = 'block';
  requestAnimationFrame(() => bd.classList.add('active'));
}

function hideModalBackdrop() {
  _modalCount = Math.max(0, _modalCount - 1);
  if (_modalCount > 0) return;
  const bd = document.getElementById('modalBackdrop');
  if (!bd) return;
  bd.classList.remove('active');
  setTimeout(() => { if (_modalCount === 0) bd.style.display = 'none'; }, 240);
}

function closeWLModal(modal) {
  if (!modal || modal._closing) return;
  modal._closing = true;
  const t = modal.style.transform || '';
  if (t.includes('none') || (t.includes('px') && !t.includes('calc'))) {
    modal.style.opacity = '0';
  } else {
    modal.style.transform = 'translate(-50%, calc(-50% + 16px))';
    modal.style.opacity = '0';
  }
  hideModalBackdrop();
  if (typeof modal._escHandler === 'function') document.removeEventListener('keydown', modal._escHandler);
  if (typeof modal._dragCleanup === 'function') modal._dragCleanup();
  setTimeout(() => { modal.remove(); if (typeof modal._onClose === 'function') modal._onClose(); }, 240);
}

// ── WL Modal DOM builders ────────────────────────────────────────

function buildWLModalShell() {
  const modal = document.createElement('div');
  modal.className = 'wl-float-modal open';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.style.zIndex = ++_wlModalZ;
  const openCount = document.querySelectorAll('.wl-float-modal.open').length;
  if (openCount > 0) {
    const offset = openCount * 28;
    modal.style.left = `calc(50% + ${offset}px)`;
    modal.style.top  = `calc(50% + ${offset}px)`;
    modal.style.transform = `translate(-50%, calc(-50% + 16px))`;
  }
  modal.addEventListener('mousedown', () => { modal.style.zIndex = ++_wlModalZ; });
  modal._openModal = function() {
    showModalBackdrop();
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('animate-in')));
    const escHandler = e => { if (e.key === 'Escape') closeWLModal(modal); };
    document.addEventListener('keydown', escHandler);
    modal._escHandler = escHandler;
  };
  return modal;
}

function buildWLModalDragBar() {
  const dragBar = document.createElement('div');
  dragBar.className = 'wl-drag-bar';
  const popoutBtn = document.createElement('button');
  popoutBtn.className = 'wl-popout-btn';
  popoutBtn.title = 'Pop out to separate window';
  popoutBtn.setAttribute('aria-label', 'Pop out to separate window');
  popoutBtn.innerHTML = '&#x2922;';
  dragBar.append(popoutBtn);
  return { dragBar, popoutBtn };
}

function buildWLModalHeader(item) {
  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const headerLeft = document.createElement('div');
  headerLeft.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;flex:1';

  const titleIn = document.createElement('input');
  titleIn.type = 'text';
  titleIn.className = 'wl-title-input';
  titleIn.placeholder = 'Item title…';
  titleIn.value = item ? item.title : '';

  const typeSelect = document.createElement('select');
  typeSelect.className = 'wl-inline-select';
  const showBlankType = !item || item.type === 'Uncategorised';
  if (showBlankType) {
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '— Type —';
    typeSelect.appendChild(blank);
  }
  ['Halo','Sherlock','Ad-hoc','CMT','Nova','Upgrade','Meetings','Training','SOP','Report','Research','Other'].forEach(v => {
    const o = document.createElement('option');
    o.value = o.textContent = v;
    typeSelect.appendChild(o);
  });
  typeSelect.value = (item && item.type !== 'Uncategorised') ? item.type : '';

  const statusSelect = document.createElement('select');
  statusSelect.className = 'wl-inline-select';
  ['Not Started','In Progress','Blocked','Under Review','Complete','Archived'].forEach(v => {
    const o = document.createElement('option');
    o.value = o.textContent = v;
    statusSelect.appendChild(o);
  });
  statusSelect.value = item ? item.status : 'Not Started';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn wl-close-btn';
  closeBtn.style.cssText = 'font-size:18px;opacity:0.6';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '&#x2715;';

  headerLeft.append(titleIn, typeSelect, statusSelect);
  header.append(headerLeft, closeBtn);
  return { header, titleIn, typeSelect, statusSelect, closeBtn };
}

function buildWLModalTicketRow(item) {
  const ticketRow = document.createElement('div');
  ticketRow.className = 'wl-ticket-row';
  const ticketIn = document.createElement('input');
  ticketIn.type = 'text';
  ticketIn.className = 'wl-ticket-input';
  ticketIn.placeholder = 'Epic / Sherlock ticket URL or ID (optional)…';
  ticketIn.value = item ? (item.ticket || '') : '';
  ticketRow.appendChild(ticketIn);
  return { ticketRow, ticketIn };
}

function buildWLLinksSection(existingLinks) {
  const linksSection = document.createElement('div');
  linksSection.className = 'wl-links-section';
  const linksLabel = document.createElement('div');
  linksLabel.className = 'wl-links-label';
  linksLabel.textContent = 'Linked items';
  const linkedListEl = document.createElement('div');
  linkedListEl.className = 'wl-links-list';

  // Stored links: [{ type, id, title }]
  const links = (existingLinks || []).map(l => ({ ...l }));

  function renderLinks() {
    linkedListEl.innerHTML = '';
    links.forEach((lnk, i) => {
      const chip = document.createElement('span');
      chip.className = 'snip-tag-chip';
      chip.innerHTML = `<span style="font-size:9px;color:var(--text-faint);margin-right:3px">[${lnk.type}]</span>${escHtml(lnk.title)}<button class="icon-btn del" style="font-size:9px;padding:0 2px" title="Remove">&#x2715;</button>`;
      chip.querySelector('button').addEventListener('click', () => { links.splice(i, 1); renderLinks(); });
      linkedListEl.appendChild(chip);
    });
  }
  renderLinks();

  const linksAdd = document.createElement('div');
  linksAdd.className = 'wl-links-add';
  const linkTypeSelect = document.createElement('select');
  linkTypeSelect.innerHTML = `
    <option value="">Link to…</option>
    <option value="wl">Work Log item</option>
    <option value="clinical">Clinical</option>
    <option value="cogito">Cogito</option>
    <option value="reqproc">Req & Proc</option>
    <option value="trustanalytics">Trust Analytics</option>
  `;
  const linkItemSelect = document.createElement('select');
  linkItemSelect.style.cssText = 'flex:1;min-width:180px';
  linkItemSelect.innerHTML = '<option value="">— select item —</option>';

  const HUB_MAP = {
    wl:              () => (typeof wlItems !== 'undefined' ? wlItems : []),
    clinical:        () => (typeof clinicalEntries !== 'undefined' ? clinicalEntries : []),
    cogito:          () => (typeof cogitoEntries !== 'undefined' ? cogitoEntries : []),
    reqproc:         () => (typeof reqprocEntries !== 'undefined' ? reqprocEntries : []),
    trustanalytics:  () => (typeof trustanalyticsEntries !== 'undefined' ? trustanalyticsEntries : []),
  };

  linkTypeSelect.addEventListener('change', () => {
    const entries = HUB_MAP[linkTypeSelect.value]?.() || [];
    linkItemSelect.innerHTML = '<option value="">— select item —</option>';
    entries.filter(e => !e.archived).forEach(e => {
      const o = document.createElement('option');
      o.value = e.id;
      o.textContent = e.title || e.name || e.id;
      linkItemSelect.appendChild(o);
    });
  });

  const addLinkBtn = document.createElement('button');
  addLinkBtn.className = 'tool-btn';
  addLinkBtn.textContent = '+ Add';
  addLinkBtn.addEventListener('click', () => {
    const type = linkTypeSelect.value;
    const id   = linkItemSelect.value;
    const title = linkItemSelect.options[linkItemSelect.selectedIndex]?.textContent;
    if (!type || !id || !title || links.some(l => l.id === id)) return;
    links.push({ type, id, title });
    renderLinks();
    linkTypeSelect.value = '';
    linkItemSelect.innerHTML = '<option value="">— select item —</option>';
  });

  linksAdd.append(linkTypeSelect, linkItemSelect, addLinkBtn);
  linksSection.append(linksLabel, linkedListEl, linksAdd);

  // Expose collected links for callers to read on save
  linksSection._getLinks = () => links.slice();

  return { linksSection, linkedListEl, linkTypeSelect, linkItemSelect, addLinkBtn };
}

// isTop: true = top action bar (above sections), false = footer (below)
function buildWLActionBar(isTop) {
  const bar = document.createElement('div');
  bar.className = 'wl-modal-footer';
  if (isTop) { bar.style.borderTop = 'none'; bar.style.borderBottom = '1px solid var(--border-light)'; }
  const addSectionBtn = document.createElement('button');
  addSectionBtn.className = 'tool-btn';
  addSectionBtn.textContent = '+ Add section';
  const barRight = document.createElement('div');
  barRight.style.cssText = 'margin-left:auto;display:flex;gap:8px';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'tool-btn primary';
  saveBtn.textContent = 'Save';
  barRight.append(saveBtn);
  bar.append(addSectionBtn, barRight);
  // copyMdBtn/dlMdBtn are null — callers that destructure them will get undefined (safe)
  return { bar, addSectionBtn, copyMdBtn: null, dlMdBtn: null, saveBtn };
}

// ── Shared edit modal footer: Delete + Archive ────────────────────
function buildWLEditFooter({ onDelete, onArchive }) {
  const footer = document.createElement('div');
  footer.className = 'wl-modal-footer wl-edit-footer';
  const delBtn = document.createElement('button');
  delBtn.className = 'tool-btn wl-delete-btn';
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => {
    if (confirm('Delete this entry? This cannot be undone.')) onDelete();
  });
  const archBtn = document.createElement('button');
  archBtn.className = 'tool-btn';
  archBtn.textContent = 'Archive';
  archBtn.style.marginLeft = 'auto';
  archBtn.addEventListener('click', onArchive);
  footer.append(delBtn, archBtn);
  return footer;
}

// ── Global tag pool — aggregates tags from all entry hubs ─────────
function getAllKnownTags() {
  return [...new Set([
    ...(typeof clinicalEntries !== 'undefined' ? clinicalEntries : []),
    ...(typeof cogitoEntries   !== 'undefined' ? cogitoEntries   : []),
    ...(typeof reqprocEntries  !== 'undefined' ? reqprocEntries  : []),
    ...(typeof trustanalyticsEntries !== 'undefined' ? trustanalyticsEntries : []),
    ...(typeof wlItems !== 'undefined' ? wlItems : []),
  ].flatMap(e => e.tags || []))].sort();
}

function buildWLFormatBar() {
  const formatBar = document.createElement('div');
  formatBar.className = 'wl-format-bar';
  formatBar.style.cssText = 'border-top:none;border-bottom:1px solid var(--border-light);flex-shrink:0';

  // Find the CM6 EditorView that currently has focus (or was last focused)
  let _lastFocusedView = null;
  document.addEventListener('focusin', e => {
    const wrap = e.target.closest('.wl-cm-wrap');
    if (wrap) {
      const sec = wrap.closest('.wl-section-editor');
      if (sec?._cmView) _lastFocusedView = sec._cmView;
    }
  }, true);

  function getFocusedView() {
    const wrap = document.querySelector('.wl-cm-wrap:focus-within');
    if (wrap) {
      const sec = wrap.closest('.wl-section-editor');
      if (sec?._cmView) return sec._cmView;
    }
    return _lastFocusedView;
  }

  function insertMdAtCursor(before, after) {
    const view = getFocusedView();
    if (!view) return;
    const { from, to } = view.state.selection.main;
    const selected = view.state.sliceDoc(from, to);
    view.dispatch({
      changes: { from, to, insert: before + selected + after },
      selection: { anchor: from + before.length + selected.length + after.length },
    });
    view.focus();
  }

  // Track per-formatBar state for toggleable buttons
  let _vimEnabled = false;
  let _lineNumsEnabled = false;

  function toggleVim(btn) {
    _vimEnabled = !_vimEnabled;
    btn.classList.toggle('wl-fmt-btn-active', _vimEnabled);
    // Apply to all open CM6 views in this modal
    const modal = btn.closest('.wl-float-modal');
    if (!modal) return;
    (async () => {
      const { EditorView, EditorState, basicSetup, markdown, closeBrackets, vim } = await waitForCM6();
      modal.querySelectorAll('.wl-section-editor').forEach(sec => {
        if (!sec._cmView) return;
        const doc = sec._cmView.state.doc;
        const exts = _vimEnabled
          ? [basicSetup, markdown(), closeBrackets(), vim(), EditorView.lineWrapping]
          : [basicSetup, markdown(), closeBrackets(), EditorView.lineWrapping];
        sec._cmView.setState(EditorState.create({ doc, extensions: exts }));
      });
    })();
  }

  function toggleLineNumbers(btn) {
    _lineNumsEnabled = !_lineNumsEnabled;
    btn.classList.toggle('wl-fmt-btn-active', _lineNumsEnabled);
    const modal = btn.closest('.wl-float-modal');
    if (!modal) return;
    (async () => {
      const { EditorView, EditorState, basicSetup, markdown, closeBrackets, lineNumbers, vim } = await waitForCM6();
      modal.querySelectorAll('.wl-section-editor').forEach(sec => {
        if (!sec._cmView) return;
        const doc = sec._cmView.state.doc;
        const exts = [basicSetup, markdown(), closeBrackets(), EditorView.lineWrapping,
          ...(_lineNumsEnabled ? [lineNumbers()] : []),
          ...(_vimEnabled ? [vim()] : [])];
        sec._cmView.setState(EditorState.create({ doc, extensions: exts }));
      });
    })();
  }

  function togglePreview(btn, sectionDiv) {
    if (!sectionDiv) {
      // No specific section — toggle all in modal
      const modal = btn.closest('.wl-float-modal');
      modal?.querySelectorAll('.wl-section-editor').forEach(sec => _toggleSectionPreview(sec, btn));
      return;
    }
    _toggleSectionPreview(sectionDiv, btn);
  }

  function _toggleSectionPreview(sectionDiv, btn) {
    const wrap = sectionDiv.querySelector('.wl-cm-wrap');
    let preview = sectionDiv.querySelector('.wl-cm-preview');
    if (preview) {
      // Back to editor
      preview.remove();
      if (wrap) wrap.style.display = '';
      sectionDiv._cmPreviewActive = false;
      if (btn) btn.classList.remove('wl-fmt-btn-active');
    } else {
      // Show rendered preview
      const view = sectionDiv._cmView;
      const src = view ? view.state.doc.toString() : (sectionDiv._cmLastSource || '');
      sectionDiv._cmLastSource = src;
      if (wrap) wrap.style.display = 'none';
      preview = document.createElement('div');
      preview.className = 'wl-cm-preview wl-view-section-body';
      preview.innerHTML = typeof marked !== 'undefined' ? marked.parse(src) : `<pre>${escHtml(src)}</pre>`;
      sectionDiv.appendChild(preview);
      sectionDiv._cmPreviewActive = true;
      if (btn) btn.classList.add('wl-fmt-btn-active');
    }
  }

  function insertTable() {
    insertMdAtCursor('| Col 1 | Col 2 | Col 3 |\n|-------|-------|-------|\n|       |       |       |\n', '');
  }

  [
    { label: '<b>B</b>',  title: 'Bold (**text**)',              action: () => insertMdAtCursor('**', '**') },
    { label: '<i>I</i>',  title: 'Italic (*text*)',               action: () => insertMdAtCursor('*', '*') },
    { label: '<u>U</u>',  title: 'Underline (<u>text</u>)',       action: () => insertMdAtCursor('<u>', '</u>') },
    { label: '`·`',       title: 'Inline code (`code`)',          action: () => insertMdAtCursor('`', '`') },
    { label: '==',        title: 'Highlight (==text==)',          action: () => insertMdAtCursor('==', '==') },
    { label: '—' },
    { label: 'H1', title: 'Heading 1 (# )',    action: () => insertMdAtCursor('# ', '') },
    { label: 'H2', title: 'Heading 2 (## )',   action: () => insertMdAtCursor('## ', '') },
    { label: 'H3', title: 'Heading 3 (### )',  action: () => insertMdAtCursor('### ', '') },
    { label: '—' },
    { label: '•',   title: 'Bullet list (- )',           action: () => insertMdAtCursor('- ', '') },
    { label: '1.',  title: 'Numbered list (1. )',         action: () => insertMdAtCursor('1. ', '') },
    { label: '>',   title: 'Blockquote (> )',             action: () => insertMdAtCursor('> ', '') },
    { label: '—' },
    { label: '☑',   title: 'Todo checkbox (- [ ] )',      action: () => insertMdAtCursor('- [ ] ', '') },
    { label: 'HR',  title: 'Horizontal rule (---)',        action: () => insertMdAtCursor('\n---\n', '') },
    { label: '[⇗]', title: 'Link ([text](url))',           action: () => insertMdAtCursor('[', '](url)') },
    { label: '—' },
    { label: 'SQL',  title: 'SQL code block',  action: () => insertMdAtCursor('```sql\n', '\n```') },
    { label: 'JSON', title: 'JSON code block', action: () => insertMdAtCursor('```json\n', '\n```') },
    { label: '</>',  title: 'Code block',      action: () => insertMdAtCursor('```\n', '\n```') },
    { label: '⊞',   title: 'Insert table',    action: () => insertTable() },
    { label: '—' },
    { label: '👁',   title: 'Toggle preview (render markdown)', special: 'preview' },
    { label: '#¶',   title: 'Toggle line numbers',              special: 'linenum' },
    { label: 'Vim',  title: 'Toggle Vim keybindings',           special: 'vim' },
  ].forEach(item => {
    if (item.label === '—') { const sep = document.createElement('span'); sep.className = 'wl-fmt-sep'; formatBar.appendChild(sep); return; }
    const btn = document.createElement('button');
    btn.className = 'wl-fmt-btn';
    if (['SQL', 'JSON', '</>'].includes(item.label)) btn.classList.add('wl-fmt-btn-code');
    btn.innerHTML = item.label;
    btn.title = item.title;
    if (item.special === 'vim') {
      btn.addEventListener('mousedown', e => { e.preventDefault(); toggleVim(btn); });
    } else if (item.special === 'linenum') {
      btn.addEventListener('mousedown', e => { e.preventDefault(); toggleLineNumbers(btn); });
    } else if (item.special === 'preview') {
      btn.addEventListener('mousedown', e => { e.preventDefault(); togglePreview(btn, null); });
    } else {
      btn.addEventListener('mousedown', e => { e.preventDefault(); item.action(); });
    }
    formatBar.appendChild(btn);
  });
  return formatBar;
}

// ── WL Documentation Templates ────────────────────────────────────────────────
const WL_DEFAULT_SECTIONS = [
  { title: 'Overview',    nodes: [], locked: true },
  { title: 'Notes',       nodes: [] },
  { title: 'Next steps',  nodes: [] }
];

const WL_TEMPLATES = {
  'Halo': [
    { title: 'Overview',            nodes: [], locked: true },
    { title: 'Investigation',       nodes: [], hint: 'What have you found so far?' },
    { title: 'Build/Solution',      nodes: [], hint: 'Document what you have done.' },
    { title: 'Final Communication', nodes: [], hint: 'The email sent to the user' },
  ],
  'Sherlock': [
    { title: 'Overview',       nodes: [], locked: true },
    { title: 'Investigation',  nodes: [] },
    { title: 'Build/Solution', nodes: [] },
  ],
  'Ad-hoc': [
    { title: 'Overview', nodes: [], locked: true },
  ],
  'CMT': [
    { title: 'Content Management', nodes: [], locked: true, hint: 'Document Analyst and Ticket IDs. Ensure the checklist for RW Templates, etc is followed.' },
    { title: 'Support',            nodes: [], hint: 'Any questions from Analysts' },
    { title: 'Follow-ups',         nodes: [], hint: 'Agree dates and times to send the tickets to TST/SUP/REL/PRD.' },
  ],
  'Nova': [
    { title: 'Overview',     nodes: [], locked: true },
    { title: 'What Changed', nodes: [] },
    { title: 'Build',        nodes: [] },
  ],
  'Upgrade': [
    { title: 'Version',         nodes: [], locked: true },
    { title: 'Allocated Novas', nodes: [], hint: 'List of Novas and URLs to work on - link to any Nova type documentation.' },
    { title: 'Link to Nova',    nodes: [], hint: 'Link to Epic Nova website' },
  ],
  'Meetings': [
    { title: 'Attendees',  nodes: [], locked: true },
    { title: 'Overview',   nodes: [], locked: true },
    { title: 'Discussion', nodes: [] },
    { title: 'Follow-ups', nodes: [] },
  ],
  'Training': [
    { title: 'Certification',  nodes: [], locked: true },
    { title: 'Admin',          nodes: [], hint: 'Document any credentials to environments or user IDs for training.' },
    { title: 'Chapter',        nodes: [], hint: "Take notes per chapter. Add a summary at the end to consolidate what you've learned." },
    { title: 'Review and MCQ', nodes: [], hint: 'Add MCQ questions here to review and prepare for exams.' },
  ],
  'SOP': [
    { title: 'Overview', nodes: [], locked: true },
  ],
  'Report': [
    { title: 'Overview', nodes: [], locked: true },
  ],
  'Research': [
    { title: 'Overview', nodes: [], locked: true },
  ],
};

function buildWLSectionsContainer(item, type) {
  const sectionsEl = document.createElement('div');
  sectionsEl.className = 'wl-sections';
  sectionsEl.style.cssText = 'flex:1;overflow-y:auto;min-height:0';
  const sections = item ? item.sections : (WL_TEMPLATES[type] || WL_DEFAULT_SECTIONS);
  sections.forEach(s => sectionsEl.appendChild(buildWLSectionEditor(s)));
  return sectionsEl;
}

function setupWLModalLinks(linkedListEl, linkTypeSelect, linkItemSelect, addLinkBtn, currentLinks, getCloseModal) {
  function renderLinks() {
    linkedListEl.innerHTML = '';
    currentLinks.forEach((link, i) => {
      const icon = link.type === 'task' ? '📋' : '🔔';
      const label = resolveLinkedLabel(link);
      const span = document.createElement('span');
      span.className = `wl-linked-badge type-${link.type}`;
      span.style.cursor = 'pointer';
      span.innerHTML = `<span class="wl-linked-badge-nav" title="Go to: ${escHtml(label)}">${icon} ${escHtml(label)}</span> <span class="wl-linked-badge-del" title="Remove">&#x2715;</span>`;
      span.querySelector('.wl-linked-badge-del').addEventListener('click', e => { e.stopPropagation(); currentLinks.splice(i, 1); renderLinks(); });
      span.querySelector('.wl-linked-badge-nav').addEventListener('click', () => { getCloseModal()(); navigateToLinkedItem(link); });
      linkedListEl.appendChild(span);
    });
  }
  renderLinks();

  linkTypeSelect.addEventListener('change', () => {
    const type = linkTypeSelect.value;
    linkItemSelect.innerHTML = '<option value="">— select item —</option>';
    if (type === 'task') {
      Object.entries(db.weeks).forEach(([wk, week]) => {
        (week.tasks || []).filter(t => !t.done).forEach(t => {
          const o = document.createElement('option');
          o.value = JSON.stringify({ type: 'task', id: t.id, weekKey: wk, label: t.name });
          o.textContent = `${t.name} (w/c ${fmtDate(wk)})`;
          linkItemSelect.appendChild(o);
        });
      });
    } else if (type === 'reminder') {
      reminders.filter(r => !r.done).forEach(r => {
        const o = document.createElement('option');
        o.value = JSON.stringify({ type: 'reminder', id: r.id, label: r.text });
        o.textContent = r.text + (r.date ? ` (${fmtDate(r.date)})` : '');
        linkItemSelect.appendChild(o);
      });
    }
  });

  addLinkBtn.addEventListener('click', () => {
    const val = linkItemSelect.value;
    if (!val) { showToast('Select an item to link.', true); return; }
    const link = JSON.parse(val);
    if (currentLinks.find(l => l.type === link.type && l.id === link.id)) { showToast('Already linked.', true); return; }
    currentLinks.push(link);
    renderLinks();
    linkItemSelect.value = '';
  });
}

// ── Reminder modal (view → edit) ──────────────────────────────────────────────
function createReminderModal(remId) {
  const rem = reminders.find(r => r.id === remId);
  if (!rem) return;

  document.getElementById('remEditModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'remEditModal';
  modal.className = 'rem-edit-modal';

  // Drag bar
  const dragBar = document.createElement('div');
  dragBar.className = 'wl-drag-bar';
  dragBar.innerHTML = '&#8942;&#8942;&#8942;';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn';
  closeBtn.style.cssText = 'font-size:16px;opacity:0.6;margin-left:auto';
  closeBtn.innerHTML = '&#x2715;';
  closeBtn.title = 'Close';
  dragBar.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'rem-edit-body';

  modal.append(dragBar, body);
  document.body.appendChild(modal); modal._openModal?.();

  const removeListeners = setupWLModalDrag(modal, dragBar);

  function close() {
    removeListeners();
    modal.remove();
  }

  function renderView() {
    body.innerHTML = '';
    const status = getReminderStatus(rem);

    // Status stripe at top
    const stripe = document.createElement('div');
    stripe.className = 'rem-view-stripe rem-view-stripe-' + (rem.done ? 'done' : status);

    // Title
    const textEl = document.createElement('div');
    textEl.className = 'rem-modal-text' + (rem.done ? ' rem-modal-text-done' : '');
    textEl.textContent = rem.text;

    // Meta row: date + priority + wl link
    const metaEl = document.createElement('div');
    metaEl.className = 'rem-modal-meta';
    if (rem.date) {
      const dateSpan = document.createElement('span');
      dateSpan.className = 'rem-view-date' + (status === 'due' ? ' rem-overdue' : status === 'soon' ? ' rem-soon' : '');
      dateSpan.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:3px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${fmtReminderDate(rem)}`;
      metaEl.appendChild(dateSpan);
    }
    if (rem.priority) {
      const priBadge = document.createElement('span');
      priBadge.className = `priority-badge priority-${rem.priority}`;
      priBadge.textContent = rem.priority;
      metaEl.appendChild(priBadge);
    }
    if (rem.wlLink) {
      const linked = wlItems.find(w => w.id === rem.wlLink);
      if (linked) {
        const badge = document.createElement('span');
        badge.className = `wl-type-badge wl-type-${linked.type}`;
        badge.style.cssText = 'font-size:9px;cursor:pointer';
        badge.textContent = `🔗 ${linked.title.slice(0,30)}${linked.title.length>30?'…':''}`;
        badge.addEventListener('click', () => { close(); switchTab('Worklog'); setTimeout(() => createWLModal(linked.id), 150); });
        metaEl.appendChild(badge);
      }
    }
    if (rem.link) {
      const a = document.createElement('a');
      a.className = 'reminder-link';
      a.href = rem.link; a.target = '_blank';
      a.textContent = rem.link.replace(/^https?:\/\//, '').slice(0, 40);
      metaEl.appendChild(a);
    }

    // Notes
    const els = [stripe, textEl, metaEl];
    if (rem.notes && rem.notes.trim()) {
      const notesEl = document.createElement('div');
      notesEl.className = 'rem-modal-notes';
      notesEl.textContent = rem.notes.trim();
      els.push(notesEl);
    }

    // Footer: Delete + Edit on left, Mark Done on right
    const footer = document.createElement('div');
    footer.className = 'rem-edit-footer rem-view-footer';

    const leftBtns = document.createElement('div');
    leftBtns.style.cssText = 'display:flex;gap:8px;';

    const delBtn = document.createElement('button');
    delBtn.className = 'rem-view-action-btn rem-view-del-btn';
    delBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg> Delete`;
    delBtn.addEventListener('click', () => {
      reminders = reminders.filter(r => r.id !== rem.id);
      saveReminders(reminders); renderReminders(); close();
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'add-rec-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', renderEdit);

    leftBtns.append(delBtn, editBtn);

    let markDoneBtn;
    if (!rem.done) {
      markDoneBtn = document.createElement('button');
      markDoneBtn.className = 'rem-view-action-btn rem-view-done-btn';
      markDoneBtn.style.marginLeft = 'auto';
      markDoneBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Mark done`;
      markDoneBtn.addEventListener('click', () => {
        const r = reminders.find(r => r.id === rem.id);
        if (r) { r.done = true; r.doneAt = localDateStr(); saveReminders(reminders); renderReminders(); }
        renderView();
      });
    } else {
      markDoneBtn = document.createElement('button');
      markDoneBtn.className = 'rem-view-action-btn';
      markDoneBtn.style.marginLeft = 'auto';
      markDoneBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg> Undo`;
      markDoneBtn.addEventListener('click', () => {
        const r = reminders.find(r => r.id === rem.id);
        if (r) { r.done = false; delete r.doneAt; saveReminders(reminders); renderReminders(); }
        renderView();
      });
    }

    footer.append(leftBtns, markDoneBtn);
    els.push(footer);
    body.append(...els);
  }

  function renderEdit() {
    body.innerHTML = '';

    const textIn = document.createElement('input');
    textIn.type = 'text';
    textIn.className = 'rem-edit-input';
    textIn.placeholder = 'Reminder text…';
    textIn.value = rem.text || '';

    const dtRow = document.createElement('div');
    dtRow.className = 'rem-edit-row';
    const dateIn = document.createElement('input');
    dateIn.type = 'date';
    dateIn.className = 'rem-edit-input';
    dateIn.style.flex = '1';
    dateIn.value = rem.date || '';
    const timeIn = document.createElement('input');
    timeIn.type = 'time';
    timeIn.className = 'rem-edit-input';
    timeIn.style.width = '110px';
    timeIn.value = rem.time || '';
    dtRow.append(dateIn, timeIn);

    const wlSel = document.createElement('select');
    wlSel.className = 'rem-edit-input';
    wlSel.innerHTML = '<option value="">— Link to work log item (optional) —</option>';
    wlItems.filter(w => !w.archived).forEach(w => {
      const o = document.createElement('option');
      o.value = w.id; o.textContent = `[${w.type}] ${w.title}`;
      if (w.id === rem.wlLink) o.selected = true;
      wlSel.appendChild(o);
    });

    const priSel = document.createElement('select');
    priSel.className = 'rem-edit-input';
    ['', 'High', 'Med', 'Low'].forEach(v => {
      const o = document.createElement('option');
      o.value = v; o.textContent = v || 'No priority';
      if ((rem.priority || '') === v) o.selected = true;
      priSel.appendChild(o);
    });

    const notesIn = document.createElement('textarea');
    notesIn.className = 'rem-edit-input rem-edit-notes';
    notesIn.placeholder = 'Notes (optional)…';
    notesIn.rows = 4;
    notesIn.value = rem.notes || '';

    const linkIn = document.createElement('input');
    linkIn.type = 'url';
    linkIn.className = 'rem-edit-input';
    linkIn.placeholder = 'External link (optional)…';
    linkIn.value = rem.link || '';

    const footer = document.createElement('div');
    footer.className = 'rem-edit-footer';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'icon-btn';
    cancelBtn.style.marginRight = 'auto';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', renderView);
    const saveBtn = document.createElement('button');
    saveBtn.className = 'add-rec-btn';
    saveBtn.textContent = 'Save';
    footer.append(cancelBtn, saveBtn);

    body.append(textIn, dtRow, priSel, wlSel, notesIn, linkIn, footer);
    requestAnimationFrame(() => textIn.focus());

    function save() {
      const text = textIn.value.trim();
      if (!text) { showToast('Enter a reminder text.', true); return; }
      rem.text = text;
      rem.date = dateIn.value;
      rem.time = timeIn.value;
      rem.priority = priSel.value || undefined;
      rem.notes = notesIn.value.trim() || undefined;
      rem.link = linkIn.value.trim();
      const wlId = wlSel.value;
      const linked = wlId ? wlItems.find(w => w.id === wlId) : null;
      rem.wlLink  = wlId;
      rem.wlTitle = linked ? linked.title : '';
      rem.wlType  = linked ? linked.type  : '';
      saveReminders(reminders);
      renderReminders();
      showToast('Reminder saved.');
      renderView();
    }

    saveBtn.addEventListener('click', save);
    textIn.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
    modal.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });
  }

  closeBtn.addEventListener('click', close);
  document.addEventListener('mousedown', function onOutside(e) {
    if (!modal.contains(e.target)) { close(); document.removeEventListener('mousedown', onOutside); }
  }, true);

  renderView();
}

function setupWLModalDrag(modal, dragBar) {
  let dragging = false, offX = 0, offY = 0;

  function startDrag(clientX, clientY) {
    dragging = true;
    const rect = modal.getBoundingClientRect();
    modal.style.left = rect.left + 'px'; modal.style.top = rect.top + 'px'; modal.style.transform = 'none';
    offX = clientX - rect.left; offY = clientY - rect.top;
  }
  function moveDrag(clientX, clientY) {
    if (!dragging) return;
    modal.style.left = (clientX - offX) + 'px'; modal.style.top = (clientY - offY) + 'px';
  }

  const onMove      = e => moveDrag(e.clientX, e.clientY);
  const onTouchMove = e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); };
  const onUp        = () => { dragging = false; };

  dragBar.addEventListener('mousedown',  e => { startDrag(e.clientX, e.clientY); e.preventDefault(); });
  dragBar.addEventListener('touchstart', e => { startDrag(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, { passive: false });

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend',  onUp);

  return () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend',  onUp);
  };
}

// ── WL View Modal (read-only) ─────────────────────────────────────

function openWLViewModal(itemId) {
  if (document.querySelector(`.wl-float-modal[data-view-id="${CSS.escape(itemId)}"]`)) return;
  const item = wlItems.find(i => i.id === itemId);
  if (!item) return;

  const modal = buildWLModalShell();
  modal.dataset.viewId = itemId;

  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  // Header: title + meta row + close
  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const headerLeft = document.createElement('div');
  headerLeft.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:1;min-width:0';
  const titleEl = document.createElement('div');
  titleEl.className = 'wl-view-title';
  titleEl.textContent = item.title;
  const metaRow = document.createElement('div');
  metaRow.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap';
  metaRow.innerHTML = `<span class="wl-type-badge wl-type-${item.type}">${item.type}</span><span class="${wlStatusClass(item.status)}">${item.status}</span>`;
  if (item.ticket) {
    metaRow.innerHTML += `<a class="wl-card-ticket" href="${escHtml(item.ticket)}" target="_blank" title="${escHtml(item.ticket)}">&#128279; ${escHtml(wlTicketLabel(item.ticket))}</a>`;
  }
  metaRow.innerHTML += `<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);margin-left:auto">${wlFmtTs(item.updatedAt)}</span>`;
  headerLeft.append(titleEl, metaRow);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn wl-close-btn';
  closeBtn.style.cssText = 'font-size:18px;opacity:0.6;align-self:flex-start;flex-shrink:0';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '&#x2715;';
  header.append(headerLeft, closeBtn);

  // Sections
  const sectionsEl = document.createElement('div');
  sectionsEl.className = 'wl-view-sections';
  item.sections.forEach((s, sIdx) => {
    const hasContent = (s.nodes || []).some(n => (n.value || '').trim() || n.type === 'image') || (s.content || '').trim();
    if (!hasContent) return;
    sectionsEl.appendChild(_buildViewSection(s, itemId, sIdx));
  });
  // Linked items
  if ((item.linkedItems || []).length > 0) {
    const linkedDiv = document.createElement('div');
    linkedDiv.className = 'wl-linked-display wl-view-linked';
    (item.linkedItems || []).forEach(l => {
      const icon = l.type === 'task' ? '📋' : '🔔';
      const label = resolveLinkedLabel(l);
      const badge = document.createElement('span');
      badge.className = `wl-linked-badge type-${l.type} clickable`;
      badge.title = `Go to: ${label}`;
      badge.innerHTML = `${icon} ${escHtml(label)}`;
      badge.addEventListener('click', () => navigateToLinkedItem(l));
      linkedDiv.appendChild(badge);
    });
    sectionsEl.appendChild(linkedDiv);
  }

  // Time total
  const wlTotalSecs = getTotalSecs(item);
  if (wlTotalSecs > 0) {
    const timeDiv = document.createElement('div');
    timeDiv.className = 'wl-view-time';
    timeDiv.innerHTML = `⏱ Total logged time: <strong>${fmtDuration(wlTotalSecs)}</strong>`;
    sectionsEl.appendChild(timeDiv);
  }

  // Footer
  const footer = document.createElement('div');
  footer.className = 'wl-modal-footer';
  const editBtn = document.createElement('button');
  editBtn.className = 'tool-btn primary';
  editBtn.style.marginLeft = 'auto';
  editBtn.innerHTML = '&#9998; Edit';
  footer.append(editBtn);

  modal.append(dragBar, header, sectionsEl, footer);
  document.body.appendChild(modal); modal._openModal?.();

  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  editBtn.addEventListener('click', () => { closeModal(); createWLModal(itemId); });
}

// ── WL Modal orchestrator ────────────────────────────────────────

function createWLModal(editId) {
  // Prevent duplicate modals for the same item
  if (editId && document.querySelector(`.wl-float-modal[data-edit-id="${CSS.escape(editId)}"]`)) return;
  const item = editId ? wlItems.find(i => i.id === editId) : null;
  let currentLinks = item ? (item.linkedItems || []).slice() : [];

  // Build DOM
  const modal      = buildWLModalShell();
  if (editId) modal.dataset.editId = editId;
  const { dragBar, popoutBtn }                                                     = buildWLModalDragBar();
  const { header, titleIn, typeSelect, statusSelect, closeBtn }                    = buildWLModalHeader(item);
  const { ticketRow, ticketIn }                                                    = buildWLModalTicketRow(item);
  const { linksSection, linkedListEl, linkTypeSelect, linkItemSelect, addLinkBtn } = buildWLLinksSection();
  const { bar: topBar, addSectionBtn: addSectionBtnTop, copyMdBtn: copyMdBtnTop, dlMdBtn: dlMdBtnTop, saveBtn: saveBtnTop } = buildWLActionBar(true);
  const formatBar  = buildWLFormatBar();
  const sectionsEl = buildWLSectionsContainer(item, item ? item.type : typeSelect.value);
  const { bar: footer, addSectionBtn, copyMdBtn, dlMdBtn, saveBtn }                = buildWLActionBar(false);

  // ── Header collapse toggle ───────────────────────────────────────
  const WL_COLLAPSED_KEY = 'wl_modal_collapsed';
  let wlCollapsed = localStorage.getItem(WL_COLLAPSED_KEY) === '1';
  const collapseBtn = document.createElement('button');
  collapseBtn.className = 'wl-collapse-btn';

  function applyWLCollapse() {
    const hide = wlCollapsed;
    ticketRow.style.display    = hide ? 'none' : '';
    linksSection.style.display = hide ? 'none' : '';
    topBar.style.display       = hide ? 'none' : '';
    collapseBtn.textContent    = hide ? '▾ more' : '▴ less';
  }
  collapseBtn.addEventListener('click', e => {
    e.stopPropagation();
    wlCollapsed = !wlCollapsed;
    localStorage.setItem(WL_COLLAPSED_KEY, wlCollapsed ? '1' : '0');
    applyWLCollapse();
  });
  header.insertBefore(collapseBtn, closeBtn);
  applyWLCollapse();

  const downloadStamp = document.createElement('div');
  downloadStamp.className = 'wl-download-stamp';
  function refreshDownloadStamp() {
    const cur = editId ? wlItems.find(i => i.id === editId) : null;
    downloadStamp.innerHTML = (cur && cur.downloadedAt)
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Last downloaded as .md: ${wlFmtTs(cur.downloadedAt)}`
      : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Never downloaded as .md`;
  }
  refreshDownloadStamp();

  // ── Linked snippets section ──────────────────────────────────────
  let linkedSnipIds = item ? [...(item.linkedSnippets || [])] : [];
  const linkedSnipsSection = document.createElement('div');
  linkedSnipsSection.className = 'snip-link-section';

  const LS_COLLAPSED_KEY = 'wl_snips_collapsed';
  let lsCollapsed = localStorage.getItem(LS_COLLAPSED_KEY) === '1';

  const lsHeader = document.createElement('div');
  lsHeader.className = 'snip-link-header';
  lsHeader.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;padding:6px 10px;';

  const lsChevron = document.createElement('span');
  lsChevron.className = 'wl-section-chevron';
  lsChevron.style.cssText = 'flex-shrink:0;transition:transform 0.15s;';
  lsChevron.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

  const lsLabelText = document.createElement('span');
  lsLabelText.className = 'snip-field-label';
  lsLabelText.style.cssText = 'margin:0;flex:1;';
  lsLabelText.textContent = 'Linked snippets';

  const lsCount = document.createElement('span');
  lsCount.style.cssText = 'font-family:var(--font-mono);font-size:10px;color:var(--text-faint);';

  lsHeader.append(lsChevron, lsLabelText, lsCount);

  const lsBody = document.createElement('div');
  lsBody.className = 'snip-link-body';

  const lsSearchIn = document.createElement('input');
  lsSearchIn.type = 'text';
  lsSearchIn.className = 'snip-tags-input';
  lsSearchIn.placeholder = 'Search snippets to link…';
  lsSearchIn.style.cssText = 'padding:6px 10px;border-bottom:1px solid var(--border-light);width:100%;box-sizing:border-box;';

  const lsResults = document.createElement('div');
  lsResults.className = 'snip-link-results';

  const lsChips = document.createElement('div');
  lsChips.className = 'snip-link-chips';

  function applyLsCollapse() {
    lsBody.style.display = lsCollapsed ? 'none' : '';
    lsChevron.style.transform = lsCollapsed ? 'rotate(-90deg)' : '';
    lsCount.textContent = lsCollapsed && linkedSnipIds.length ? `${linkedSnipIds.length}` : '';
  }

  lsHeader.addEventListener('click', () => {
    lsCollapsed = !lsCollapsed;
    localStorage.setItem(LS_COLLAPSED_KEY, lsCollapsed ? '1' : '0');
    applyLsCollapse();
  });

  function renderLsChips() {
    lsChips.innerHTML = '';
    linkedSnipIds.forEach(id => {
      const s = snipItems.find(x => x.id === id);
      if (!s) return;
      const chip = document.createElement('span');
      chip.className = 'snip-link-chip';
      chip.innerHTML = `<span class="snip-source-badge snip-src-${s.source.toLowerCase()}">${s.source}</span>${escHtml(s.title)}<button class="icon-btn del" style="font-size:10px;padding:0 3px" title="Remove">&#x2715;</button>`;
      chip.querySelector('button').addEventListener('click', () => {
        linkedSnipIds = linkedSnipIds.filter(x => x !== id);
        renderLsChips();
        applyLsCollapse();
      });
      lsChips.appendChild(chip);
    });
    applyLsCollapse();
  }

  function renderLsResults(q) {
    lsResults.innerHTML = '';
    const results = q
      ? snipItems.filter(s => s.title.toLowerCase().includes(q.toLowerCase()) || (s.tags||[]).some(t => t.toLowerCase().includes(q.toLowerCase()))).slice(0, 6)
      : [];
    results.forEach(s => {
      if (linkedSnipIds.includes(s.id)) return;
      const row = document.createElement('div');
      row.className = 'snip-link-result-row';
      row.innerHTML = `<span class="snip-source-badge snip-src-${s.source.toLowerCase()}">${s.source}</span><span style="font-size:12px">${escHtml(s.title)}</span>`;
      row.addEventListener('mousedown', e => {
        e.preventDefault();
        if (!linkedSnipIds.includes(s.id)) linkedSnipIds.push(s.id);
        renderLsChips();
        lsSearchIn.value = '';
        lsResults.innerHTML = '';
      });
      lsResults.appendChild(row);
    });
  }

  lsSearchIn.addEventListener('input', () => renderLsResults(lsSearchIn.value));
  lsBody.append(lsSearchIn, lsResults, lsChips);
  renderLsChips();
  applyLsCollapse();
  linkedSnipsSection.append(lsHeader, lsBody);

  modal.append(dragBar, header, ticketRow, linksSection, topBar, formatBar, sectionsEl, linkedSnipsSection, footer, downloadStamp);
  document.body.appendChild(modal); modal._openModal?.();
  titleIn.focus();

  // Setup drag — returns cleanup fn used by closeModal
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }

  
  closeBtn.addEventListener('click', closeModal);

  // Setup links (needs closeModal via indirection to avoid forward-ref issues)
  setupWLModalLinks(linkedListEl, linkTypeSelect, linkItemSelect, addLinkBtn, currentLinks, () => closeModal);

  // Save
  function saveModal() {
    const title = titleIn.value.trim();
    if (!title) { showToast('Enter a title.', true); return; }
    const now = new Date().toISOString();
    const newType = typeSelect.value || 'Uncategorised';
    const newLinks = currentLinks.slice();
    if (editId) {
      const existing = wlItems.find(i => i.id === editId);
      if (existing) {
        const oldLinks = existing.linkedItems || [];
        const prevStatus = existing.status;
        existing.title = title; existing.type = newType;
        existing.status = statusSelect.value; existing.ticket = ticketIn.value.trim();
        existing.sections = collectWLSections(sectionsEl); existing.linkedItems = newLinks; existing.linkedSnippets = linkedSnipIds; existing.updatedAt = now;
        if (existing.status === 'Complete' && prevStatus !== 'Complete') existing.completedAt = now;
        else if (existing.status !== 'Complete') delete existing.completedAt;
        if (existing.status === 'Archived') { existing.archived = true; existing.archivedAt = existing.archivedAt || now; }
        else { existing.archived = false; delete existing.archivedAt; }
        syncWlLinks(editId, title, newType, oldLinks, newLinks);
      }
    } else {
      const newId = crypto.randomUUID();
      const newStatus = statusSelect.value;
      wlItems.unshift({ id: newId, title, type: newType, category: '', status: newStatus, ticket: ticketIn.value.trim(), sections: collectWLSections(sectionsEl), linkedItems: newLinks, linkedSnippets: linkedSnipIds, createdAt: now, updatedAt: now, ...(newStatus === 'Complete' ? { completedAt: now } : {}) });
      syncWlLinks(newId, title, newType, [], newLinks);
    }
    saveWL(wlItems); renderWL(); populateWlDropdowns();
    showToast('Work log item saved.');
    closeModal();
  }

  // Shared action helpers
  function doAddSection() { sectionsEl.appendChild(buildWLSectionEditor({ title: '', content: '' })); }
  // Wire up all event listeners
  [saveBtn, saveBtnTop].forEach(b => b.addEventListener('click', saveModal));
  [addSectionBtn, addSectionBtnTop].forEach(b => b.addEventListener('click', doAddSection));
  titleIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveModal(); } });

  // On new items only: repopulate sections when type changes
  if (!editId) {
    typeSelect.addEventListener('change', () => {
      function repopulate() {
        sectionsEl.innerHTML = '';
        (WL_TEMPLATES[typeSelect.value] || WL_DEFAULT_SECTIONS).forEach(s => sectionsEl.appendChild(buildWLSectionEditor(s)));
      }
      const hasContent = Array.from(sectionsEl.querySelectorAll('.wl-editor')).some(e => e.textContent.trim());
      if (hasContent) showConfirm('Replace sections with the template for this type? Any typed content will be lost.', repopulate);
      else repopulate();
    });
  }
  modal.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveModal(); } });
  popoutBtn.addEventListener('click', e => {
    e.stopPropagation();
    window.open(location.href.split('?')[0] + '?popout=' + encodeURIComponent(editId || 'new'), '_blank', 'width=880,height=760,resizable=yes');
    closeModal();
  });
}

function buildWLItemMd(item) {
  const lines = [];
  lines.push(`# ${item.title}`);
  lines.push('');
  lines.push(`**Type:** ${item.type}  `);
  if (item.category) lines.push(`**Category:** ${item.category}  `);
  lines.push(`**Status:** ${item.status}  `);
  lines.push(`**Last updated:** ${wlFmtTs(item.updatedAt)}`);
  if (item.ticket) { lines.push(''); lines.push(`**Ticket:** ${item.ticket}`); }
  item.sections.forEach(s => {
    lines.push(''); lines.push(`## ${s.title}`); lines.push('');
    const nodes = s.nodes || [];
    // Migrate old format
    if (nodes.length === 0 && s.content) lines.push(s.content);
    else {
      let imgCount = 0;
      nodes.forEach(node => {
        if (node.type === 'image') {
          imgCount++;
          lines.push(`![screenshot-${imgCount}](${node.value})`);
        } else if (node.type === 'markdown' || node.type === 'text') {
          lines.push(node.value || '');
        } else if (node.type === 'html') {
          // Legacy: convert HTML to markdown
          const md = (node.value || '')
            .replace(/<h1>([\s\S]*?)<\/h1>/gi, '# $1')
            .replace(/<h2>([\s\S]*?)<\/h2>/gi, '## $1')
            .replace(/<h3>([\s\S]*?)<\/h3>/gi, '### $1')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
            .replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**')
            .replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*')
            .replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*')
            .replace(/<u>([\s\S]*?)<\/u>/gi, '$1')
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
          lines.push(md);
        }
      });
    }
  });
  return lines.join('\n');
}

async function downloadWLItemMd(item) {
  const md = buildWLItemMd(item);
  const dateStr = localDateStr();
  const typePart = item.type.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const namePart = item.title.slice(0, 50).replace(/[^a-z0-9]/gi, '-').toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');
  const filename = `[${typePart}][${dateStr}][${namePart}].md`;

  // Track download timestamp
  if (item.id) {
    const stored = wlItems.find(i => i.id === item.id);
    if (stored) { stored.downloadedAt = new Date().toISOString(); saveWL(wlItems); }
  }

  function offerArchive(locationLabel) {
    if (item.id && wlItems.find(i => i.id === item.id && i.status !== 'Archived')) {
      setTimeout(() => {
        showConfirm(`"${item.title}" saved to ${locationLabel}. Archive it now so it no longer shows in the list?`, () => {
          const i = wlItems.find(i => i.id === item.id);
          if (i) { i.status = 'Archived'; i.archived = true; i.archivedAt = new Date().toISOString(); saveWL(wlItems); renderWL(); showToast('Archived.'); }
        });
      }, 400);
    }
  }

  // Try configured folder for this type first
  const handle = await _loadDocHandle(item.type);
  if (handle) {
    let perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') perm = await handle.requestPermission({ mode: 'readwrite' });
    if (perm === 'granted') {
      try {
        const fileHandle = await handle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(md);
        await writable.close();
        showToast(`Saved to ${handle.name}: ${filename}`);
        offerArchive(handle.name);
        return;
      } catch (e) {
        showToast('Folder save failed — downloading instead.', true);
      }
    } else {
      showToast(`${item.type} folder permission denied — downloading instead.`, true);
    }
  }

  // Fallback: browser download
  const blob = new Blob([md], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  offerArchive('downloads');
}

// ── Doc folder settings ──────────────────────────────────────────

async function _saveDocHandle(type, handle) {
  const idb = await _openHandleDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction('handles', 'readwrite');
    tx.objectStore('handles').put(handle, 'docDir_' + type);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
async function _loadDocHandle(type) {
  try {
    const idb = await _openHandleDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('handles', 'readonly');
      const req = tx.objectStore('handles').get('docDir_' + type);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch { return null; }
}
async function _clearDocHandle(type) {
  try {
    const idb = await _openHandleDB();
    return new Promise(resolve => {
      const tx = idb.transaction('handles', 'readwrite');
      tx.objectStore('handles').delete('docDir_' + type);
      tx.oncomplete = resolve;
    });
  } catch {}
}

async function openDocFolderSettings() {
  document.getElementById('docFolderPanel')?.remove();
  const WL_TYPES = ['Halo','Sherlock','Ad-hoc','CMT','Nova','Upgrade','Meetings','Training','SOP','Report','Research','Other'];

  const handles = {};
  for (const type of WL_TYPES) handles[type] = await _loadDocHandle(type);

  const panel = document.createElement('div');
  panel.id = 'docFolderPanel';
  panel.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:${++_wlModalZ};background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:0;min-width:440px;box-shadow:0 8px 32px rgba(0,0,0,0.22)`;
  panel.addEventListener('mousedown', () => { panel.style.zIndex = ++_wlModalZ; });

  const hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:13px 16px 11px;border-bottom:1px solid var(--border-light);cursor:move;user-select:none';
  const hdrTitle = document.createElement('span');
  hdrTitle.style.cssText = 'font-family:var(--font-mono);font-size:12px;font-weight:500';
  hdrTitle.textContent = '⠿ Documentation download folders';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn';
  closeBtn.innerHTML = '&#x2715;';
  closeBtn.style.cssText = 'font-size:16px;opacity:0.6;cursor:pointer';
  closeBtn.addEventListener('click', () => closePanel());
  hdr.append(hdrTitle, closeBtn);

  const body = document.createElement('div');
  body.style.cssText = 'padding:6px 0 4px';

  WL_TYPES.forEach(type => {
    const handle = handles[type];
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 16px';

    const label = document.createElement('span');
    label.style.cssText = 'font-family:var(--font-mono);font-size:11px;min-width:72px;flex-shrink:0';
    label.textContent = type;

    const folderName = document.createElement('span');
    folderName.style.cssText = 'font-size:11px;color:var(--text-faint);flex:1;font-family:var(--font-mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    folderName.textContent = handle ? handle.name : '—';

    const setBtn = document.createElement('button');
    setBtn.className = 'tool-btn';
    setBtn.style.cssText = 'font-size:10px;padding:2px 8px;flex-shrink:0';
    setBtn.textContent = handle ? 'Change' : 'Set';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'tool-btn';
    clearBtn.style.cssText = 'font-size:10px;padding:2px 8px;flex-shrink:0';
    clearBtn.textContent = 'Clear';
    clearBtn.style.display = handle ? '' : 'none';

    setBtn.addEventListener('click', async () => {
      if (!('showDirectoryPicker' in window)) { showToast('Requires Chrome 86+.', true); return; }
      try {
        const h = await window.showDirectoryPicker({ mode: 'readwrite' });
        await _saveDocHandle(type, h);
        folderName.textContent = h.name;
        setBtn.textContent = 'Change';
        clearBtn.style.display = '';
        showToast(`${type} folder set: ${h.name}`);
      } catch (e) {
        if (e.name !== 'AbortError') showToast('Could not set folder: ' + e.message, true);
      }
    });

    clearBtn.addEventListener('click', async () => {
      await _clearDocHandle(type);
      folderName.textContent = '—';
      setBtn.textContent = 'Set';
      clearBtn.style.display = 'none';
    });

    row.append(label, folderName, setBtn, clearBtn);
    body.appendChild(row);
  });

  const note = document.createElement('div');
  note.style.cssText = 'padding:10px 16px 10px;font-size:10px;color:var(--text-faint);font-family:var(--font-mono);border-top:1px solid var(--border-light);margin-top:6px;line-height:1.5';
  note.textContent = 'When a folder is set, ↓ .md writes directly to that folder. Falls back to browser download if no folder is configured or permission is denied.';
  body.appendChild(note);

  panel.append(hdr, body);
  document.body.appendChild(panel);

  const dragCleanup = setupWLModalDrag(panel, hdr);
  const closePanel = () => { dragCleanup(); panel.remove(); document.removeEventListener('keydown', escHandler); };
  const escHandler = e => { if (e.key === 'Escape') closePanel(); };
  document.addEventListener('keydown', escHandler);
}

document.getElementById('docFolderSettingsBtn').addEventListener('click', () => {
  document.getElementById('wrenchMenu').classList.remove('open');
  openDocFolderSettings();
});

// ── Links Dashboard ───────────────────────────────────────────────
const LINKS_KEY = 'work_todo_links_v1';
const LINKS_LAYOUT_KEY = 'work_todo_links_layout_v1';
function loadLinks() { try { return JSON.parse(localStorage.getItem(LINKS_KEY)) || []; } catch { return []; } }
function saveLinks(arr) {
  try { localStorage.setItem(LINKS_KEY, JSON.stringify(arr)); }
  catch (e) {
    const msg = e.name === 'QuotaExceededError'
      ? 'Storage full — links not saved. Export a backup to free space.'
      : 'Failed to save links: ' + e.message;
    showToast(msg, true);
  }
}
function loadLinksLayout() { try { return JSON.parse(localStorage.getItem(LINKS_LAYOUT_KEY)) || {}; } catch { return {}; } }
function saveLinksLayout(obj) {
  try { localStorage.setItem(LINKS_LAYOUT_KEY, JSON.stringify(obj)); }
  catch (e) {
    const msg = e.name === 'QuotaExceededError'
      ? 'Storage full — column layout not saved.'
      : 'Failed to save column layout: ' + e.message;
    showToast(msg, true);
  }
}
let linkItems = loadLinks();
let linkColWidths = loadLinksLayout();

function faviconUrl(url) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; }
  catch { return ''; }
}

function updateLinksGroupDatalist() {
  const dl = document.getElementById('linksGroupDatalist');
  if (!dl) return;
  const groups = [...new Set(linkItems.map(l => l.group).filter(Boolean))];
  dl.innerHTML = groups.map(g => `<option value="${escHtml(g)}">`).join('');
}

function openLinkEditPopover(link, cardEl) {
  document.querySelector('.link-edit-popover')?.remove();
  const popover = document.createElement('div');
  popover.className = 'link-edit-popover';

  const nameIn = document.createElement('input');
  nameIn.type = 'text'; nameIn.className = 'links-input';
  nameIn.value = link.name; nameIn.placeholder = 'Name…';

  const urlIn = document.createElement('input');
  urlIn.type = 'url'; urlIn.className = 'links-input';
  urlIn.value = link.url; urlIn.placeholder = 'https://…';

  const groupIn = document.createElement('input');
  groupIn.type = 'text'; groupIn.className = 'links-input';
  groupIn.value = link.group || ''; groupIn.placeholder = 'Group…';
  groupIn.setAttribute('list', 'linksGroupDatalist');

  const iconIn = document.createElement('input');
  iconIn.type = 'url'; iconIn.className = 'links-input';
  iconIn.value = link.icon || ''; iconIn.placeholder = 'Custom icon URL (optional)…';

  const btns = document.createElement('div');
  btns.className = 'link-edit-popover-btns';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'tool-btn primary'; saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', () => {
    const newName = nameIn.value.trim(); const newUrl = urlIn.value.trim();
    if (!newName || !newUrl) { showToast('Name and URL required.', true); return; }
    link.name = newName;
    link.url = /^https?:\/\//i.test(newUrl) ? newUrl : 'https://' + newUrl;
    link.group = groupIn.value.trim() || 'General';
    const iconVal = iconIn.value.trim();
    if (iconVal) link.icon = iconVal; else delete link.icon;
    saveLinks(linkItems); popover.remove(); renderLinks();
  });
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'tool-btn'; cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => popover.remove());
  btns.append(saveBtn, cancelBtn);
  popover.append(nameIn, urlIn, groupIn, iconIn, btns);

  const rect = cardEl.getBoundingClientRect();
  popover.style.left = Math.min(rect.left, window.innerWidth - 310) + 'px';
  popover.style.top  = Math.min(rect.bottom + 8, window.innerHeight - 200) + 'px';
  document.body.appendChild(popover);
  nameIn.focus(); nameIn.select();
  setTimeout(() => {
    document.addEventListener('click', function closer(e) {
      if (!popover.contains(e.target) && e.target !== cardEl) {
        popover.remove(); document.removeEventListener('click', closer);
      }
    });
  }, 0);
}

let _dragLinkId = null;
let _dragLinkInsertBeforeId = null;

function _linkDropTarget(grid, clientX, clientY) {
  const cards = [...grid.querySelectorAll('.link-card:not(.dragging)')];
  return cards.find(card => {
    const { left, right, bottom } = card.getBoundingClientRect();
    return clientY <= bottom && clientX < left + (right - left) / 2;
  }) || null;
}

function renderLinks() {
  updateLinksGroupDatalist();
  const container = document.getElementById('linksList');
  if (!container) return;
  container.innerHTML = '';
  if (linkItems.length === 0) {
    container.innerHTML = '<div class="links-empty">No links yet — click <strong>+ Add link</strong> above to get started.</div>';
    return;
  }
  const groups = {};
  linkItems.forEach(link => {
    const g = link.group || 'Uncategorised';
    if (!groups[g]) groups[g] = [];
    groups[g].push(link);
  });

  const wrap = document.createElement('div');
  wrap.className = 'links-columns-wrap';

  Object.entries(groups).forEach(([groupName, links]) => {
    const defaultW = 148 * 2 + 10 + 20; // 2 cards + gap + col padding
    const colWidth = linkColWidths[groupName] || defaultW;

    const col = document.createElement('div');
    col.className = 'links-column';
    col.style.width = colWidth + 'px';

    const inner = document.createElement('div');
    inner.className = 'links-col-inner';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'links-group-title';
    const isUncategorised = links.every(l => !l.group);

    const titleTextSpan = document.createElement('span');
    titleTextSpan.className = 'links-group-name-text';
    titleTextSpan.textContent = groupName;

    const countSpan = document.createElement('span');
    countSpan.className = 'links-group-count';
    countSpan.textContent = links.length;

    const titleActions = document.createElement('span');
    titleActions.className = 'links-group-actions';

    const renameGroupBtn = document.createElement('button');
    renameGroupBtn.className = 'links-group-action-btn';
    renameGroupBtn.title = 'Rename group';
    renameGroupBtn.innerHTML = '&#9998;';
    renameGroupBtn.addEventListener('click', e => {
      e.stopPropagation();
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'links-group-rename-input';
      input.value = isUncategorised ? '' : groupName;
      input.placeholder = 'Group name…';
      titleTextSpan.replaceWith(input);
      input.focus(); input.select();
      function save() {
        const newName = input.value.trim();
        if (newName) {
          links.forEach(l => { const item = linkItems.find(x => x.id === l.id); if (item) item.group = newName; });
          saveLinks(linkItems); renderLinks();
        } else {
          input.replaceWith(titleTextSpan);
        }
      }
      input.addEventListener('blur', save);
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); save(); }
        if (e.key === 'Escape') { e.stopPropagation(); input.replaceWith(titleTextSpan); }
      });
    });
    titleActions.appendChild(renameGroupBtn);

    if (!isUncategorised) {
      const deleteGroupBtn = document.createElement('button');
      deleteGroupBtn.className = 'links-group-action-btn del';
      deleteGroupBtn.title = 'Delete group — items move to Uncategorised';
      deleteGroupBtn.innerHTML = '&#x2715;';
      deleteGroupBtn.addEventListener('click', e => {
        e.stopPropagation();
        showConfirm(`Delete group "${groupName}"? All ${links.length} link(s) will move to Uncategorised.`, () => {
          links.forEach(l => { const item = linkItems.find(x => x.id === l.id); if (item) item.group = ''; });
          saveLinks(linkItems); renderLinks();
        });
      });
      titleActions.appendChild(deleteGroupBtn);
    }

    titleDiv.append(titleTextSpan, countSpan, titleActions);
    inner.appendChild(titleDiv);

    const grid = document.createElement('div');
    grid.className = 'links-grid';
    grid.addEventListener('dragover', e => {
      e.preventDefault(); e.dataTransfer.dropEffect = 'move';
      grid.classList.add('drag-over');
      const target = _linkDropTarget(grid, e.clientX, e.clientY);
      _dragLinkInsertBeforeId = target ? target.dataset.linkId : null;
      grid.querySelectorAll('.link-card').forEach(c => c.classList.toggle('drag-insert-before', c.dataset.linkId === _dragLinkInsertBeforeId && !!_dragLinkInsertBeforeId));
    });
    grid.addEventListener('dragleave', e => {
      if (!grid.contains(e.relatedTarget)) {
        grid.classList.remove('drag-over');
        grid.querySelectorAll('.link-card').forEach(c => c.classList.remove('drag-insert-before'));
      }
    });
    grid.addEventListener('drop', e => {
      e.preventDefault();
      grid.classList.remove('drag-over');
      grid.querySelectorAll('.link-card').forEach(c => c.classList.remove('drag-insert-before'));
      if (!_dragLinkId) return;
      const draggedIdx = linkItems.findIndex(x => x.id === _dragLinkId);
      if (draggedIdx === -1) { _dragLinkId = null; return; }
      const dragged = linkItems.splice(draggedIdx, 1)[0];
      dragged.group = groupName;
      if (_dragLinkInsertBeforeId) {
        const insertIdx = linkItems.findIndex(x => x.id === _dragLinkInsertBeforeId);
        linkItems.splice(insertIdx !== -1 ? insertIdx : linkItems.length, 0, dragged);
      } else {
        linkItems.push(dragged);
      }
      saveLinks(linkItems); renderLinks();
      _dragLinkId = null; _dragLinkInsertBeforeId = null;
    });

    links.forEach(link => {
      const card = document.createElement('a');
      card.className = 'link-card';
      card.href = link.url; card.target = '_blank'; card.rel = 'noopener noreferrer';
      card.draggable = true;
      card.dataset.linkId = link.id;
      card.addEventListener('dragstart', e => { _dragLinkId = link.id; _dragLinkInsertBeforeId = null; card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));

      const faviconWrap = document.createElement('div');
      faviconWrap.className = 'link-favicon-wrap';
      const favicon = document.createElement('img');
      favicon.className = 'link-favicon';
      const fallback = document.createElement('div');
      fallback.className = 'link-favicon-fallback';
      fallback.textContent = link.name.charAt(0).toUpperCase();
      const showFallback = () => { favicon.style.display = 'none'; fallback.style.display = 'flex'; };
      if (link.icon) {
        favicon.src = link.icon;
        favicon.onerror = showFallback;
      } else {
        try {
          const domain = new URL(link.url).hostname;
          const sources = [
            `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            `https://icons.duckduckgo.com/ip3/${domain}.ico`,
            `https://${domain}/favicon.ico`,
          ];
          let idx = 0;
          let _faviconTimeout;
          const tryNext = () => {
            clearTimeout(_faviconTimeout);
            idx++;
            if (idx < sources.length) {
              favicon.src = sources[idx];
              _faviconTimeout = setTimeout(tryNext, 3000);
            } else {
              showFallback();
            }
          };
          favicon.onerror = tryNext;
          favicon.onload = () => clearTimeout(_faviconTimeout);
          favicon.src = sources[0];
          _faviconTimeout = setTimeout(tryNext, 3000);
        } catch { showFallback(); }
      }
      faviconWrap.append(favicon, fallback);

      const nameDiv = document.createElement('div');
      nameDiv.className = 'link-name'; nameDiv.textContent = link.name;

      let domain = '';
      try { domain = new URL(link.url).hostname.replace(/^www\./, ''); } catch {}
      const domainDiv = document.createElement('div');
      domainDiv.className = 'link-domain'; domainDiv.textContent = domain;

      const editBtn = document.createElement('button');
      editBtn.className = 'link-edit-btn'; editBtn.innerHTML = '&#9998;'; editBtn.title = 'Edit';
      editBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openLinkEditPopover(link, card); });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'link-delete-btn'; deleteBtn.innerHTML = '&#x2715;'; deleteBtn.title = 'Remove';
      deleteBtn.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        linkItems = linkItems.filter(l => l.id !== link.id);
        saveLinks(linkItems); renderLinks();
      });

      card.append(faviconWrap, nameDiv, domainDiv, editBtn, deleteBtn);
      grid.appendChild(card);
    });

    inner.appendChild(grid);
    col.appendChild(inner);

    // Resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'links-col-resize';
    resizeHandle.title = 'Drag to resize column';
    resizeHandle.addEventListener('mousedown', e => {
      e.preventDefault();
      const startX = e.clientX; const startW = col.offsetWidth;
      resizeHandle.classList.add('active');
      function onMove(ev) { col.style.width = Math.max(170, startW + ev.clientX - startX) + 'px'; }
      function cleanup() {
        resizeHandle.classList.remove('active');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        window.removeEventListener('blur', cleanup);
      }
      function onUp() {
        linkColWidths[groupName] = col.offsetWidth;
        saveLinksLayout(linkColWidths);
        cleanup();
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      window.addEventListener('blur', cleanup);
    });
    col.appendChild(resizeHandle);
    wrap.appendChild(col);
  });

  container.appendChild(wrap);

  // Pan-to-scroll: attach once per wrap element
  if (!wrap.dataset.panSetup) {
    wrap.dataset.panSetup = '1';
    let panning = false, startX = 0, scrollLeft = 0;
    wrap.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      if (e.target.closest('.link-card') || e.target.closest('button') || e.target.closest('a') || e.target.closest('.links-col-resize')) return;
      panning = true;
      startX = e.pageX - wrap.getBoundingClientRect().left;
      scrollLeft = wrap.scrollLeft;
      wrap.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mouseup', () => { panning = false; wrap.style.cursor = ''; });
    wrap.addEventListener('mouseleave', () => { panning = false; wrap.style.cursor = ''; });
    wrap.addEventListener('mousemove', e => {
      if (!panning) return;
      const x = e.pageX - wrap.getBoundingClientRect().left;
      wrap.scrollLeft = scrollLeft - (x - startX);
    });
  }
}

document.getElementById('linksAddBtn').addEventListener('click', () => {
  const wrap = document.getElementById('linksAddFormWrap');
  wrap.classList.toggle('open');
  if (wrap.classList.contains('open')) document.getElementById('linksNameIn').focus();
});
document.getElementById('linksCancelBtn').addEventListener('click', () => {
  document.getElementById('linksAddFormWrap').classList.remove('open');
  ['linksNameIn','linksUrlIn','linksGroupIn'].forEach(id => document.getElementById(id).value = '');
});
document.getElementById('linksSaveBtn').addEventListener('click', () => {
  const name  = document.getElementById('linksNameIn').value.trim();
  const url   = document.getElementById('linksUrlIn').value.trim();
  const group = document.getElementById('linksGroupIn').value.trim();
  if (!name || !url) { showToast('Name and URL are required.', true); return; }
  const fullUrl = /^https?:\/\//i.test(url) ? url : 'https://' + url;
  linkItems.push({ id: crypto.randomUUID(), name, url: fullUrl, group });
  saveLinks(linkItems); renderLinks();
  document.getElementById('linksCancelBtn').click();
});
document.getElementById('linksUrlIn').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('linksSaveBtn').click(); });

renderLinks();

// ── Cmd+K global search palette ───────────────────────────────────

function toggleCmdK() {
  const overlay = document.getElementById('cmdkOverlay');
  if (!overlay.classList.contains('hidden')) { closeCmdK(); return; }
  overlay.classList.remove('hidden');
  overlay.removeAttribute('aria-hidden');
  const input = document.getElementById('cmdkInput');
  input.value = '';
  renderCmdKResults('');
  input.focus();
}
function closeCmdK() {
  const overlay = document.getElementById('cmdkOverlay');
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
}

function buildCmdKRow(htmlLabel, actions) {
  const row = document.createElement('div');
  row.className = 'cmdk-row';
  row.tabIndex = -1;
  const labelEl = document.createElement('span');
  labelEl.className = 'cmdk-row-label';
  labelEl.innerHTML = htmlLabel;
  row.appendChild(labelEl);
  const actionsEl = document.createElement('div');
  actionsEl.className = 'cmdk-row-actions';
  actions.forEach(({ label, action }, i) => {
    const btn = document.createElement('button');
    btn.className = 'tool-btn' + (i === 0 ? ' primary' : '');
    btn.textContent = label;
    btn.addEventListener('mousedown', e => { e.preventDefault(); action(); });
    actionsEl.appendChild(btn);
  });
  row.appendChild(actionsEl);
  return row;
}

function renderCmdKResults(query) {
  const q = query.toLowerCase().trim();
  const container = document.getElementById('cmdkResults');
  container.innerHTML = '';

  function addGroup(label, items, renderFn) {
    if (!items.length) return;
    const hdr = document.createElement('div');
    hdr.className = 'cmdk-group-label';
    hdr.textContent = label;
    container.appendChild(hdr);
    items.forEach(renderFn);
  }

  const snips = !q
    ? snipItems.slice(0, 5)
    : snipItems.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.rootTable || '').toLowerCase().includes(q) ||
        (s.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (s.query || '').toLowerCase().includes(q)
      ).slice(0, 5);

  addGroup('Snippets', snips, s => {
    container.appendChild(buildCmdKRow(
      `<span class="snip-source-badge snip-src-${s.source.toLowerCase()}">${s.source}</span> ${escHtml(s.title)}`,
      [
        { label: 'Copy SQL', action: () => { navigator.clipboard.writeText(s.query || '').then(() => showToast('Copied.')); closeCmdK(); } },
        { label: 'Open',     action: () => { switchTab('References'); switchHubTab('snippets'); openSnipViewModal(s.id); closeCmdK(); } }
      ]
    ));
  });

  const wlMatches = !q
    ? wlItems.filter(i => i.status !== 'Archived').slice(0, 5)
    : wlItems.filter(i =>
        i.status !== 'Archived' && (
          i.title.toLowerCase().includes(q) ||
          (i.ticket || '').toLowerCase().includes(q) ||
          (i.type || '').toLowerCase().includes(q)
        )
      ).slice(0, 5);

  addGroup('Documentation', wlMatches, item => {
    container.appendChild(buildCmdKRow(
      escHtml(item.title),
      [{ label: 'Open', action: () => { switchTab('Worklog'); openWLViewModal(item.id); closeCmdK(); } }]
    ));
  });

  const linkMatches = !q
    ? linkItems.slice(0, 5)
    : linkItems.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        (l.group || '').toLowerCase().includes(q)
      ).slice(0, 5);

  addGroup('Links', linkMatches, l => {
    container.appendChild(buildCmdKRow(
      escHtml(l.name),
      [{ label: 'Open', action: () => { window.open(l.url, '_blank', 'noopener'); closeCmdK(); } }]
    ));
  });

  const guideMatches = !q
    ? guideItems.slice(0, 5)
    : guideItems.filter(g =>
        g.title.toLowerCase().includes(q) ||
        (g.category || '').toLowerCase().includes(q) ||
        (g.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (g.sections || []).some(s =>
          (s.title || '').toLowerCase().includes(q) ||
          (s.nodes || []).some(n => (n.value || n.content || '').toLowerCase().includes(q))
        )
      ).slice(0, 5);

  addGroup('Guides', guideMatches, g => {
    const catHtml = g.category ? `<span class="guide-cat-badge">${escHtml(g.category)}</span> ` : '';
    container.appendChild(buildCmdKRow(
      `${catHtml}${escHtml(g.title)}`,
      [{ label: 'Open', action: () => { switchTab('References'); switchHubTab('guides'); openGuideViewModal(g.id); closeCmdK(); } }]
    ));
  });

  const contactMatches = !q
    ? contactItems.slice(0, 5)
    : contactItems.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.role || '').toLowerCase().includes(q) ||
        (c.team || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      ).slice(0, 5);

  addGroup('Contacts', contactMatches, c => {
    const subtitle = [c.role, c.team].filter(Boolean).join(' · ');
    const actions = [
      { label: 'Open References', action: () => { switchTab('References'); switchHubTab('contacts'); closeCmdK(); } }
    ];
    if (c.email) actions.push({ label: 'Email', action: () => { window.location.href = `mailto:${c.email}`; closeCmdK(); } });
    container.appendChild(buildCmdKRow(
      `${escHtml(c.name)}${subtitle ? `<span style="color:var(--text-faint);font-size:11px;margin-left:6px">${escHtml(subtitle)}</span>` : ''}`,
      actions
    ));
  });

  const dbMatches = !q
    ? dbAccessItems.slice(0, 5)
    : dbAccessItems.filter(d =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.type || '').toLowerCase().includes(q) ||
        getDbOrgs(d).join(' ').toLowerCase().includes(q) ||
        (d.jumpServer || '').toLowerCase().includes(q) ||
        (d.dbServer   || '').toLowerCase().includes(q)
      ).slice(0, 5);
  addGroup('Databases', dbMatches, d => {
    const typeBadge = d.type ? `<span class="db-badge" style="background:${(DB_TYPE_COLOURS[d.type]||DB_TYPE_COLOURS.Other).bg};color:${(DB_TYPE_COLOURS[d.type]||DB_TYPE_COLOURS.Other).text}">${escHtml(d.type)}</span> ` : '';
    const orgBadge  = getDbOrgs(d).map(o => { const c = DB_ORG_COLOURS[o]||DB_ORG_COLOURS.Other; return `<span class="db-badge" style="background:${c.bg};color:${c.text}">${escHtml(o)}</span>`; }).join(' ');
    container.appendChild(buildCmdKRow(
      `${typeBadge}${orgBadge}${escHtml(d.name)}`,
      [{ label: 'Open', action: () => { switchTab('References'); switchHubTab('databases'); openDatabaseViewModal(d.id); closeCmdK(); } }]
    ));
  });

  const clinicalMatches = !q
    ? []
    : clinicalEntries.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.tags || []).some(t => t.toLowerCase().includes(q))
      ).slice(0, 5);
  addGroup('Clinical Areas', clinicalMatches, e => {
    const area = clinicalAreas.find(a => a.id === e.areaId);
    const areaLabel = area ? `<span style="font-family:var(--font-mono);font-size:10px;color:var(--accent);margin-right:6px;">${escHtml(area.name)}</span>` : '';
    const tagsHtml = (e.tags || []).slice(0, 3).map(t => `<span class="clinical-tag-badge">${escHtml(t)}</span>`).join(' ');
    container.appendChild(buildCmdKRow(
      `${areaLabel}${escHtml(e.title)}${tagsHtml ? ' ' + tagsHtml : ''}`,
      [{ label: 'Open', action: () => {
        switchTab('References');
        selectedClinicalAreaId = e.areaId;
        localStorage.setItem('rcc_clinical_area', e.areaId);
        switchHubTab('clinical');
        openClinicalEntryViewModal(e.id);
        closeCmdK();
      }}]
    ));
  });

  const cogitoMatches = !q
    ? []
    : cogitoEntries.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.tags || []).some(t => t.toLowerCase().includes(q))
      ).slice(0, 5);
  addGroup('Cogito Tools', cogitoMatches, e => {
    const area = cogitoAreas.find(a => a.id === e.areaId);
    const areaLabel = area ? `<span style="font-family:var(--font-mono);font-size:10px;color:var(--accent);margin-right:6px;">${escHtml(area.name)}</span>` : '';
    const tagsHtml = (e.tags || []).slice(0, 3).map(t => `<span class="clinical-tag-badge">${escHtml(t)}</span>`).join(' ');
    container.appendChild(buildCmdKRow(
      `${areaLabel}${escHtml(e.title)}${tagsHtml ? ' ' + tagsHtml : ''}`,
      [{ label: 'Open', action: () => {
        switchTab('References');
        selectedCogitoAreaId = e.areaId;
        localStorage.setItem('rcc_cogito_area', e.areaId);
        switchHubTab('cogito');
        openCogitoEntryViewModal(e.id);
        closeCmdK();
      }}]
    ));
  });

  const reqprocMatches = !q
    ? []
    : reqprocEntries.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.tags || []).some(t => t.toLowerCase().includes(q))
      ).slice(0, 5);
  addGroup('Requests & Processes', reqprocMatches, e => {
    const area = reqprocAreas.find(a => a.id === e.areaId);
    const areaLabel = area ? `<span style="font-family:var(--font-mono);font-size:10px;color:var(--accent);margin-right:6px;">${escHtml(area.name)}</span>` : '';
    const tagsHtml = (e.tags || []).slice(0, 3).map(t => `<span class="clinical-tag-badge">${escHtml(t)}</span>`).join(' ');
    container.appendChild(buildCmdKRow(
      `${areaLabel}${escHtml(e.title)}${tagsHtml ? ' ' + tagsHtml : ''}`,
      [{ label: 'Open', action: () => {
        switchTab('References');
        selectedReqprocAreaId = e.areaId;
        localStorage.setItem('rcc_reqproc_area', e.areaId);
        switchHubTab('reqproc');
        openReqprocEntryViewModal(e.id);
        closeCmdK();
      }}]
    ));
  });

  const trustanalyticsMatches = !q
    ? []
    : trustanalyticsEntries.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.tags || []).some(t => t.toLowerCase().includes(q))
      ).slice(0, 5);
  addGroup('Trust Analytics', trustanalyticsMatches, e => {
    const area = trustanalyticsAreas.find(a => a.id === e.areaId);
    const areaLabel = area ? `<span style="font-family:var(--font-mono);font-size:10px;color:var(--accent);margin-right:6px;">${escHtml(area.name)}</span>` : '';
    const tagsHtml = (e.tags || []).slice(0, 3).map(t => `<span class="clinical-tag-badge">${escHtml(t)}</span>`).join(' ');
    container.appendChild(buildCmdKRow(
      `${areaLabel}${escHtml(e.title)}${tagsHtml ? ' ' + tagsHtml : ''}`,
      [{ label: 'Open', action: () => {
        switchTab('References');
        selectedTrustanalyticsAreaId = e.areaId;
        localStorage.setItem('rcc_trustanalytics_area', e.areaId);
        switchHubTab('trustanalytics');
        openTrustanalyticsEntryViewModal(e.id);
        closeCmdK();
      }}]
    ));
  });

  if (!container.children.length) {
    container.innerHTML = '<div class="cmdk-empty">No results</div>';
  }

  const rows = Array.from(container.querySelectorAll('.cmdk-row'));
  rows.forEach((row, i) => { row.dataset.idx = i; });
  if (rows.length) rows[0].classList.add('focused');
}

// ── Guides Sidebar / Hub ──────────────────────────────────────────

function renderGuidesSidebar() {
  const list = document.getElementById('guidesAreaList');
  if (!list) return;
  list.innerHTML = '';
  // "All" item
  const allItem = document.createElement('div');
  allItem.className = 'clinical-area-item' + (selectedGuidesAreaId === '__all__' ? ' active' : '');
  allItem.dataset.area = '__all__';
  const allCount = guideItems.length;
  allItem.innerHTML = `<span class="clinical-area-name">All</span><span class="clinical-area-count">${allCount}</span>`;
  allItem.addEventListener('click', () => selectGuidesArea('__all__'));
  list.appendChild(allItem);
  // Named areas
  guidesAreas.forEach(area => {
    const count = guideItems.filter(g => g.areaId === area.id).length;
    const item = document.createElement('div');
    item.className = 'clinical-area-item' + (selectedGuidesAreaId === area.id ? ' active' : '');
    item.dataset.area = area.id;
    const nameSpan = document.createElement('span');
    nameSpan.className = 'clinical-area-name';
    nameSpan.title = area.name;
    nameSpan.textContent = area.name;
    const countSpan = document.createElement('span');
    countSpan.className = 'clinical-area-count';
    countSpan.textContent = count;
    const menuBtn = document.createElement('button');
    menuBtn.className = 'clinical-area-menu-btn icon-btn';
    menuBtn.innerHTML = '&#8943;';
    menuBtn.title = 'Rename / Delete';
    menuBtn.addEventListener('click', e => { e.stopPropagation(); showGuidesAreaMenu(area, menuBtn); });
    item.append(nameSpan, countSpan, menuBtn);
    item.addEventListener('click', e => { if (!e.target.closest('.clinical-area-menu-btn')) selectGuidesArea(area.id); });
    list.appendChild(item);
  });
}

function selectGuidesArea(areaId) {
  selectedGuidesAreaId = areaId;
  localStorage.setItem('rcc_guides_area', areaId);
  guidesTagFilters.clear();
  renderGuidesHub();
}

function renderGuidesHub() {
  renderGuidesSidebar();
  const placeholder = document.getElementById('guidesPlaceholder');
  const content = document.getElementById('guidesContent');
  const addBtn = document.getElementById('guidesAddEntryBtn');
  if (!placeholder || !content) return;
  const show = selectedGuidesAreaId === '__all__' || guidesAreas.some(a => a.id === selectedGuidesAreaId);
  placeholder.style.display = show ? 'none' : '';
  content.style.display = show ? '' : 'none';
  if (addBtn) addBtn.style.display = show ? '' : 'none';
  // Hide the old snipAddBtn-style button when in sidebar mode
  const oldAddBtn = document.getElementById('guidesAddBtn');
  if (oldAddBtn) oldAddBtn.style.display = 'none';
  if (show) { renderGuidesToolbar(); renderGuidesList(); }
}

function renderGuidesToolbar() {
  const tb = document.getElementById('guidesToolbar');
  if (!tb) return;
  const prevSearch = tb.querySelector('#guidesSearch')?.value || '';
  const prevSort   = tb.querySelector('#guidesSort')?.value   || 'updated';
  const prevPin    = tb.querySelector('#guidesPinFilter')?.classList.contains('active') || false;
  tb.innerHTML = '';
  const searchIn = document.createElement('input');
  searchIn.type = 'text'; searchIn.id = 'guidesSearch'; searchIn.className = 'wl-search';
  searchIn.placeholder = 'Search guides\u2026'; searchIn.value = prevSearch;
  const pinBtn = document.createElement('button');
  pinBtn.className = 'snip-fav-filter' + (prevPin ? ' active' : ''); pinBtn.id = 'guidesPinFilter';
  pinBtn.innerHTML = '<span class="snip-fav-star">&#9733;</span> Pinned';
  if (prevPin) pinBtn.classList.add('active');
  const sortSel = document.createElement('select');
  sortSel.id = 'guidesSort'; sortSel.className = 'wl-filter';
  [['updated','Sort: updated \u2193'],['created','Sort: created \u2193'],['title','Sort: title A\u2013Z']].forEach(([v,l]) => {
    const o = document.createElement('option'); o.value = v; o.textContent = l;
    if (v === prevSort) o.selected = true;
    sortSel.appendChild(o);
  });
  const countSp = document.createElement('span');
  countSp.id = 'guidesCount'; countSp.className = 'snip-count';
  tb.append(searchIn, pinBtn, sortSel, countSp);
  searchIn.addEventListener('input', renderGuidesList);
  sortSel.addEventListener('change', renderGuidesList);
  pinBtn.addEventListener('click', () => {
    pinBtn.classList.toggle('active');
    renderGuidesList();
  });
  // Tag filter pills
  const tf = document.getElementById('guidesTagFilter');
  if (tf) {
    const allTags = [...new Set(guideItems.flatMap(g => g.tags || []))].sort();
    if (allTags.length) {
      tf.style.display = '';
      tf.innerHTML = '<span class="clinical-tags-label">Filter:</span>';
      allTags.forEach(tag => {
        const pill = document.createElement('button');
        pill.className = 'clinical-tag-pill' + (guidesTagFilters.has(tag) ? ' active' : '');
        pill.textContent = tag;
        pill.addEventListener('click', () => {
          if (guidesTagFilters.has(tag)) guidesTagFilters.delete(tag); else guidesTagFilters.add(tag);
          renderGuidesHub();
        });
        tf.appendChild(pill);
      });
    } else { tf.style.display = 'none'; }
  }
}

function renderGuidesList() {
  const listEl  = document.getElementById('guidesList');
  const emptyEl = document.getElementById('guidesEmpty');
  const countEl = document.getElementById('guidesCount');
  if (!listEl) return;

  let items = guideItems.slice();
  if (selectedGuidesAreaId !== '__all__') items = items.filter(g => g.areaId === selectedGuidesAreaId);
  if (guidesTagFilters.size) items = items.filter(g => [...guidesTagFilters].every(t => (g.tags||[]).includes(t)));

  const search  = (document.getElementById('guidesSearch')?.value || '').toLowerCase().trim();
  const pinOnly = document.getElementById('guidesPinFilter')?.classList.contains('active') || false;
  const sort    = document.getElementById('guidesSort')?.value || 'updated';

  if (pinOnly)  items = items.filter(g => g.pinned);
  if (search)   items = items.filter(g =>
    (g.title||'').toLowerCase().includes(search) ||
    (g.category||'').toLowerCase().includes(search) ||
    (g.tags||[]).some(t => t.toLowerCase().includes(search)) ||
    (g.sections||[]).some(s =>
      (s.title||'').toLowerCase().includes(search) ||
      (s.nodes||[]).some(n => (n.value||n.content||'').toLowerCase().includes(search))
    )
  );

  function applySort(arr) {
    if (sort === 'title')        arr.sort((a, b) => (a.title||'').localeCompare(b.title||''));
    else if (sort === 'created') arr.sort((a, b) => (b.createdAt||'').localeCompare(a.createdAt||''));
    else                         arr.sort((a, b) => (b.updatedAt||b.createdAt||'').localeCompare(a.updatedAt||a.createdAt||''));
  }
  const pinned   = items.filter(g => g.pinned);
  const unpinned = items.filter(g => !g.pinned);
  applySort(pinned); applySort(unpinned);
  items = [...pinned, ...unpinned];

  if (countEl) countEl.textContent = `${items.length} guide${items.length !== 1 ? 's' : ''}`;
  if (emptyEl) {
    emptyEl.style.display = items.length ? 'none' : '';
    if (!items.length) emptyEl.innerHTML = pinOnly
      ? 'No pinned guides yet. Click the <strong>&#9733;</strong> on any guide card to pin it.'
      : 'No guides yet. Hit <strong>+ New guide</strong> to start documenting how-tos.';
  }
  listEl.innerHTML = '';

  items.forEach(item => {
    const firstContent = (item.sections || [])
      .flatMap(s => s.nodes || [])
      .map(n => (n.value || n.content || '').replace(/[#*`_\[\]]/g, '').trim())
      .find(t => t.length > 0) || '';
    const preview = firstContent.slice(0, 120) + (firstContent.length > 120 ? '\u2026' : '');
    const tagsHtml = (item.tags || []).map(t => `<span class="snip-tag">${escHtml(t)}</span>`).join('');
    const catHtml  = item.category ? `<span class="guide-cat-badge">${escHtml(item.category)}</span>` : '';

    const div = document.createElement('div');
    div.className = 'guide-card';
    div.dataset.id = item.id;
    div.innerHTML = `
      <div class="guide-card-header">
        <span class="guide-title">${escHtml(item.title)}</span>
        ${catHtml}
        <div class="snip-card-actions">
          <button class="icon-btn snip-pin-btn${item.pinned ? ' active' : ''}" title="${item.pinned ? 'Unpin' : 'Pin'}">&#9733;</button>
          <button class="icon-btn guide-edit-btn" title="Edit">&#9998;</button>
          <button class="icon-btn del guide-del-btn" title="Delete">&#x2715;</button>
        </div>
      </div>
      ${tagsHtml ? `<div class="snip-tags" style="margin-top:5px">${tagsHtml}</div>` : ''}
      ${preview ? `<div class="guide-preview">${escHtml(preview)}</div>` : ''}
      <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);margin-top:6px">${wlFmtTs(item.updatedAt)}</div>`;

    div.querySelector('.guide-card-header').addEventListener('click', e => {
      if (e.target.closest('button')) return;
      openGuideViewModal(item.id);
    });
    div.querySelector('.snip-pin-btn').addEventListener('click', e => {
      e.stopPropagation();
      item.pinned = !item.pinned;
      saveGuides(guideItems);
      renderGuidesHub();
    });
    div.querySelector('.guide-edit-btn').addEventListener('click', e => {
      e.stopPropagation();
      createGuideModal(item.id);
    });
    div.querySelector('.guide-del-btn').addEventListener('click', e => {
      e.stopPropagation();
      showConfirm(`Delete guide "${item.title}"?`, () => {
        guideItems = guideItems.filter(g => g.id !== item.id);
        saveGuides(guideItems);
        renderGuidesHub();
        showToast('Guide deleted.');
      }, 'danger');
    });
    listEl.appendChild(div);
  });
}

function showGuidesAreaMenu(area, anchor) {
  document.querySelector('.clinical-area-menu')?.remove();
  const menu = document.createElement('div');
  menu.className = 'clinical-area-menu';
  const rect = anchor.getBoundingClientRect();
  menu.style.cssText = `position:fixed;top:${rect.bottom+2}px;left:${rect.left}px;z-index:200;background:var(--surface,var(--bg));border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 4px 16px rgba(0,0,0,.12);padding:4px 0;min-width:120px`;
  [['Rename', () => showGuidesRenameModal(area)], ['Delete', () => {
    showConfirm(`Delete category "${area.name}"? Guides in it will become uncategorised.`, async () => {
      guideItems = guideItems.map(g => g.areaId === area.id ? {...g, areaId: null} : g);
      await saveGuides(guideItems);
      guidesAreas = guidesAreas.filter(a => a.id !== area.id);
      saveGuidesAreas(guidesAreas);
      if (selectedGuidesAreaId === area.id) selectedGuidesAreaId = '__all__';
      menu.remove();
      renderGuidesHub();
    });
  }]].forEach(([label, fn]) => {
    const btn = document.createElement('button');
    btn.style.cssText = 'display:block;width:100%;text-align:left;padding:6px 12px;background:none;border:none;cursor:pointer;font-size:13px;color:var(--text)';
    btn.textContent = label;
    btn.addEventListener('click', () => { menu.remove(); fn(); });
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  const close = e => { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close, true); } };
  setTimeout(() => document.addEventListener('click', close, true), 0);
}

function showGuidesRenameModal(area) {
  const item = document.querySelector(`#guidesAreaList .clinical-area-item[data-area="${CSS.escape(area.id)}"] .clinical-area-name`);
  if (!item) return;
  const input = document.createElement('input');
  input.className = 'wl-search'; input.value = area.name; input.style.cssText = 'font-size:12px;padding:2px 6px;width:120px';
  const parent = item.parentElement;
  parent.replaceChild(input, item);
  input.focus(); input.select();
  const finish = () => {
    const name = input.value.trim();
    if (name && name !== area.name) { area.name = name; saveGuidesAreas(guidesAreas); }
    renderGuidesSidebar();
  };
  input.addEventListener('blur', finish);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); finish(); } if (e.key === 'Escape') renderGuidesSidebar(); });
}

// ── Snippets Sidebar / Hub ────────────────────────────────────────

function renderSnippetsSidebar() {
  const list = document.getElementById('snippetsAreaList');
  if (!list) return;
  list.innerHTML = '';
  // "All" item
  const allItem = document.createElement('div');
  allItem.className = 'clinical-area-item' + (selectedSnippetsAreaId === '__all__' ? ' active' : '');
  allItem.dataset.area = '__all__';
  allItem.innerHTML = `<span class="clinical-area-name">All</span><span class="clinical-area-count">${snipItems.length}</span>`;
  allItem.addEventListener('click', () => selectSnippetsArea('__all__'));
  list.appendChild(allItem);
  // Named areas
  snippetsAreas.forEach(area => {
    const count = snipItems.filter(s => s.areaId === area.id).length;
    const item = document.createElement('div');
    item.className = 'clinical-area-item' + (selectedSnippetsAreaId === area.id ? ' active' : '');
    item.dataset.area = area.id;
    const nameSpan = document.createElement('span');
    nameSpan.className = 'clinical-area-name';
    nameSpan.title = area.name;
    nameSpan.textContent = area.name;
    const countSpan = document.createElement('span');
    countSpan.className = 'clinical-area-count';
    countSpan.textContent = count;
    const menuBtn = document.createElement('button');
    menuBtn.className = 'clinical-area-menu-btn icon-btn';
    menuBtn.innerHTML = '&#8943;';
    menuBtn.title = 'Rename / Delete';
    menuBtn.addEventListener('click', e => { e.stopPropagation(); showSnippetsAreaMenu(area, menuBtn); });
    item.append(nameSpan, countSpan, menuBtn);
    item.addEventListener('click', e => { if (!e.target.closest('.clinical-area-menu-btn')) selectSnippetsArea(area.id); });
    list.appendChild(item);
  });
}

function selectSnippetsArea(areaId) {
  selectedSnippetsAreaId = areaId;
  localStorage.setItem('rcc_snippets_area', areaId);
  snippetsTagFilters.clear();
  renderSnippetsHub();
}

function renderSnippetsHub() {
  renderSnippetsSidebar();
  const placeholder = document.getElementById('snippetsPlaceholder');
  const content = document.getElementById('snippetsContent');
  const addBtn = document.getElementById('snippetsAddEntryBtn');
  if (!placeholder || !content) return;
  const show = selectedSnippetsAreaId === '__all__' || snippetsAreas.some(a => a.id === selectedSnippetsAreaId);
  placeholder.style.display = show ? 'none' : '';
  content.style.display = show ? '' : 'none';
  if (addBtn) addBtn.style.display = show ? '' : 'none';
  const oldAddBtn = document.getElementById('snipAddBtn');
  if (oldAddBtn) oldAddBtn.style.display = 'none';
  if (show) { renderSnippetsToolbar(); renderSnippets(); }
}

function renderSnippetsToolbar() {
  const tb = document.getElementById('snippetsToolbar');
  if (!tb) return;
  const prevSearch = tb.querySelector('#snipSearch')?.value || '';
  const prevSort   = tb.querySelector('#snipSort')?.value   || 'updated';
  const prevSrc    = tb.querySelector('#snipFilterSource')?.value || '';
  const prevFav    = tb.querySelector('#snipFavFilter')?.classList.contains('active') || false;
  tb.innerHTML = '';
  const searchIn = document.createElement('input');
  searchIn.type = 'text'; searchIn.id = 'snipSearch'; searchIn.className = 'wl-search';
  searchIn.placeholder = 'Search snippets\u2026'; searchIn.value = prevSearch;
  const favBtn = document.createElement('button');
  favBtn.className = 'snip-fav-filter' + (prevFav ? ' active' : ''); favBtn.id = 'snipFavFilter';
  favBtn.innerHTML = '<span class="snip-fav-star">&#9733;</span> Favourites';
  const srcSel = document.createElement('select');
  srcSel.id = 'snipFilterSource'; srcSel.className = 'wl-filter';
  [['','All sources'],['Caboodle','Caboodle'],['Clarity','Clarity'],['Both','Both'],['Other','Other']].forEach(([v,l]) => {
    const o = document.createElement('option'); o.value = v; o.textContent = l;
    if (v === prevSrc) o.selected = true;
    srcSel.appendChild(o);
  });
  const sortSel = document.createElement('select');
  sortSel.id = 'snipSort'; sortSel.className = 'wl-filter';
  [['updated','Sort: updated \u2193'],['created','Sort: created \u2193'],['title','Sort: title A\u2013Z']].forEach(([v,l]) => {
    const o = document.createElement('option'); o.value = v; o.textContent = l;
    if (v === prevSort) o.selected = true;
    sortSel.appendChild(o);
  });
  const countSp = document.createElement('span');
  countSp.id = 'snipCount'; countSp.className = 'snip-count';
  const exportBtn = document.createElement('button');
  exportBtn.className = 'tool-btn'; exportBtn.id = 'snipExportBtn';
  exportBtn.title = 'Export snippets as JSON'; exportBtn.style.marginLeft = 'auto';
  exportBtn.textContent = 'Export JSON';
  tb.append(searchIn, favBtn, srcSel, sortSel, countSp, exportBtn);
  searchIn.addEventListener('input', renderSnippets);
  srcSel.addEventListener('change', renderSnippets);
  sortSel.addEventListener('change', renderSnippets);
  favBtn.addEventListener('click', () => { favBtn.classList.toggle('active'); renderSnippets(); });
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(snipItems, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rcc-snippets-${localDateStr()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Snippets exported.');
  });
}

function showSnippetsAreaMenu(area, anchor) {
  document.querySelector('.clinical-area-menu')?.remove();
  const menu = document.createElement('div');
  menu.className = 'clinical-area-menu';
  const rect = anchor.getBoundingClientRect();
  menu.style.cssText = `position:fixed;top:${rect.bottom+2}px;left:${rect.left}px;z-index:200;background:var(--surface,var(--bg));border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 4px 16px rgba(0,0,0,.12);padding:4px 0;min-width:120px`;
  [['Rename', () => showSnippetsRenameModal(area)], ['Delete', () => {
    showConfirm(`Delete category "${area.name}"? Snippets in it will become uncategorised.`, async () => {
      snipItems = snipItems.map(s => s.areaId === area.id ? {...s, areaId: null} : s);
      await saveSnippets(snipItems);
      snippetsAreas = snippetsAreas.filter(a => a.id !== area.id);
      saveSnippetsAreas(snippetsAreas);
      if (selectedSnippetsAreaId === area.id) selectedSnippetsAreaId = '__all__';
      menu.remove();
      renderSnippetsHub();
    });
  }]].forEach(([label, fn]) => {
    const btn = document.createElement('button');
    btn.style.cssText = 'display:block;width:100%;text-align:left;padding:6px 12px;background:none;border:none;cursor:pointer;font-size:13px;color:var(--text)';
    btn.textContent = label;
    btn.addEventListener('click', () => { menu.remove(); fn(); });
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  const close = e => { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close, true); } };
  setTimeout(() => document.addEventListener('click', close, true), 0);
}

function showSnippetsRenameModal(area) {
  const item = document.querySelector(`#snippetsAreaList .clinical-area-item[data-area="${CSS.escape(area.id)}"] .clinical-area-name`);
  if (!item) return;
  const input = document.createElement('input');
  input.className = 'wl-search'; input.value = area.name; input.style.cssText = 'font-size:12px;padding:2px 6px;width:120px';
  const parent = item.parentElement;
  parent.replaceChild(input, item);
  input.focus(); input.select();
  const finish = () => {
    const name = input.value.trim();
    if (name && name !== area.name) { area.name = name; saveSnippetsAreas(snippetsAreas); }
    renderSnippetsSidebar();
  };
  input.addEventListener('blur', finish);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); finish(); } if (e.key === 'Escape') renderSnippetsSidebar(); });
}

// ── Databases Sidebar / Hub ───────────────────────────────────────

function renderDatabasesSidebar() {
  const list = document.getElementById('databasesAreaList');
  if (!list) return;
  list.innerHTML = '';
  // "All" item
  const allItem = document.createElement('div');
  allItem.className = 'clinical-area-item' + (selectedDatabasesAreaId === '__all__' ? ' active' : '');
  allItem.dataset.area = '__all__';
  allItem.innerHTML = `<span class="clinical-area-name">All</span><span class="clinical-area-count">${dbAccessItems.length}</span>`;
  allItem.addEventListener('click', () => selectDatabasesArea('__all__'));
  list.appendChild(allItem);
  // Named areas
  databasesAreas.forEach(area => {
    const count = dbAccessItems.filter(d => d.areaId === area.id).length;
    const item = document.createElement('div');
    item.className = 'clinical-area-item' + (selectedDatabasesAreaId === area.id ? ' active' : '');
    item.dataset.area = area.id;
    const nameSpan = document.createElement('span');
    nameSpan.className = 'clinical-area-name';
    nameSpan.title = area.name;
    nameSpan.textContent = area.name;
    const countSpan = document.createElement('span');
    countSpan.className = 'clinical-area-count';
    countSpan.textContent = count;
    const menuBtn = document.createElement('button');
    menuBtn.className = 'clinical-area-menu-btn icon-btn';
    menuBtn.innerHTML = '&#8943;';
    menuBtn.title = 'Rename / Delete';
    menuBtn.addEventListener('click', e => { e.stopPropagation(); showDatabasesAreaMenu(area, menuBtn); });
    item.append(nameSpan, countSpan, menuBtn);
    item.addEventListener('click', e => { if (!e.target.closest('.clinical-area-menu-btn')) selectDatabasesArea(area.id); });
    list.appendChild(item);
  });
}

function selectDatabasesArea(areaId) {
  selectedDatabasesAreaId = areaId;
  localStorage.setItem('rcc_databases_area', areaId);
  renderDatabasesHub();
}

function renderDatabasesHub() {
  renderDatabasesSidebar();
  const placeholder = document.getElementById('databasesPlaceholder');
  const content = document.getElementById('databasesContent');
  const addBtn = document.getElementById('databasesAddEntryBtn');
  if (!placeholder || !content) return;
  const show = selectedDatabasesAreaId === '__all__' || databasesAreas.some(a => a.id === selectedDatabasesAreaId);
  placeholder.style.display = show ? 'none' : '';
  content.style.display = show ? '' : 'none';
  if (addBtn) addBtn.style.display = show ? '' : 'none';
  if (show) { renderDatabasesToolbar(); renderDatabases(); }
}

function renderDatabasesToolbar() {
  const tb = document.getElementById('databasesToolbar');
  if (!tb) return;
  const prevSearch = tb.querySelector('#dbSearch')?.value || '';
  const prevType   = tb.querySelector('#dbFilterType')?.value || '';
  tb.innerHTML = '';
  const searchIn = document.createElement('input');
  searchIn.type = 'text'; searchIn.id = 'dbSearch'; searchIn.className = 'wl-search';
  searchIn.placeholder = 'Search databases\u2026'; searchIn.value = prevSearch;
  const typeEl = document.createElement('select');
  typeEl.id = 'dbFilterType'; typeEl.className = 'wl-filter';
  [['','All types'],['Caboodle','Caboodle'],['Clarity','Clarity'],['SSMS','SSMS'],['Other','Other']].forEach(([v,l]) => {
    const o = document.createElement('option'); o.value = v; o.textContent = l;
    if (v === prevType) o.selected = true;
    typeEl.appendChild(o);
  });
  const orgPills = document.createElement('div');
  orgPills.className = 'db-org-filter-pills'; orgPills.id = 'dbFilterOrgPills';
  ['GSTT','KCH','LGT','Other'].forEach(org => {
    const pill = document.createElement('button');
    pill.className = 'db-org-pill'; pill.dataset.org = org; pill.textContent = org;
    orgPills.appendChild(pill);
  });
  const countSp = document.createElement('span');
  countSp.id = 'dbCount'; countSp.className = 'snip-count';
  tb.append(searchIn, typeEl, orgPills, countSp);
  searchIn.addEventListener('input', renderDatabases);
  typeEl.addEventListener('change', renderDatabases);
  orgPills.querySelectorAll('.db-org-pill').forEach(btn => {
    btn.addEventListener('click', () => { btn.classList.toggle('active'); renderDatabases(); });
  });
}

function showDatabasesAreaMenu(area, anchor) {
  document.querySelector('.clinical-area-menu')?.remove();
  const menu = document.createElement('div');
  menu.className = 'clinical-area-menu';
  const rect = anchor.getBoundingClientRect();
  menu.style.cssText = `position:fixed;top:${rect.bottom+2}px;left:${rect.left}px;z-index:200;background:var(--surface,var(--bg));border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 4px 16px rgba(0,0,0,.12);padding:4px 0;min-width:120px`;
  [['Rename', () => showDatabasesRenameModal(area)], ['Delete', () => {
    showConfirm(`Delete category "${area.name}"? Entries in it will become uncategorised.`, () => {
      dbAccessItems = dbAccessItems.map(d => d.areaId === area.id ? {...d, areaId: null} : d);
      saveDbAccess(dbAccessItems);
      databasesAreas = databasesAreas.filter(a => a.id !== area.id);
      saveDatabasesAreas(databasesAreas);
      if (selectedDatabasesAreaId === area.id) selectedDatabasesAreaId = '__all__';
      menu.remove();
      renderDatabasesHub();
    });
  }]].forEach(([label, fn]) => {
    const btn = document.createElement('button');
    btn.style.cssText = 'display:block;width:100%;text-align:left;padding:6px 12px;background:none;border:none;cursor:pointer;font-size:13px;color:var(--text)';
    btn.textContent = label;
    btn.addEventListener('click', () => { menu.remove(); fn(); });
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  const close = e => { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close, true); } };
  setTimeout(() => document.addEventListener('click', close, true), 0);
}

function showDatabasesRenameModal(area) {
  const item = document.querySelector(`#databasesAreaList .clinical-area-item[data-area="${CSS.escape(area.id)}"] .clinical-area-name`);
  if (!item) return;
  const input = document.createElement('input');
  input.className = 'wl-search'; input.value = area.name; input.style.cssText = 'font-size:12px;padding:2px 6px;width:120px';
  const parent = item.parentElement;
  parent.replaceChild(input, item);
  input.focus(); input.select();
  const finish = () => {
    const name = input.value.trim();
    if (name && name !== area.name) { area.name = name; saveDatabasesAreas(databasesAreas); }
    renderDatabasesSidebar();
  };
  input.addEventListener('blur', finish);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); finish(); } if (e.key === 'Escape') renderDatabasesSidebar(); });
}

// ── Guides ────────────────────────────────────────────────────────
const GUIDES_CAT_KEY = 'rcc_guide_cats';
function loadGuideCategories() {
  try { return JSON.parse(localStorage.getItem(GUIDES_CAT_KEY)) || []; } catch { return []; }
}
function saveGuideCategory(val) {
  if (!val) return;
  const list = loadGuideCategories().filter(c => c !== val);
  list.unshift(val);
  try { localStorage.setItem(GUIDES_CAT_KEY, JSON.stringify(list.slice(0, 50))); } catch {}
}

function populateGuidesCatFilter() {
  const sel = document.getElementById('guidesCatFilter');
  if (!sel) return;
  const saved = sel.value;
  while (sel.options.length > 1) sel.remove(1);
  const cats = [...new Set([
    ...guideItems.map(g => g.category).filter(Boolean),
    ...loadGuideCategories()
  ])].sort();
  cats.forEach(c => {
    const o = document.createElement('option');
    o.value = o.textContent = c;
    sel.appendChild(o);
  });
  if (saved) sel.value = saved;
  // Also update datalist in any open guide modal
  const dl = document.getElementById('guideCatList');
  if (dl) {
    dl.innerHTML = '';
    cats.forEach(c => { const o = document.createElement('option'); o.value = c; dl.appendChild(o); });
  }
}

function renderGuides() {
  const search    = (document.getElementById('guidesSearch')?.value || '').toLowerCase().trim();
  const pinOnly   = document.getElementById('guidesPinFilter')?.classList.contains('active');
  const catFilter = document.getElementById('guidesCatFilter')?.value || '';
  const sort      = document.getElementById('guidesSort')?.value || 'updated';

  let list = guideItems.slice();
  if (pinOnly)   list = list.filter(g => g.pinned);
  if (catFilter) list = list.filter(g => g.category === catFilter);
  if (search)    list = list.filter(g =>
    g.title.toLowerCase().includes(search) ||
    (g.category || '').toLowerCase().includes(search) ||
    (g.tags || []).some(t => t.toLowerCase().includes(search)) ||
    (g.sections || []).some(s =>
      (s.title || '').toLowerCase().includes(search) ||
      (s.nodes || []).some(n => (n.value || n.content || '').toLowerCase().includes(search))
    )
  );

  function applySort(arr) {
    if (sort === 'title')        arr.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'created') arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else                         arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  const pinned   = list.filter(g => g.pinned);
  const unpinned = list.filter(g => !g.pinned);
  applySort(pinned); applySort(unpinned);
  list = [...pinned, ...unpinned];

  const listEl  = document.getElementById('guidesList');
  const emptyEl = document.getElementById('guidesEmpty');
  const countEl = document.getElementById('guidesCount');
  if (!listEl) return;
  listEl.innerHTML = '';

  if (list.length === 0) {
    emptyEl.style.display = 'block';
    emptyEl.innerHTML = pinOnly
      ? 'No pinned guides yet. Click the <strong>&#9733;</strong> on any guide card to pin it.'
      : 'No guides yet. Hit <strong>+ New guide</strong> to start documenting how-tos.';
    if (countEl) countEl.textContent = '';
    return;
  }
  emptyEl.style.display = 'none';
  if (countEl) countEl.textContent = `${list.length} guide${list.length !== 1 ? 's' : ''}`;

  list.forEach(item => {
    const firstContent = (item.sections || [])
      .flatMap(s => s.nodes || [])
      .map(n => (n.value || n.content || '').replace(/[#*`_\[\]]/g, '').trim())
      .find(t => t.length > 0) || '';
    const preview = firstContent.slice(0, 120) + (firstContent.length > 120 ? '…' : '');
    const tagsHtml = (item.tags || []).map(t => `<span class="snip-tag">${escHtml(t)}</span>`).join('');
    const catHtml  = item.category
      ? `<span class="guide-cat-badge">${escHtml(item.category)}</span>`
      : '';

    const div = document.createElement('div');
    div.className = 'guide-card';
    div.dataset.id = item.id;
    div.innerHTML = `
      <div class="guide-card-header">
        <span class="guide-title">${escHtml(item.title)}</span>
        ${catHtml}
        <div class="snip-card-actions">
          <button class="icon-btn snip-pin-btn${item.pinned ? ' active' : ''}" title="${item.pinned ? 'Unpin' : 'Pin'}">&#9733;</button>
          <button class="icon-btn guide-edit-btn" title="Edit">&#9998;</button>
          <button class="icon-btn del guide-del-btn" title="Delete">&#x2715;</button>
        </div>
      </div>
      ${tagsHtml ? `<div class="snip-tags" style="margin-top:5px">${tagsHtml}</div>` : ''}
      ${preview ? `<div class="guide-preview">${escHtml(preview)}</div>` : ''}
      <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);margin-top:6px">${wlFmtTs(item.updatedAt)}</div>`;

    div.querySelector('.guide-card-header').addEventListener('click', e => {
      if (e.target.closest('button')) return;
      openGuideViewModal(item.id);
    });
    div.querySelector('.snip-pin-btn').addEventListener('click', e => {
      e.stopPropagation();
      item.pinned = !item.pinned;
      saveGuides(guideItems);
      renderGuides();
    });
    div.querySelector('.guide-edit-btn').addEventListener('click', e => {
      e.stopPropagation();
      createGuideModal(item.id);
    });
    div.querySelector('.guide-del-btn').addEventListener('click', e => {
      e.stopPropagation();
      showConfirm(`Delete guide "${item.title}"?`, () => {
        guideItems = guideItems.filter(g => g.id !== item.id);
        saveGuides(guideItems);
        renderGuides();
        showToast('Guide deleted.');
      }, 'danger');
    });

    listEl.appendChild(div);
  });
}

function createGuideModal(editId) {
  if (editId && document.querySelector(`.wl-float-modal[data-guide-edit-id="${CSS.escape(editId)}"]`)) return;
  const item = editId ? guideItems.find(g => g.id === editId) : null;

  const modal = buildWLModalShell();
  if (editId) modal.dataset.guideEditId = editId;
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const titleIn = document.createElement('input');
  titleIn.type = 'text'; titleIn.className = 'wl-title-input';
  titleIn.placeholder = 'Guide title…';
  titleIn.value = item ? item.title : '';
  const catListId = 'guideCatList';
  const catIn = document.createElement('input');
  catIn.type = 'text'; catIn.className = 'guide-cat-input';
  catIn.placeholder = 'Category…';
  catIn.setAttribute('list', catListId);
  catIn.value = item ? (item.category || '') : '';
  const catList = document.createElement('datalist');
  catList.id = catListId;
  loadGuideCategories().forEach(c => { const o = document.createElement('option'); o.value = c; catList.appendChild(o); });
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn wl-close-btn';
  closeBtn.style.cssText = 'font-size:18px;opacity:0.6';
  closeBtn.innerHTML = '&#x2715;';
  header.append(titleIn, catIn, catList, closeBtn);

  const tagsRow = document.createElement('div');
  tagsRow.className = 'snip-tags-row';
  const tagsLabel = document.createElement('label');
  tagsLabel.textContent = 'Tags (comma-separated):';
  tagsLabel.className = 'snip-tags-label';
  const tagsIn = document.createElement('input');
  tagsIn.type = 'text'; tagsIn.className = 'snip-tags-input';
  tagsIn.placeholder = 'e.g. epic, sql, process';
  tagsIn.value = item ? (item.tags || []).join(', ') : '';
  tagsRow.append(tagsLabel, tagsIn);

  const guideDefaults = item || { sections: [
    { title: 'Overview',  nodes: [] },
    { title: 'Steps / Guidance', nodes: [] },
    { title: 'FYIs',      nodes: [] }
  ]};
  const sectionsEl = buildWLSectionsContainer(guideDefaults);
  const formatBar  = buildWLFormatBar();

  const footer = document.createElement('div');
  footer.className = 'wl-modal-footer';
  const addSecBtn = document.createElement('button');
  addSecBtn.className = 'tool-btn';
  addSecBtn.textContent = '+ Section';
  addSecBtn.addEventListener('click', () => {
    sectionsEl.appendChild(buildWLSectionEditor({ title: '', nodes: [] }));
  });
  const saveBtn = document.createElement('button');
  saveBtn.className = 'tool-btn primary';
  saveBtn.textContent = 'Save';
  saveBtn.style.marginLeft = 'auto';
  footer.append(addSecBtn, saveBtn);

  modal.append(dragBar, header, tagsRow, formatBar, sectionsEl, footer);
  document.body.appendChild(modal); modal._openModal?.();
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }
  
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); doSave(); }
  });
  titleIn.focus();

  saveBtn.addEventListener('click', doSave);
  function doSave() {
    const title = titleIn.value.trim();
    if (!title) { showToast('Enter a title.', true); titleIn.focus(); return; }
    const now      = new Date().toISOString();
    const category = catIn.value.trim();
    const tags     = tagsIn.value.split(',').map(t => t.trim()).filter(Boolean);
    const sections = collectWLSections(sectionsEl);
    saveGuideCategory(category);
    if (editId) {
      const existing = guideItems.find(g => g.id === editId);
      if (existing) {
        Object.assign(existing, { title, category, tags, sections, updatedAt: now });
      }
    } else {
      const newAreaId = selectedGuidesAreaId !== '__all__' ? selectedGuidesAreaId : null;
      guideItems.unshift({
        id: crypto.randomUUID(),
        title, category, tags, sections,
        areaId: newAreaId,
        pinned: false,
        createdAt: now, updatedAt: now
      });
    }
    saveGuides(guideItems);
    renderGuidesHub();
    showToast('Guide saved.');
    closeModal();
  }
}

function openGuideViewModal(guideId) {
  if (document.querySelector(`.wl-float-modal[data-guide-view-id="${CSS.escape(guideId)}"]`)) return;
  const item = guideItems.find(g => g.id === guideId);
  if (!item) return;

  const modal = buildWLModalShell();
  modal.dataset.guideViewId = guideId;
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const headerLeft = document.createElement('div');
  headerLeft.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:1;min-width:0';
  const titleEl = document.createElement('div');
  titleEl.className = 'wl-view-title';
  titleEl.textContent = item.title;
  const metaRow = document.createElement('div');
  metaRow.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap';
  if (item.category) {
    const cat = document.createElement('span');
    cat.className = 'guide-cat-badge';
    cat.textContent = item.category;
    metaRow.appendChild(cat);
  }
  (item.tags || []).forEach(t => {
    const span = document.createElement('span');
    span.className = 'snip-tag';
    span.textContent = t;
    metaRow.appendChild(span);
  });
  const tsSpan = document.createElement('span');
  tsSpan.style.cssText = 'font-family:var(--font-mono);font-size:10px;color:var(--text-faint);margin-left:auto';
  tsSpan.textContent = wlFmtTs(item.updatedAt);
  metaRow.appendChild(tsSpan);
  headerLeft.append(titleEl, metaRow);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn wl-close-btn';
  closeBtn.style.cssText = 'font-size:18px;opacity:0.6;align-self:flex-start;flex-shrink:0';
  closeBtn.innerHTML = '&#x2715;';
  header.append(headerLeft, closeBtn);

  const body = document.createElement('div');
  body.className = 'snip-view-body';

  function makeCollapsible(sectionEl, titleEl) {
    const chev = document.createElement('span');
    chev.className = 'snip-section-chevron';
    chev.innerHTML = '&#9660;';
    titleEl.classList.add('collapsible');
    titleEl.appendChild(chev);
    titleEl.addEventListener('click', () => sectionEl.classList.toggle('collapsed'));
  }

  (item.sections || []).forEach(sec => {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'wl-view-section';
    const secTitle = document.createElement('div');
    secTitle.className = 'wl-view-section-title';
    secTitle.textContent = sec.title || 'Notes';
    makeCollapsible(sectionEl, secTitle);
    const secBody = document.createElement('div');
    secBody.className = 'wl-view-section-body wl-md-rendered';
    const mdText = (sec.nodes || []).map(n => n.value || n.content || '').join('\n\n');
    if (mdText.trim()) {
      const parsed = marked.parse(mdText, { gfm: true, breaks: true });
      const tmp = document.createElement('div');
      tmp.innerHTML = parsed;
      tmp.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());
      tmp.querySelectorAll('a[href]').forEach(a => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); });
      secBody.innerHTML = tmp.innerHTML;
      secBody.querySelectorAll('pre code').forEach(block => {
        if (typeof hljs !== 'undefined') hljs.highlightElement(block);
      });
    } else {
      secBody.innerHTML = '<p style="color:var(--text-faint);font-size:12px;margin:0">Empty section.</p>';
    }
    sectionEl.append(secTitle, secBody);
    body.appendChild(sectionEl);
  });

  const footer = document.createElement('div');
  footer.className = 'wl-modal-footer';
  const editBtn = document.createElement('button');
  editBtn.className = 'tool-btn primary';
  editBtn.innerHTML = '&#9998; Edit';
  footer.appendChild(editBtn);

  modal.append(dragBar, header, body, footer);
  document.body.appendChild(modal); modal._openModal?.();
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }
  
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  editBtn.addEventListener('click', () => { closeModal(); createGuideModal(guideId); });
}

// ── Contacts UI ────────────────────────────────────────────────────
function renderContacts() {
  const search  = (document.getElementById('contactsSearch')?.value || '').toLowerCase().trim();
  const listEl  = document.getElementById('contactsList');
  const emptyEl = document.getElementById('contactsEmpty');
  const countEl = document.getElementById('contactsCount');
  if (!listEl) return;

  let list = contactItems.slice();
  if (search) list = list.filter(c =>
    c.name.toLowerCase().includes(search) ||
    (c.role || '').toLowerCase().includes(search) ||
    (c.team || '').toLowerCase().includes(search) ||
    (c.email || '').toLowerCase().includes(search) ||
    (c.notes || '').toLowerCase().includes(search) ||
    (c.tags || []).some(t => t.toLowerCase().includes(search))
  );
  list.sort((a, b) => a.name.localeCompare(b.name));

  listEl.innerHTML = '';
  if (list.length === 0) {
    emptyEl.style.display = 'block';
    if (countEl) countEl.textContent = '';
    return;
  }
  emptyEl.style.display = 'none';
  if (countEl) countEl.textContent = String(list.length);

  list.forEach(item => {
    const tagsHtml  = (item.tags || []).map(t => `<span class="snip-tag">${escHtml(t)}</span>`).join('');
    const emailHtml = item.email
      ? `<div class="contact-email-row"><a class="contact-email" href="mailto:${escHtml(item.email)}">${escHtml(item.email)}</a></div>`
      : '';
    const subtitle = [item.role, item.team].filter(Boolean).join(' · ');
    const notesPreview = (item.notes || '').slice(0, 100);

    const div = document.createElement('div');
    div.className = 'contact-card';
    div.dataset.id = item.id;
    div.innerHTML = `
      <div class="contact-card-header">
        <div class="contact-name">${escHtml(item.name)}</div>
        <div class="snip-card-actions">
          <button class="icon-btn contact-edit-btn" title="Edit">&#9998;</button>
          <button class="icon-btn del contact-del-btn" title="Delete">&#x2715;</button>
        </div>
      </div>
      ${subtitle ? `<div class="contact-subtitle">${escHtml(subtitle)}</div>` : ''}
      ${emailHtml}
      ${tagsHtml ? `<div class="snip-tags" style="margin-top:5px">${tagsHtml}</div>` : ''}
      ${notesPreview ? `<div class="contact-notes-preview">${escHtml(notesPreview)}${(item.notes || '').length > 100 ? '…' : ''}</div>` : ''}`;

    div.querySelector('.contact-edit-btn').addEventListener('click', e => {
      e.stopPropagation(); createContactModal(item.id);
    });
    div.querySelector('.contact-del-btn').addEventListener('click', e => {
      e.stopPropagation();
      showConfirm(`Delete contact "${item.name}"?`, () => {
        contactItems = contactItems.filter(c => c.id !== item.id);
        saveContacts(contactItems);
        renderContacts();
        showToast('Contact deleted.');
      }, 'danger');
    });
    listEl.appendChild(div);
  });
}

function createContactModal(contactId = null) {
  if (contactId && document.querySelector(`.wl-float-modal[data-contact-edit-id="${CSS.escape(contactId)}"]`)) return;
  const item = contactId ? contactItems.find(c => c.id === contactId) : null;

  const modal = buildWLModalShell();
  modal.style.width = 'min(560px, 96vw)';
  modal.dataset.contactEditId = contactId || 'new';
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const titleEl = document.createElement('div');
  titleEl.className = 'wl-modal-title-text';
  titleEl.textContent = item ? 'Edit contact' : 'New contact';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'wl-close-btn';
  closeBtn.innerHTML = '&#x2715;';
  header.append(titleEl, closeBtn);

  function mkRow(labelText, input, alignTop = false) {
    const row = document.createElement('div');
    row.className = 'snip-tags-row';
    if (alignTop) row.style.alignItems = 'flex-start';
    const lbl = document.createElement('label');
    lbl.className = 'snip-tags-label';
    lbl.style.cssText = 'width:60px;flex-shrink:0;text-align:right';
    lbl.textContent = labelText;
    row.append(lbl, input);
    return row;
  }

  const nameIn  = Object.assign(document.createElement('input'),    { type: 'text',  className: 'wl-ticket-input', placeholder: 'Full name…',           value: item?.name  || '' });
  const roleIn  = Object.assign(document.createElement('input'),    { type: 'text',  className: 'wl-ticket-input', placeholder: 'Role…',                 value: item?.role  || '' });
  const teamIn  = Object.assign(document.createElement('input'),    { type: 'text',  className: 'wl-ticket-input', placeholder: 'Team…',                 value: item?.team  || '' });
  const emailIn = Object.assign(document.createElement('input'),    { type: 'email', className: 'wl-ticket-input', placeholder: 'Email (optional)…',     value: item?.email || '' });
  const tagsIn  = Object.assign(document.createElement('input'),    { type: 'text',  className: 'wl-ticket-input', placeholder: 'Comma-separated tags…', value: (item?.tags || []).join(', ') });
  const notesIn = Object.assign(document.createElement('textarea'), { className: 'wl-ticket-input',                placeholder: 'Notes (markdown supported)…', value: item?.notes || '' });
  notesIn.style.cssText = 'resize:vertical;min-height:64px;font-family:var(--font-mono);font-size:12px';

  const formBody = document.createElement('div');
  formBody.style.cssText = 'overflow-y:auto;flex:1';
  formBody.append(mkRow('Name *', nameIn), mkRow('Role', roleIn), mkRow('Team', teamIn),
    mkRow('Email', emailIn), mkRow('Tags', tagsIn), mkRow('Notes', notesIn, true));

  const footer = document.createElement('div');
  footer.className = 'wl-modal-footer';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'tool-btn primary';
  saveBtn.textContent = 'Save';
  footer.appendChild(saveBtn);

  modal.append(dragBar, header, formBody, footer);
  document.body.appendChild(modal); modal._openModal?.();
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); doSave(); }
    if (e.key === 'Escape') closeModal();
  });
  nameIn.focus();

  saveBtn.addEventListener('click', doSave);
  function doSave() {
    const name = nameIn.value.trim();
    if (!name) { showToast('Name is required.', true); nameIn.focus(); return; }
    const now  = new Date().toISOString();
    const tags = tagsIn.value.split(',').map(t => t.trim()).filter(Boolean);
    if (item) {
      Object.assign(item, {
        name, role: roleIn.value.trim(), team: teamIn.value.trim(),
        email: emailIn.value.trim(), tags, notes: notesIn.value.trim(), updatedAt: now
      });
    } else {
      contactItems.unshift({
        id: crypto.randomUUID(),
        name, role: roleIn.value.trim(), team: teamIn.value.trim(),
        email: emailIn.value.trim(), tags, notes: notesIn.value.trim(),
        createdAt: now, updatedAt: now
      });
    }
    saveContacts(contactItems);
    modal._onClose = renderContacts;
    showToast(item ? 'Contact saved.' : 'Contact added.');
    closeModal();
  }
}

// ── Databases ─────────────────────────────────────────────────────

const DB_TYPES = ['Caboodle', 'Clarity', 'SSMS', 'Other'];
const DB_ORGS  = ['GSTT', 'KCH', 'LGT', 'Other'];
const DB_ENVS  = ['PROD', 'REL', 'POC/TST', 'REPLICA', 'Other'];
const DB_ACCESS_METHODS = ['Jump server', 'VPN', 'Citrix', 'Direct'];

const DB_TYPE_COLOURS = {
  Caboodle: { bg: 'rgba(37,99,235,.12)', text: '#2563eb' },
  Clarity:  { bg: 'rgba(124,58,237,.12)', text: '#7c3aed' },
  SSMS:     { bg: 'rgba(234,88,12,.12)',  text: '#ea580c' },
  Other:    { bg: 'rgba(100,116,139,.12)', text: '#64748b' }
};
const DB_ORG_COLOURS = {
  GSTT:  { bg: 'rgba(16,185,129,.12)',  text: '#059669' },
  KCH:   { bg: 'rgba(236,72,153,.12)',  text: '#db2777' },
  LGT:   { bg: 'rgba(245,158,11,.12)',  text: '#d97706' },
  Other: { bg: 'rgba(100,116,139,.12)', text: '#64748b' }
};

function dbBadge(val, colourMap) {
  const c = colourMap[val] || colourMap['Other'];
  return `<span class="db-badge" style="background:${c.bg};color:${c.text}">${escHtml(val)}</span>`;
}

function getDbOrgs(item) {
  // backward-compat: old items may have org (string) instead of orgs (array)
  if (Array.isArray(item.orgs)) return item.orgs;
  if (item.org) return [item.org];
  return [];
}

function renderDatabases() {
  const search    = (document.getElementById('dbSearch')?.value || '').toLowerCase().trim();
  const typeF     = document.getElementById('dbFilterType')?.value || '';
  const activeOrgs = Array.from(document.querySelectorAll('#dbFilterOrgPills .db-org-pill.active'))
                          .map(b => b.dataset.org);
  const listEl  = document.getElementById('dbList');
  const emptyEl = document.getElementById('dbEmpty');
  const countEl = document.getElementById('dbCount');
  if (!listEl) return;

  let list = dbAccessItems.slice();
  if (selectedDatabasesAreaId !== '__all__') list = list.filter(d => d.areaId === selectedDatabasesAreaId);
  if (typeF)             list = list.filter(d => d.type === typeF);
  if (activeOrgs.length) list = list.filter(d => getDbOrgs(d).some(o => activeOrgs.includes(o)));
  if (search) list = list.filter(d =>
    (d.name || '').toLowerCase().includes(search) ||
    (d.jumpServer || '').toLowerCase().includes(search) ||
    (d.dbServer || '').toLowerCase().includes(search) ||
    (d.notes || '').toLowerCase().includes(search) ||
    getDbOrgs(d).join(' ').toLowerCase().includes(search)
  );
  list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  if (countEl) countEl.textContent = list.length ? `${list.length} entr${list.length > 1 ? 'ies' : 'y'}` : '';
  if (emptyEl) emptyEl.style.display = list.length ? 'none' : '';
  listEl.innerHTML = '';

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'db-card';
    card.dataset.id = item.id;

    const typeBadge = item.type ? dbBadge(item.type, DB_TYPE_COLOURS) : '';
    const orgBadge  = getDbOrgs(item).map(o => dbBadge(o, DB_ORG_COLOURS)).join('');
    const envBadge  = item.env  ? `<span class="db-env-badge">${escHtml(item.env)}</span>` : '';

    const accessRow = item.accessMethod
      ? `<div class="db-access-row">
           <span class="db-meta-label">Access</span>
           <span class="db-meta-value">${escHtml(item.accessMethod)}</span>
         </div>`
      : '';

    const jumpRow = item.jumpServer
      ? `<div class="db-access-row">
           <span class="db-meta-label">Jump</span>
           <span class="db-meta-value db-mono">${escHtml(item.jumpServer)}</span>
         </div>`
      : '';

    const serverRow = item.dbServer
      ? `<div class="db-access-row">
           <span class="db-meta-label">Server</span>
           <span class="db-meta-value db-mono">${escHtml(item.dbServer)}${item.port ? `:${escHtml(item.port)}` : ''}</span>
         </div>`
      : '';

    const notesPreview = item.notes
      ? `<div class="knowledge-notes-preview">${escHtml(item.notes.replace(/[#*`_~>]/g,'').slice(0,100))}${item.notes.length > 100 ? '…' : ''}</div>`
      : '';

    card.innerHTML = `
      <div class="db-card-header">
        <div class="db-card-title">${escHtml(item.name || 'Untitled')}</div>
        <div class="db-card-badges">${typeBadge}${orgBadge}${envBadge}</div>
        <div class="snip-card-actions">
          <button class="icon-btn db-edit-btn" title="Edit">&#9998;</button>
          <button class="icon-btn del db-del-btn" title="Delete">&#x2715;</button>
        </div>
      </div>
      <div class="db-card-meta">${accessRow}${jumpRow}${serverRow}</div>
      ${notesPreview}
    `;

    card.querySelector('.db-edit-btn').addEventListener('click', e => { e.stopPropagation(); createDatabaseModal(item.id); });
    card.querySelector('.db-del-btn').addEventListener('click', e => {
      e.stopPropagation();
      confirmAction('Delete this database entry?', () => {
        dbAccessItems = dbAccessItems.filter(d => d.id !== item.id);
        saveDbAccess(dbAccessItems);
        renderDatabases();
      }, 'danger');
    });
    card.addEventListener('click', () => openDatabaseViewModal(item.id));
    listEl.appendChild(card);
  });

}

function createDatabaseModal(editId = null) {
  const item = editId ? dbAccessItems.find(d => d.id === editId) : null;

  const modal = buildWLModalShell();
  modal.style.width = 'min(580px, 96vw)';
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'wl-close-btn';
  closeBtn.innerHTML = '&#x2715;';

  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const titleIn = document.createElement('input');
  titleIn.type = 'text'; titleIn.className = 'wl-title-input';
  titleIn.placeholder = 'Connection name…'; titleIn.value = item?.name || '';
  header.append(titleIn, closeBtn);

  function mkRow(labelText, input, alignTop = false) {
    const row = document.createElement('div');
    row.className = 'snip-tags-row';
    if (alignTop) row.style.alignItems = 'flex-start';
    const lbl = document.createElement('label');
    lbl.className = 'snip-tags-label';
    lbl.style.cssText = 'width:72px;flex-shrink:0;text-align:right';
    lbl.textContent = labelText;
    row.append(lbl, input);
    return row;
  }
  function mkSelect(id, options, val) {
    const sel = document.createElement('select');
    sel.id = id; sel.className = 'wl-filter'; sel.style.flex = '1';
    options.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o; opt.textContent = o;
      if (o === val) opt.selected = true;
      sel.appendChild(opt);
    });
    return sel;
  }
  function mkText(id, placeholder, val) {
    const inp = document.createElement('input');
    inp.type = 'text'; inp.id = id; inp.className = 'wl-ticket-input';
    inp.placeholder = placeholder; inp.value = val || '';
    return inp;
  }

  const typeIn   = mkSelect('dbTypeIn',   DB_TYPES,           item?.type         || 'Caboodle');
  const envIn    = mkSelect('dbEnvIn',    DB_ENVS,            item?.env          || 'PROD');
  const accessIn = mkSelect('dbAccessIn', DB_ACCESS_METHODS,  item?.accessMethod || 'Jump server');
  const jumpIn   = mkText('dbJumpIn',   'e.g. atos-jump.gstt.nhs.uk', item?.jumpServer);
  const serverIn = mkText('dbServerIn', 'DB server / host name',      item?.dbServer);
  const portIn   = mkText('dbPortIn',   'Port (optional, e.g. 1433)', item?.port);
  const notesIn  = Object.assign(document.createElement('textarea'), { className: 'wl-ticket-input', value: item?.notes || '' });
  notesIn.placeholder = 'Credentials location, quirks…';
  notesIn.style.cssText = 'resize:vertical;min-height:72px;font-family:var(--font-mono);font-size:12px';

  const orgPills = document.createElement('div');
  orgPills.className = 'db-org-pills-input';
  const currentOrgs = getDbOrgs(item || {});
  DB_ORGS.forEach(o => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'db-org-pill'; btn.dataset.org = o; btn.textContent = o;
    if (currentOrgs.includes(o)) btn.classList.add('active');
    btn.addEventListener('click', () => btn.classList.toggle('active'));
    orgPills.appendChild(btn);
  });

  const formBody = document.createElement('div');
  formBody.style.cssText = 'overflow-y:auto;flex:1';
  formBody.append(
    mkRow('Type', typeIn), mkRow('Org(s)', orgPills),
    mkRow('Env', envIn), mkRow('Access', accessIn),
    mkRow('Jump', jumpIn), mkRow('Server', serverIn),
    mkRow('Port', portIn), mkRow('Notes', notesIn, true)
  );

  const footer = document.createElement('div');
  footer.className = 'wl-modal-footer';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'tool-btn primary';
  saveBtn.textContent = item ? 'Save changes' : 'Add entry';
  footer.appendChild(saveBtn);

  modal.append(dragBar, header, formBody, footer);
  document.body.appendChild(modal); modal._openModal?.();
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveBtn.click(); }
    if (e.key === 'Escape') closeModal();
  });
  titleIn.focus();

  saveBtn.addEventListener('click', () => {
    const name = titleIn.value.trim();
    if (!name) { showToast('Name is required.', true); titleIn.focus(); return; }
    const now = new Date().toISOString();
    const orgs = Array.from(orgPills.querySelectorAll('.db-org-pill.active')).map(b => b.dataset.org);
    const data = {
      name,
      type:         document.getElementById('dbTypeIn').value,
      orgs,
      env:          document.getElementById('dbEnvIn').value,
      accessMethod: document.getElementById('dbAccessIn').value,
      jumpServer:   document.getElementById('dbJumpIn').value.trim(),
      dbServer:     document.getElementById('dbServerIn').value.trim(),
      port:         document.getElementById('dbPortIn').value.trim(),
      notes:        notesIn.value
    };
    if (item) {
      Object.assign(item, { ...data, updatedAt: now });
    } else {
      const newDbAreaId = selectedDatabasesAreaId !== '__all__' ? selectedDatabasesAreaId : null;
      dbAccessItems.unshift({ id: crypto.randomUUID(), ...data, areaId: newDbAreaId, createdAt: now, updatedAt: now });
    }
    saveDbAccess(dbAccessItems);
    modal._onClose = renderDatabasesHub;
    showToast(item ? 'Entry saved.' : 'Entry added.');
    closeModal();
  });
}

function openDatabaseViewModal(itemId) {
  const item = dbAccessItems.find(d => d.id === itemId);
  if (!item) return;

  const modal = buildWLModalShell();
  modal.style.maxWidth = '560px';
  modal.style.width = '96vw';
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn wl-close-btn';
  closeBtn.style.cssText = 'font-size:18px;opacity:0.6;margin-left:auto;flex-shrink:0';
  closeBtn.innerHTML = '&#x2715;';

  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const titleWrap = document.createElement('div');
  titleWrap.style.cssText = 'flex:1;min-width:0';
  const typeBadge = item.type ? dbBadge(item.type, DB_TYPE_COLOURS) : '';
  const orgBadge  = getDbOrgs(item).map(o => dbBadge(o, DB_ORG_COLOURS)).join('');
  const envBadge  = item.env  ? `<span class="db-env-badge">${escHtml(item.env)}</span>` : '';
  const ts = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '';
  titleWrap.innerHTML = `
    <div style="font-size:16px;font-weight:600;color:var(--text);margin-bottom:5px">${escHtml(item.name || 'Untitled')}</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap">${typeBadge}${orgBadge}${envBadge}</div>
    ${ts ? `<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);margin-top:4px">Updated ${ts}</div>` : ''}
  `;
  header.append(titleWrap, closeBtn);

  const body = document.createElement('div');
  body.style.cssText = 'padding:1rem 1.25rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:6px';

  function viewRow(label, val, mono = false) {
    if (!val) return null;
    const row = document.createElement('div');
    row.className = 'db-view-row';
    row.innerHTML = `<span class="db-meta-label">${escHtml(label)}</span><span class="db-meta-value${mono ? ' db-mono' : ''}">${escHtml(val)}</span>`;
    return row;
  }

  const serverVal = item.dbServer ? (item.port ? `${item.dbServer}:${item.port}` : item.dbServer) : '';

  [
    viewRow('Access via',   item.accessMethod),
    viewRow('Jump server',  item.jumpServer, true),
    viewRow('DB server',    serverVal,       true),
  ].forEach(r => { if (r) body.appendChild(r); });

  if (item.notes) {
    const hr = document.createElement('hr');
    hr.style.cssText = 'border:none;border-top:1px solid var(--border);margin:4px 0';
    const notesEl = document.createElement('div');
    notesEl.className = 'wl-view-section-body wl-md-body';
    if (typeof marked !== 'undefined') {
      const _tmp = document.createElement('div');
      _tmp.innerHTML = marked.parse(item.notes);
      _tmp.querySelectorAll('a[href]').forEach(a => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); });
      notesEl.innerHTML = _tmp.innerHTML;
    } else {
      notesEl.innerHTML = escHtml(item.notes).replace(/\n/g, '<br>');
    }
    if (typeof hljs !== 'undefined') notesEl.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
    body.append(hr, notesEl);
  }

  const footer = document.createElement('div');
  footer.className = 'wl-modal-footer';
  const editBtn = document.createElement('button');
  editBtn.className = 'tool-btn'; editBtn.textContent = 'Edit';
  footer.appendChild(editBtn);

  modal.append(dragBar, header, body, footer);
  document.body.appendChild(modal); modal._openModal?.();
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }
  
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  editBtn.addEventListener('click', () => { closeModal(); createDatabaseModal(item.id); });
}

// ── SQL Snippets ───────────────────────────────────────────────────
const SNIP_GRAN_KEY = 'rcc_snip_granularities';
function loadGranularities() {
  try { return JSON.parse(localStorage.getItem(SNIP_GRAN_KEY)) || []; } catch { return []; }
}
function saveGranularity(val) {
  if (!val) return;
  const list = loadGranularities().filter(g => g !== val);
  list.unshift(val);
  try { localStorage.setItem(SNIP_GRAN_KEY, JSON.stringify(list.slice(0, 50))); } catch {}
}

function renderSnippets() {
  const search    = (document.getElementById('snipSearch')?.value || '').toLowerCase().trim();
  const srcFilter = document.getElementById('snipFilterSource')?.value || '';
  const sort      = document.getElementById('snipSort')?.value || 'updated';

  const favOnly = document.getElementById('snipFavFilter')?.classList.contains('active');
  let list = snipItems.slice();
  if (selectedSnippetsAreaId !== '__all__') list = list.filter(s => s.areaId === selectedSnippetsAreaId);
  if (favOnly)   list = list.filter(s => s.pinned);
  if (srcFilter) list = list.filter(s => s.source === srcFilter);
  if (search)    list = list.filter(s =>
    s.title.toLowerCase().includes(search) ||
    (s.query || '').toLowerCase().includes(search) ||
    (s.rootTable || '').toLowerCase().includes(search) ||
    (s.granularity || '').toLowerCase().includes(search) ||
    (s.tags || []).some(t => t.toLowerCase().includes(search))
  );
  function applySort(arr) {
    if (sort === 'title')        arr.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'created') arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else                         arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  const pinned   = list.filter(s => s.pinned);
  const unpinned = list.filter(s => !s.pinned);
  applySort(pinned); applySort(unpinned);
  list = [...pinned, ...unpinned];

  const listEl  = document.getElementById('snipList');
  const emptyEl = document.getElementById('snipEmpty');
  if (!listEl) return;
  listEl.innerHTML = '';
  if (list.length === 0) {
    if (emptyEl) { emptyEl.style.display = 'block'; emptyEl.innerHTML = favOnly
      ? 'No favourites yet. Click the <strong>&#9733;</strong> on any snippet card to pin it.'
      : 'No snippets yet. Hit <strong>+ New snippet</strong> to start building your query library.'; }
    const snipCountEl = document.getElementById('snipCount');
    if (snipCountEl) snipCountEl.textContent = '';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  const snipCountEl = document.getElementById('snipCount');
  if (snipCountEl) snipCountEl.textContent = `${list.length} snippet${list.length !== 1 ? 's' : ''}`;

  list.forEach(item => {
    const div = document.createElement('div');
    div.className = 'snip-card';
    div.dataset.id = item.id;

    const tagsHtml    = (item.tags || []).map(t => `<span class="snip-tag">${escHtml(t)}</span>`).join('');
    const queryPreview = (item.query || '').split('\n').slice(0, 2).join(' ').slice(0, 120);

    div.innerHTML = `
      <div class="snip-card-header">
        <span class="snip-title">${escHtml(item.title)}</span>
        <span class="snip-source-badge snip-src-${item.source.toLowerCase()}">${item.source}</span>
        <div class="snip-card-actions">
          <button class="icon-btn snip-pin-btn ${item.pinned ? 'active' : ''}" title="${item.pinned ? 'Unpin' : 'Pin'}">&#9733;</button>
          <button class="icon-btn snip-copyblock-btn" title="Copy with context">&#10010;</button>
          <button class="tool-btn snip-copy-btn" title="Copy query">Copy SQL</button>
          <button class="icon-btn snip-edit-btn" title="Edit">&#9998;</button>
          <button class="icon-btn del snip-del-btn" title="Delete">&#x2715;</button>
        </div>
      </div>
      ${tagsHtml ? `<div class="snip-tags">${tagsHtml}</div>` : ''}
      ${(item.rootTable || item.granularity) ? `<div class="snip-meta-row">${item.rootTable ? `<span class="snip-meta-field"><span class="snip-meta-label">table</span>${escHtml(item.rootTable)}</span>` : ''}${item.granularity ? `<span class="snip-meta-field"><span class="snip-meta-label">granularity</span>${escHtml(item.granularity)}</span>` : ''}</div>` : ''}
      ${queryPreview ? `<div class="snip-query-preview">${escHtml(queryPreview)}${item.query.length > 120 ? '…' : ''}</div>` : ''}
      <div class="snip-meta">${wlFmtTs(item.updatedAt)}</div>`;

    div.querySelector('.snip-card-header').addEventListener('click', e => {
      if (e.target.closest('button')) return;
      openSnipViewModal(item.id);
    });
    div.querySelector('.snip-pin-btn').addEventListener('click', e => {
      e.stopPropagation();
      item.pinned = !item.pinned;
      saveSnippets(snipItems);
      renderSnippets();
    });
    div.querySelector('.snip-copyblock-btn').addEventListener('click', e => {
      e.stopPropagation();
      navigator.clipboard.writeText(buildSnipBlock(item)).then(() => showToast('Copied with context.'));
    });
    div.querySelector('.snip-copy-btn').addEventListener('click', e => {
      e.stopPropagation();
      navigator.clipboard.writeText(item.query || '').then(() => showToast('Query copied.'));
    });
    div.querySelector('.snip-edit-btn').addEventListener('click', e => {
      e.stopPropagation();
      createSnipModal(item.id);
    });
    div.querySelector('.snip-del-btn').addEventListener('click', e => {
      e.stopPropagation();
      showConfirm(`Delete "${item.title}"?`, () => {
        snipItems = snipItems.filter(s => s.id !== item.id);
        saveSnippets(snipItems);
        renderSnippets();
      });
    });
    listEl.appendChild(div);
  });
}

function openSnipViewModal(itemId) {
  if (document.querySelector(`.wl-float-modal[data-snip-view-id="${CSS.escape(itemId)}"]`)) return;
  const item = snipItems.find(s => s.id === itemId);
  if (!item) return;

  const modal = buildWLModalShell();
  modal.dataset.snipViewId = itemId;
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const headerLeft = document.createElement('div');
  headerLeft.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:1;min-width:0';
  const titleEl = document.createElement('div');
  titleEl.className = 'wl-view-title';
  titleEl.textContent = item.title;
  const metaRow = document.createElement('div');
  metaRow.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap';
  metaRow.innerHTML = `<span class="snip-source-badge snip-src-${item.source.toLowerCase()}">${item.source}</span>`;
  (item.tags || []).forEach(t => {
    const span = document.createElement('span');
    span.className = 'snip-tag';
    span.textContent = t;
    metaRow.appendChild(span);
  });
  const tsSpan = document.createElement('span');
  tsSpan.style.cssText = 'font-family:var(--font-mono);font-size:10px;color:var(--text-faint);margin-left:auto';
  tsSpan.textContent = wlFmtTs(item.updatedAt);
  metaRow.appendChild(tsSpan);
  headerLeft.append(titleEl, metaRow);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn wl-close-btn';
  closeBtn.style.cssText = 'font-size:18px;opacity:0.6;align-self:flex-start;flex-shrink:0';
  closeBtn.innerHTML = '&#x2715;';
  header.append(headerLeft, closeBtn);

  let infoBar = null;
  if (item.rootTable || item.granularity) {
    infoBar = document.createElement('div');
    infoBar.className = 'snip-info-bar';
    if (item.rootTable) {
      const f = document.createElement('span');
      f.className = 'snip-info-field';
      f.innerHTML = `<span class="snip-meta-label">root table</span>${escHtml(item.rootTable)}`;
      infoBar.appendChild(f);
    }
    if (item.granularity) {
      const f = document.createElement('span');
      f.className = 'snip-info-field';
      f.innerHTML = `<span class="snip-meta-label">granularity</span>${escHtml(item.granularity)}`;
      infoBar.appendChild(f);
    }
  }

  const body = document.createElement('div');
  body.className = 'snip-view-body';

  function makeCollapsible(section, titleEl) {
    const chev = document.createElement('span');
    chev.className = 'snip-section-chevron';
    chev.innerHTML = '&#9660;';
    titleEl.classList.add('collapsible');
    titleEl.appendChild(chev);
    titleEl.addEventListener('click', () => section.classList.toggle('collapsed'));
  }

  const querySection = document.createElement('div');
  querySection.className = 'wl-view-section';
  const queryTitle = document.createElement('div');
  queryTitle.className = 'wl-view-section-title';
  queryTitle.textContent = 'Query';
  makeCollapsible(querySection, queryTitle);
  const pre = document.createElement('pre');
  pre.style.cssText = 'margin:0;position:relative';
  const code = document.createElement('code');
  const lang = (item.source === 'Other') ? '' : 'sql';
  if (lang) code.className = 'language-' + lang;
  code.textContent = item.query || '';
  if (lang && typeof hljs !== 'undefined') hljs.highlightElement(code);
  pre.appendChild(code);
  const copyBtn = document.createElement('button');
  copyBtn.className = 'wl-code-copy-btn';
  copyBtn.textContent = 'Copy';
  copyBtn.addEventListener('click', e => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.query || '').then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
    });
  });
  pre.appendChild(copyBtn);
  const queryBody = document.createElement('div');
  queryBody.className = 'wl-view-section-body wl-md-rendered';
  queryBody.appendChild(pre);
  querySection.append(queryTitle, queryBody);
  body.appendChild(querySection);

  if ((item.notes || '').trim()) {
    const notesSection = document.createElement('div');
    notesSection.className = 'wl-view-section';
    const notesTitle = document.createElement('div');
    notesTitle.className = 'wl-view-section-title';
    notesTitle.textContent = 'Notes';
    makeCollapsible(notesSection, notesTitle);
    const notesBody = document.createElement('div');
    notesBody.className = 'wl-view-section-body';
    const wrapper = document.createElement('div');
    wrapper.className = 'wl-md-rendered';
    const parsed = marked.parse(item.notes, { gfm: true, breaks: true });
    const tmp = document.createElement('div');
    tmp.innerHTML = parsed;
    tmp.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());
    tmp.querySelectorAll('a[href]').forEach(a => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); });
    wrapper.innerHTML = tmp.innerHTML;
    notesBody.appendChild(wrapper);
    notesSection.append(notesTitle, notesBody);
    body.appendChild(notesSection);
  }

  const footer = document.createElement('div');
  footer.className = 'wl-modal-footer';
  const editBtn = document.createElement('button');
  editBtn.className = 'tool-btn primary';
  editBtn.innerHTML = '&#9998; Edit';
  const copyQueryBtn = document.createElement('button');
  copyQueryBtn.className = 'tool-btn';
  copyQueryBtn.textContent = 'Copy SQL';
  copyQueryBtn.style.marginLeft = 'auto';
  copyQueryBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(item.query || '').then(() => showToast('Query copied.'));
  });
  const copyBlockBtn = document.createElement('button');
  copyBlockBtn.className = 'tool-btn';
  copyBlockBtn.textContent = 'Copy +';
  copyBlockBtn.title = 'Copy with title, metadata and notes';
  copyBlockBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(buildSnipBlock(item)).then(() => showToast('Copied with context.'));
  });
  footer.append(editBtn, copyBlockBtn, copyQueryBtn);

  const appendItems = [dragBar, header];
  if (infoBar) appendItems.push(infoBar);
  appendItems.push(body, footer);
  modal.append(...appendItems);
  document.body.appendChild(modal); modal._openModal?.();
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }
  
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  editBtn.addEventListener('click', () => { closeModal(); createSnipModal(itemId); });
}

function buildSnipBlock(item) {
  const lines = [];
  lines.push(`# ${item.title}`);
  const meta = [
    `**Source:** ${item.source}`,
    item.rootTable   ? `**Table:** ${item.rootTable}`           : null,
    item.granularity ? `**Granularity:** ${item.granularity}`   : null,
    (item.tags || []).length ? `**Tags:** ${item.tags.join(', ')}` : null,
  ].filter(Boolean);
  if (meta.length) lines.push(meta.join(' | '));
  lines.push('');
  lines.push('```sql');
  lines.push(item.query || '');
  lines.push('```');
  if ((item.notes || '').trim()) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(item.notes.trim());
  }
  return lines.join('\n');
}

function createSnipModal(editId) {
  if (editId && document.querySelector(`.wl-float-modal[data-snip-edit-id="${CSS.escape(editId)}"]`)) return;
  const item = editId ? snipItems.find(s => s.id === editId) : null;

  const modal = buildWLModalShell();
  modal.style.width = 'min(720px, 96vw)';
  if (editId) modal.dataset.snipEditId = editId;
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';

  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const titleIn = document.createElement('input');
  titleIn.type = 'text'; titleIn.className = 'wl-title-input';
  titleIn.placeholder = 'Snippet title…';
  titleIn.value = item ? item.title : '';
  const sourceSelect = document.createElement('select');
  sourceSelect.className = 'wl-inline-select';
  ['Caboodle', 'Clarity', 'Both', 'Other'].forEach(v => {
    const o = document.createElement('option');
    o.value = o.textContent = v;
    sourceSelect.appendChild(o);
  });
  sourceSelect.value = item ? item.source : 'Caboodle';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'wl-close-btn';
  closeBtn.innerHTML = '&#x2715;';
  header.append(titleIn, sourceSelect, closeBtn);

  // Metadata rows
  const granListId = 'snipGranList_' + Date.now();
  const tagsIn = Object.assign(document.createElement('input'), { type: 'text', className: 'wl-ticket-input', placeholder: 'e.g. encounter, wl, inpatient', value: item ? (item.tags || []).join(', ') : '' });
  const rootIn = Object.assign(document.createElement('input'), { type: 'text', className: 'wl-ticket-input', placeholder: 'e.g. DIM_Patient, F_Encounter',  value: item ? (item.rootTable   || '') : '' });
  const granIn = Object.assign(document.createElement('input'), { type: 'text', className: 'wl-ticket-input', placeholder: 'e.g. one row per encounter',      value: item ? (item.granularity || '') : '' });
  granIn.setAttribute('list', granListId);
  const granList = document.createElement('datalist');
  granList.id = granListId;
  loadGranularities().forEach(g => { const opt = document.createElement('option'); opt.value = g; granList.appendChild(opt); });

  function mkMetaRow(labelText, input) {
    const row = document.createElement('div'); row.className = 'snip-tags-row';
    const lbl = document.createElement('label'); lbl.className = 'snip-tags-label'; lbl.style.cssText = 'width:80px;flex-shrink:0;text-align:right'; lbl.textContent = labelText;
    row.append(lbl, input);
    return row;
  }
  const metaGroup = document.createElement('div');
  metaGroup.append(mkMetaRow('Tags', tagsIn), mkMetaRow('Root table', rootIn), mkMetaRow('Granularity', granIn), granList);

  const queryWrap = document.createElement('div');
  queryWrap.className = 'snip-query-wrap';
  const queryLabel = document.createElement('div');
  queryLabel.className = 'snip-field-label';
  queryLabel.textContent = 'Query';
  const queryArea = document.createElement('textarea');
  queryArea.className = 'snip-query-editor';
  queryArea.placeholder = 'SELECT …\nFROM …\nWHERE …';
  queryArea.value = item ? (item.query || '') : '';
  queryArea.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = queryArea.selectionStart;
      queryArea.value = queryArea.value.slice(0, s) + '    ' + queryArea.value.slice(queryArea.selectionEnd);
      queryArea.selectionStart = queryArea.selectionEnd = s + 4;
    }
  });
  queryWrap.append(queryLabel, queryArea);

  const notesWrap = document.createElement('div');
  notesWrap.className = 'snip-notes-wrap';
  const notesLabel = document.createElement('div');
  notesLabel.className = 'snip-field-label';
  notesLabel.textContent = 'Notes (markdown, optional)';
  const notesArea = document.createElement('textarea');
  notesArea.className = 'snip-notes-editor';
  notesArea.placeholder = 'Context, caveats, links to Epic docs…';
  notesArea.value = item ? (item.notes || '') : '';
  notesWrap.append(notesLabel, notesArea);

  const footer = document.createElement('div');
  footer.className = 'wl-modal-footer';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'tool-btn primary';
  saveBtn.textContent = 'Save';
  footer.appendChild(saveBtn);

  const body = document.createElement('div');
  body.style.cssText = 'overflow-y:auto;flex:1;min-height:0';
  body.append(metaGroup, queryWrap, notesWrap);

  modal.append(dragBar, header, body, footer);
  document.body.appendChild(modal); modal._openModal?.();
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); doSave(); }
  });
  titleIn.focus();

  function doSave() {
    const title = titleIn.value.trim();
    if (!title) { showToast('Enter a title.', true); return; }
    const now         = new Date().toISOString();
    const tags        = tagsIn.value.split(',').map(t => t.trim()).filter(Boolean);
    const rootTable   = rootIn.value.trim();
    const granularity = granIn.value.trim();
    saveGranularity(granularity);
    if (editId) {
      const existing = snipItems.find(s => s.id === editId);
      if (existing) {
        existing.title = title; existing.source = sourceSelect.value;
        existing.tags  = tags;  existing.query   = queryArea.value;
        existing.notes = notesArea.value; existing.rootTable = rootTable;
        existing.granularity = granularity; existing.updatedAt = now;
      }
    } else {
      const newSnipAreaId = selectedSnippetsAreaId !== '__all__' ? selectedSnippetsAreaId : null;
      snipItems.unshift({ id: crypto.randomUUID(), title, source: sourceSelect.value, tags, rootTable, granularity, query: queryArea.value, notes: notesArea.value, areaId: newSnipAreaId, createdAt: now, updatedAt: now });
    }
    saveSnippets(snipItems);
    showToast('Snippet saved.');
    modal._onClose = renderSnippetsHub;
    closeModal();
  }
  saveBtn.addEventListener('click', doSave);
}

// snipAddBtn and guidesAddBtn are kept in HTML (hidden) for legacy; their clicks are handled
// by snippetsAddEntryBtn / guidesAddEntryBtn wired further below.
// contactsAddBtn is still a static element.
document.getElementById('contactsAddBtn').addEventListener('click', () => createContactModal(null));
document.getElementById('contactsSearch').addEventListener('input', renderContacts);
// Toolbar filter elements for guides/snippets are built dynamically by renderGuidesToolbar /
// renderSnippetsToolbar — no static wiring needed here.

// Cmd+K overlay wiring
document.getElementById('cmdkOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('cmdkOverlay')) closeCmdK();
});
document.getElementById('cmdkInput').addEventListener('input', e => renderCmdKResults(e.target.value));
document.getElementById('cmdkInput').addEventListener('keydown', e => {
  const rows = Array.from(document.querySelectorAll('#cmdkResults .cmdk-row'));
  const focused = document.querySelector('#cmdkResults .cmdk-row.focused');
  const idx = focused ? parseInt(focused.dataset.idx) : -1;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const next = rows[Math.min(idx + 1, rows.length - 1)];
    rows.forEach(r => r.classList.remove('focused'));
    next?.classList.add('focused');
    next?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (idx <= 0) return;
    rows.forEach(r => r.classList.remove('focused'));
    rows[idx - 1]?.classList.add('focused');
    rows[idx - 1]?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    e.preventDefault();
    focused?.querySelector('.tool-btn.primary')?.click();
  } else if (e.key === 'Escape') {
    closeCmdK();
  }
});

// ── Tab switching ─────────────────────────────────────────────────

function switchHubTab(hub) {
  document.querySelectorAll('.hub-tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.hub === hub));
  const panelId = 'hub' + hub.charAt(0).toUpperCase() + hub.slice(1);
  document.querySelectorAll('.hub-panel').forEach(p =>
    p.classList.toggle('active', p.id === panelId));

  document.getElementById('linksAddBtn').style.display    = hub === 'links'    ? '' : 'none';
  document.getElementById('contactsAddBtn').style.display = hub === 'contacts' ? '' : 'none';
  // snipAddBtn / guidesAddBtn are legacy; hide always — sidebar hubs manage their own add buttons
  const snipAddBtnEl = document.getElementById('snipAddBtn');
  if (snipAddBtnEl) snipAddBtnEl.style.display = 'none';
  const guidesAddBtnEl = document.getElementById('guidesAddBtn');
  if (guidesAddBtnEl) guidesAddBtnEl.style.display = 'none';
  // New sidebar-based add buttons — hidden when switching away; shown by renderXHub when appropriate
  const guidesEntryBtnEl = document.getElementById('guidesAddEntryBtn');
  if (guidesEntryBtnEl && hub !== 'guides') guidesEntryBtnEl.style.display = 'none';
  const snippetsEntryBtnEl = document.getElementById('snippetsAddEntryBtn');
  if (snippetsEntryBtnEl && hub !== 'snippets') snippetsEntryBtnEl.style.display = 'none';
  const databasesEntryBtnEl = document.getElementById('databasesAddEntryBtn');
  if (databasesEntryBtnEl && hub !== 'databases') databasesEntryBtnEl.style.display = 'none';
  const clinicalEntryBtnEl = document.getElementById('clinicalAddEntryBtn');
  if (clinicalEntryBtnEl) clinicalEntryBtnEl.style.display = hub === 'clinical' && selectedClinicalAreaId ? '' : 'none';
  const cogitoEntryBtnEl = document.getElementById('cogitoAddEntryBtn');
  if (cogitoEntryBtnEl) cogitoEntryBtnEl.style.display = hub === 'cogito' && selectedCogitoAreaId ? '' : 'none';
  const reqprocEntryBtnEl = document.getElementById('reqprocAddEntryBtn');
  if (reqprocEntryBtnEl) reqprocEntryBtnEl.style.display = hub === 'reqproc' && selectedReqprocAreaId ? '' : 'none';
  const trustanalyticsEntryBtnEl = document.getElementById('trustanalyticsAddEntryBtn');
  if (trustanalyticsEntryBtnEl) trustanalyticsEntryBtnEl.style.display = hub === 'trustanalytics' && selectedTrustanalyticsAreaId ? '' : 'none';

  if (hub === 'contacts')        renderContacts();
  if (hub === 'databases')       renderDatabasesHub();
  if (hub === 'snippets')        renderSnippetsHub();
  if (hub === 'guides')          renderGuidesHub();
  if (hub === 'clinical')        renderClinicalHub();
  if (hub === 'cogito')          renderCogitoHub();
  if (hub === 'reqproc')         renderReqprocHub();
  if (hub === 'trustanalytics')  renderTrustanalyticsHub();
  localStorage.setItem('rcc_hub_tab', hub);
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR TAB — Phase 1
// ─────────────────────────────────────────────────────────────────────────────

let calView   = localStorage.getItem('rcc_cal_view')   || 'week';
let calAnchor = localStorage.getItem('rcc_cal_anchor') || weekKey(new Date());

function saveCalState() {
  localStorage.setItem('rcc_cal_view',   calView);
  localStorage.setItem('rcc_cal_anchor', calAnchor);
}

// Returns array of YYYY-MM-DD Monday dates where rec is due, within [startISO, endISO]
function getRecurringOccurrencesInRange(rec, startISO, endISO) {
  const results = [];
  let cur = getMonday(new Date(startISO + 'T00:00:00'));
  const end = new Date(endISO + 'T00:00:00');
  while (cur <= end) {
    const key = localDateStr(cur);
    const startRef = rec.startDate || rec.createdWeek || '';
    if (key >= startRef && nextOccurrence(rec, key)) results.push(key);
    cur.setDate(cur.getDate() + 7);
  }
  return results;
}

// Collect all events in [startISO, endISO] from tasks, reminders, and recurring tasks
function getCalEvents(startISO, endISO) {
  const events = [];

  function catCls(category, priority) {
    if (category) {
      const cat = OUTLOOK_CATS.find(c => c.label === category);
      if (cat) return cat.cls;
    }
    if (priority === 'High') return 'cal-pri-high';
    if (priority === 'Med')  return 'cal-pri-med';
    return 'cal-pri-low';
  }

  // Tasks from all weeks — placed by due date, or week Monday if no due date
  Object.entries(db.weeks).forEach(([wk, week]) => {
    (week.tasks || []).forEach(task => {
      const date = task.due || wk; // fallback: show on week's Monday as all-day
      if (date < startISO || date > endISO) return;
      events.push({
        id: task.id, recId: task.recId || null,
        title: task.name, date,
        time: task.due ? (task.time || null) : null, // no time if no due date → all-day
        type: 'task', priority: task.priority, done: task.done,
        cls: catCls(task.category, task.priority),
      });
    });
  });

  // Reminders — placed by date field
  reminders.forEach(rem => {
    if (!rem.date || rem.date < startISO || rem.date > endISO) return;
    events.push({
      id: rem.id, recId: null,
      title: rem.text, date: rem.date, time: rem.time || null,
      type: 'reminder', priority: rem.priority || 'Low', done: rem.done,
      cls: 'cal-reminder',
    });
  });

  // Recurring tasks — show future occurrences not yet injected into db.weeks
  recTasks.forEach(rec => {
    if (rec.active === false) return;
    getRecurringOccurrencesInRange(rec, startISO, endISO).forEach(dateISO => {
      const alreadyInjected = Object.values(db.weeks).some(w =>
        (w.tasks || []).some(t => t.recId === rec.id && t.due === dateISO));
      if (alreadyInjected) return;
      events.push({
        id: rec.id + '_' + dateISO, recId: rec.id,
        title: rec.name + ' ↻', date: dateISO, time: rec.time || null,
        type: 'recurring', priority: rec.priority, done: false,
        cls: catCls(rec.category, rec.priority),
      });
    });
  });

  return events;
}

// Week view renderer — Mon–Fri, 08:00–16:00
function renderCalWeek(anchor) {
  const container = document.getElementById('calWeekView');
  const monDate = new Date(anchor + 'T00:00:00');
  const today = localDateStr();
  const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri'];
  const MON_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const HOURS = [8,9,10,11,12,13,14,15,16,17];

  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monDate); d.setDate(d.getDate() + i);
    days.push(localDateStr(d));
  }

  const events = getCalEvents(days[0], days[4]);
  const allDay = {}, timed = {};
  days.forEach(d => { allDay[d] = []; timed[d] = []; });
  events.forEach(ev => {
    if (!allDay[ev.date]) return;
    if (ev.time) timed[ev.date].push(ev);
    else         allDay[ev.date].push(ev);
  });

  let h = '<div class="cal-week-grid">';

  // Header row: corner + day headers
  h += '<div class="cal-col-time cal-corner"></div>';
  days.forEach((d, i) => {
    const dt = new Date(d + 'T00:00:00');
    const isToday = d === today;
    h += `<div class="cal-day-header${isToday ? ' today' : ''}">
      <span class="cal-day-name">${DAY_NAMES[i]}</span>
      <span class="cal-day-date">${dt.getDate()} ${MON_NAMES[dt.getMonth()]}</span>
    </div>`;
  });

  // All-day row
  h += '<div class="cal-col-time cal-allday-lbl"><span>all‑day</span></div>';
  days.forEach(d => {
    const isToday = d === today;
    h += `<div class="cal-all-day-col${isToday ? ' today' : ''}">`;
    allDay[d].forEach(ev => {
      h += `<span class="cal-event cal-event-chip ${ev.type === 'reminder' ? 'cal-event-reminder-chip' : ev.cls}${ev.done ? ' done' : ''}" title="${escHtml(ev.title)}">${escHtml(ev.title)}</span>`;
    });
    h += '</div>';
  });

  // Hour rows
  HOURS.forEach(hr => {
    h += `<div class="cal-col-time cal-hour-lbl">${String(hr).padStart(2,'0')}:00</div>`;
    days.forEach(d => {
      const isToday = d === today;
      const slotEvents = timed[d].filter(ev => parseInt(ev.time.split(':')[0]) === hr);
      h += `<div class="cal-hour-slot${isToday ? ' today' : ''}" data-date="${d}" data-hour="${hr}">`;
      h += '<div class="cal-half-divider"></div>'; // 30-min midpoint line
      slotEvents.forEach(ev => {
        const mins = parseInt(ev.time.split(':')[1]);
        h += `<div class="cal-event cal-event-timed ${ev.type === 'reminder' ? 'cal-event-reminder' : ev.cls}${ev.done ? ' done' : ''}" style="top:${mins}px" title="${ev.time} — ${escHtml(ev.title)}">
          <span class="cal-event-time-lbl">${ev.time}</span> ${escHtml(ev.title)}
        </div>`;
      });
      h += '</div>';
    });
  });

  h += '</div>'; // cal-week-grid
  container.innerHTML = h;

  // Click on a time slot → add task or reminder
  container.addEventListener('click', e => {
    if (e.target.closest('.cal-event')) return; // don't fire on existing events
    const slot = e.target.closest('.cal-hour-slot');
    if (!slot) return;
    const rect = slot.getBoundingClientRect();
    const mins = (e.clientY - rect.top) < 30 ? 0 : 30;
    const hr   = parseInt(slot.dataset.hour);
    const time = String(hr).padStart(2,'0') + ':' + String(mins).padStart(2,'0');
    showCalAddPopover(e.clientX, e.clientY, slot.dataset.date, time);
  }, { once: false });
}

// Month view renderer — Mon–Sun 6-row grid
function renderCalMonth(anchor) {
  const container = document.getElementById('calMonthView');
  const firstOfMonth = new Date(anchor + 'T00:00:00');
  const today = localDateStr();
  const year = firstOfMonth.getFullYear();
  const month = firstOfMonth.getMonth();
  const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const gridStart = getMonday(firstOfMonth);
  const lastOfMonth = new Date(year, month + 1, 0);
  const dow = lastOfMonth.getDay(); // 0=Sun
  const daysAfter = dow === 0 ? 0 : 7 - dow;
  const gridEnd = new Date(lastOfMonth);
  gridEnd.setDate(gridEnd.getDate() + daysAfter);

  const startISO = localDateStr(gridStart);
  const endISO   = localDateStr(gridEnd);
  const events   = getCalEvents(startISO, endISO);

  const byDate = {};
  events.forEach(ev => { (byDate[ev.date] = byDate[ev.date] || []).push(ev); });

  let h = '<div class="cal-month-wrap">';

  // Day-of-week header
  h += '<div class="cal-month-dow-row">';
  DOW.forEach(d => h += `<div class="cal-month-dow">${d}</div>`);
  h += '</div>';

  // Day cells
  h += '<div class="cal-month-grid">';
  let cur = new Date(gridStart);
  const MAX_DOTS = 5;
  while (localDateStr(cur) <= endISO) {
    const dateISO = localDateStr(cur);
    const isToday = dateISO === today;
    const inMonth = cur.getMonth() === month;
    const dayEvts = byDate[dateISO] || [];
    h += `<div class="cal-month-cell${isToday ? ' today' : ''}${!inMonth ? ' out-of-month' : ''}">`;
    h += `<div class="cal-month-day-num">${cur.getDate()}</div>`;
    if (dayEvts.length > 0) {
      h += '<div class="cal-month-dots">';
      dayEvts.slice(0, MAX_DOTS).forEach(ev => {
        h += `<span class="cal-month-dot ${ev.type === 'reminder' ? 'cal-dot-reminder' : ev.cls}${ev.done ? ' done' : ''}" title="${ev.time ? ev.time + ' — ' : ''}${escHtml(ev.title)}"></span>`;
      });
      if (dayEvts.length > MAX_DOTS) h += `<span class="cal-month-more">+${dayEvts.length - MAX_DOTS}</span>`;
      h += '</div>';
    }
    h += '</div>';
    cur.setDate(cur.getDate() + 1);
  }
  h += '</div>'; // cal-month-grid
  h += '</div>'; // cal-month-wrap
  container.innerHTML = h;
}

// Update nav label
function updateCalLabel() {
  const label = document.getElementById('calLabel');
  if (!label) return;
  if (calView === 'week') {
    label.textContent = fmtWeekLabel(calAnchor) + ' · W' + getWeekNum(calAnchor);
  } else {
    const d = new Date(calAnchor + 'T00:00:00');
    const MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    label.textContent = MON[d.getMonth()] + ' ' + d.getFullYear();
  }
}

// Main calendar render entry point
function renderCalendar() {
  updateCalLabel();
  // Update view toggle pills
  document.getElementById('calViewWeek').classList.toggle('active',  calView === 'week');
  document.getElementById('calViewMonth').classList.toggle('active', calView === 'month');
  // Show/hide view containers
  document.getElementById('calWeekView').style.display  = calView === 'week'  ? 'block' : 'none';
  document.getElementById('calMonthView').style.display = calView === 'month' ? 'block' : 'none';
  if (calView === 'week')  renderCalWeek(calAnchor);
  else                     renderCalMonth(calAnchor);
}

// Click-to-add popover + modals
function showCalAddPopover(x, y, dateISO, timeStr) {
  document.querySelector('.cal-add-popover')?.remove();
  const pop = document.createElement('div');
  pop.className = 'cal-add-popover';
  pop.style.cssText = `position:fixed;left:${Math.min(x, window.innerWidth - 160)}px;top:${Math.min(y, window.innerHeight - 90)}px;z-index:9999`;
  pop.innerHTML = `
    <div class="cal-add-pop-label">${timeStr}</div>
    <button class="cal-add-pop-btn" id="_calPopTask">+ Task</button>
    <button class="cal-add-pop-btn cal-add-pop-rem" id="_calPopRem">+ Reminder</button>`;
  document.body.appendChild(pop);
  pop.querySelector('#_calPopTask').onclick = () => { pop.remove(); calAddTaskModal(dateISO, timeStr); };
  pop.querySelector('#_calPopRem').onclick  = () => { pop.remove(); calAddReminderModal(dateISO, timeStr); };
  const dismiss = e => { if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener('click', dismiss, true); } };
  setTimeout(() => document.addEventListener('click', dismiss, true), 0);
}

function calAddTaskModal(dateISO, timeStr) {
  const modal = buildWLModalShell();
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }
  

  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:14px;font-weight:600;color:var(--text);flex:1';
  titleEl.textContent = 'Add Task';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn wl-close-btn';
  closeBtn.style.cssText = 'font-size:18px;opacity:0.6';
  closeBtn.innerHTML = '&#x2715;';
  closeBtn.onclick = closeModal;
  header.append(titleEl, closeBtn);

  const body = document.createElement('div');
  body.style.cssText = 'padding:16px;display:flex;flex-direction:column;gap:10px;';
  body.innerHTML = `
    <input id="_calTaskName" type="text" placeholder="Task name…" style="width:100%;box-sizing:border-box;padding:7px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);font-size:13px">
    <div style="display:flex;gap:8px;align-items:center">
      <select id="_calTaskPri" style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);font-size:12px">
        <option value="Low">Low</option><option value="Med" selected>Med</option><option value="High">High</option>
      </select>
      <input id="_calTaskDate" type="date" value="${dateISO}" style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);font-size:12px">
      <input id="_calTaskTime" type="time" value="${timeStr}" style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);font-size:12px">
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button class="tool-btn" id="_calTaskCancel">Cancel</button>
      <button class="tool-btn primary" id="_calTaskSave">Add Task</button>
    </div>`;
  modal.append(dragBar, header, body);
  document.body.appendChild(modal); modal._openModal?.();
  requestAnimationFrame(() => modal.querySelector('#_calTaskName').focus());
  modal.querySelector('#_calTaskCancel').onclick = closeModal;
  modal.querySelector('#_calTaskSave').onclick = () => {
    const name = modal.querySelector('#_calTaskName').value.trim();
    if (!name) { showToast('Enter a task name.', true); return; }
    const due  = modal.querySelector('#_calTaskDate').value || dateISO;
    const time = modal.querySelector('#_calTaskTime').value;
    const pri  = modal.querySelector('#_calTaskPri').value;
    const targetWk = weekKey(new Date(due + 'T00:00:00'));
    const week = getWeek(db, targetWk);
    week.tasks.push({ id: crypto.randomUUID(), name, priority: pri, build: due, due, time, done: false, carried: false, notes: '' });
    saveDB(db);
    closeModal();
    renderCalendar();
    showToast('Task added.');
  };
  modal.querySelector('#_calTaskName').addEventListener('keydown', e => { if (e.key === 'Enter') modal.querySelector('#_calTaskSave').click(); });
}

function calAddReminderModal(dateISO, timeStr) {
  const modal = buildWLModalShell();
  const { dragBar, popoutBtn } = buildWLModalDragBar();
  popoutBtn.style.display = 'none';
  modal._dragCleanup = setupWLModalDrag(modal, dragBar);
  function closeModal() { closeWLModal(modal); }
  

  const header = document.createElement('div');
  header.className = 'wl-modal-header';
  const titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:14px;font-weight:600;color:var(--text);flex:1';
  titleEl.textContent = 'Add Reminder';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn wl-close-btn';
  closeBtn.style.cssText = 'font-size:18px;opacity:0.6';
  closeBtn.innerHTML = '&#x2715;';
  closeBtn.onclick = closeModal;
  header.append(titleEl, closeBtn);

  const body = document.createElement('div');
  body.style.cssText = 'padding:16px;display:flex;flex-direction:column;gap:10px;';
  body.innerHTML = `
    <input id="_calRemText" type="text" placeholder="Reminder text…" style="width:100%;box-sizing:border-box;padding:7px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);font-size:13px">
    <div style="display:flex;gap:8px;align-items:center">
      <select id="_calRemPri" style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);font-size:12px">
        <option value="Low">Low</option><option value="Med" selected>Med</option><option value="High">High</option>
      </select>
      <input id="_calRemDate" type="date" value="${dateISO}" style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);font-size:12px">
      <input id="_calRemTime" type="time" value="${timeStr}" style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);font-size:12px">
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button class="tool-btn" id="_calRemCancel">Cancel</button>
      <button class="tool-btn primary" id="_calRemSave">Add Reminder</button>
    </div>`;
  modal.append(dragBar, header, body);
  document.body.appendChild(modal); modal._openModal?.();
  requestAnimationFrame(() => modal.querySelector('#_calRemText').focus());
  modal.querySelector('#_calRemCancel').onclick = closeModal;
  modal.querySelector('#_calRemSave').onclick = () => {
    const text = modal.querySelector('#_calRemText').value.trim();
    if (!text) { showToast('Enter reminder text.', true); return; }
    const date = modal.querySelector('#_calRemDate').value || dateISO;
    const time = modal.querySelector('#_calRemTime').value;
    const pri  = modal.querySelector('#_calRemPri').value;
    reminders.push({ id: crypto.randomUUID(), text, date, time, priority: pri, done: false, createdAt: new Date().toISOString() });
    saveReminders(reminders);
    closeModal();
    renderCalendar();
    showToast('Reminder added.');
  };
  modal.querySelector('#_calRemText').addEventListener('keydown', e => { if (e.key === 'Enter') modal.querySelector('#_calRemSave').click(); });
}

// Calendar navigation
document.getElementById('calPrev').addEventListener('click', () => {
  const d = new Date(calAnchor + 'T00:00:00');
  if (calView === 'week') {
    d.setDate(d.getDate() - 7);
    calAnchor = localDateStr(getMonday(d));
  } else {
    d.setMonth(d.getMonth() - 1);
    calAnchor = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2,'0') + '-01';
  }
  saveCalState(); renderCalendar();
});
document.getElementById('calNext').addEventListener('click', () => {
  const d = new Date(calAnchor + 'T00:00:00');
  if (calView === 'week') {
    d.setDate(d.getDate() + 7);
    calAnchor = localDateStr(getMonday(d));
  } else {
    d.setMonth(d.getMonth() + 1);
    calAnchor = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2,'0') + '-01';
  }
  saveCalState(); renderCalendar();
});
document.getElementById('calToday').addEventListener('click', () => {
  const now = new Date();
  calAnchor = calView === 'week'
    ? weekKey(now)
    : now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2,'0') + '-01';
  saveCalState(); renderCalendar();
});
document.getElementById('calViewWeek').addEventListener('click', () => {
  if (calView === 'week') return;
  // Switch from month → week: jump to week containing calAnchor
  calView = 'week';
  calAnchor = weekKey(new Date(calAnchor + 'T00:00:00'));
  saveCalState(); renderCalendar();
});
document.getElementById('calViewMonth').addEventListener('click', () => {
  if (calView === 'month') return;
  // Switch from week → month: jump to month containing calAnchor
  calView = 'month';
  const d = new Date(calAnchor + 'T00:00:00');
  calAnchor = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2,'0') + '-01';
  saveCalState(); renderCalendar();
});

// ── Archive Panel ──────────────────────────────────────────────────────────────

function renderArchivePanel() {
  const panel = document.getElementById('archivePanel');
  if (!panel) return;
  panel.innerHTML = '';

  const hubs = [
    { label: 'Clinical', entries: clinicalEntries, save: saveClinicalEntries, render: renderClinicalHub, open: id => openClinicalEntryViewModal(id) },
    { label: 'Cogito', entries: cogitoEntries, save: saveCogitoEntries, render: renderCogitoHub, open: id => openCogitoEntryViewModal(id) },
    { label: 'Req & Proc', entries: reqprocEntries, save: saveReqprocEntries, render: renderReqprocHub, open: id => openReqprocEntryViewModal(id) },
    { label: 'Trust Analytics', entries: trustanalyticsEntries, save: saveTrustanalyticsEntries, render: renderTrustanalyticsHub, open: id => openTrustanalyticsEntryViewModal(id) },
    { label: 'Work Log', entries: wlItems, save: saveWL, render: renderWL, open: id => openWLViewModal(id) },
    { label: 'Snippets', entries: snipItems, save: saveSnippets, render: renderSnippetsHub, open: null },
    { label: 'Guides', entries: guideItems, save: saveGuides, render: renderGuidesHub, open: null },
  ];

  let hasAny = false;
  hubs.forEach(hub => {
    const archived = (hub.entries || []).filter(e => e.archived);
    if (!archived.length) return;
    hasAny = true;

    const section = document.createElement('div');
    section.className = 'archive-hub-section';
    const heading = document.createElement('div');
    heading.className = 'archive-hub-heading';
    heading.textContent = hub.label;
    section.appendChild(heading);

    archived.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'archive-entry-row';
      const titleEl = document.createElement('span');
      titleEl.className = 'archive-entry-title';
      titleEl.textContent = entry.title || '(untitled)';
      const meta = document.createElement('span');
      meta.className = 'archive-entry-meta';
      meta.textContent = entry.archivedAt ? 'Archived ' + wlFmtTs(entry.archivedAt) : '';
      const restoreBtn = document.createElement('button');
      restoreBtn.className = 'tool-btn';
      restoreBtn.textContent = 'Restore';
      restoreBtn.addEventListener('click', async () => {
        entry.archived = false;
        delete entry.archivedAt;
        await hub.save(hub.entries);
        hub.render();
        renderArchivePanel();
        showToast('Restored.');
      });
      row.append(titleEl, meta, restoreBtn);
      section.appendChild(row);
    });
    panel.appendChild(section);
  });

  if (!hasAny) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.style.padding = '3rem 1.5rem';
    empty.innerHTML = 'No archived entries yet.<br><span style="font-size:12px;color:var(--text-faint)">Archive entries from their edit modals using the Archive button.</span>';
    panel.appendChild(empty);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function switchTab(tab) {
  ['Todos','Worklog','References','Dashboard','Calendar','Archive'].forEach(t => {
    const panelEl = document.getElementById('panel' + t);
    const tabEl = document.getElementById('tab' + t);
    if (panelEl) panelEl.classList.toggle('active', t === tab);
    if (tabEl) tabEl.classList.toggle('active', t === tab);
  });
  document.getElementById('weekNav').style.display        = tab === 'Todos'      ? 'flex' : 'none';
  document.getElementById('wlNav').style.display          = tab === 'Worklog'    ? 'flex' : 'none';
  document.getElementById('referencesNav').style.display  = tab === 'References' ? 'flex' : 'none';
  document.getElementById('calNav').style.display         = tab === 'Calendar'   ? 'flex' : 'none';
  if (tab === 'Worklog')    { renderWLSidebar(); renderWL(); }
  if (tab === 'References') {
    const hub = localStorage.getItem('rcc_hub_tab') || 'links';
    switchHubTab(hub);
  }
  if (tab === 'Dashboard')  requestAnimationFrame(renderDashboard);
  if (tab === 'Calendar')   renderCalendar();
  if (tab === 'Archive')    renderArchivePanel();
  localStorage.setItem('rcc_active_tab', tab);
}

// Wire up tabs
['tabTodos', 'tabWorklog', 'tabReferences', 'tabDashboard', 'tabCalendar', 'tabArchive'].forEach(id => {
  const tab = id.replace('tab', '');
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => switchTab(tab));
});

// Wire hub sub-tabs
document.querySelectorAll('.hub-tab-btn').forEach(btn =>
  btn.addEventListener('click', () => switchHubTab(btn.dataset.hub)));

document.getElementById('clinicalAddAreaBtn').addEventListener('click', function() {
  const btn = this;
  if (document.getElementById('clinicalAreaAddRow')) return;
  btn.style.display = 'none';
  const row = document.createElement('div');
  row.id = 'clinicalAreaAddRow';
  row.className = 'clinical-area-add-row';
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'wl-search';
  inp.placeholder = 'Area name…';
  inp.style.fontSize = '12px';
  const rowBtns = document.createElement('div');
  rowBtns.className = 'row-btns';
  const okBtn = document.createElement('button');
  okBtn.className = 'add-confirm-btn';
  okBtn.textContent = 'add';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'icon-btn';
  cancelBtn.innerHTML = '&#x2715;';
  function done() { row.remove(); btn.style.display = ''; }
  okBtn.addEventListener('click', () => {
    const name = inp.value.trim();
    if (!name) return;
    const area = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
    clinicalAreas.push(area);
    saveClinicalAreas(clinicalAreas);
    done();
    selectClinicalArea(area.id);
  });
  cancelBtn.addEventListener('click', done);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') okBtn.click(); if (e.key === 'Escape') done(); });
  rowBtns.append(okBtn, cancelBtn);
  row.append(inp, rowBtns);
  btn.parentNode.insertBefore(row, btn);
  inp.focus();
});

document.getElementById('clinicalAddEntryBtn').addEventListener('click', () => {
  createClinicalEntryModal(null, selectedClinicalAreaId);
});

document.getElementById('cogitoAddAreaBtn').addEventListener('click', function() {
  const btn = this;
  if (document.getElementById('cogitoAreaAddRow')) return;
  btn.style.display = 'none';
  const row = document.createElement('div');
  row.id = 'cogitoAreaAddRow';
  row.className = 'clinical-area-add-row';
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'wl-search';
  inp.placeholder = 'Area name…';
  inp.style.fontSize = '12px';
  const rowBtns = document.createElement('div');
  rowBtns.className = 'row-btns';
  const okBtn = document.createElement('button');
  okBtn.className = 'add-confirm-btn';
  okBtn.textContent = 'add';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'icon-btn';
  cancelBtn.innerHTML = '&#x2715;';
  function done() { row.remove(); btn.style.display = ''; }
  okBtn.addEventListener('click', () => {
    const name = inp.value.trim();
    if (!name) return;
    const area = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
    cogitoAreas.push(area);
    saveCogitoAreas(cogitoAreas);
    done();
    selectCogitoArea(area.id);
  });
  cancelBtn.addEventListener('click', done);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') okBtn.click(); if (e.key === 'Escape') done(); });
  rowBtns.append(okBtn, cancelBtn);
  row.append(inp, rowBtns);
  btn.parentNode.insertBefore(row, btn);
  inp.focus();
});

document.getElementById('cogitoAddEntryBtn').addEventListener('click', () => {
  createCogitoEntryModal(null, selectedCogitoAreaId);
});

document.getElementById('reqprocAddAreaBtn').addEventListener('click', function() {
  const btn = this;
  if (document.getElementById('reqprocAreaAddRow')) return;
  btn.style.display = 'none';
  const row = document.createElement('div'); row.id = 'reqprocAreaAddRow'; row.className = 'clinical-area-add-row';
  const inp = document.createElement('input'); inp.type = 'text'; inp.className = 'wl-search'; inp.placeholder = 'Area name…'; inp.style.fontSize = '12px';
  const rowBtns = document.createElement('div'); rowBtns.className = 'row-btns';
  const okBtn = document.createElement('button'); okBtn.className = 'add-confirm-btn'; okBtn.textContent = 'add';
  const cancelBtn = document.createElement('button'); cancelBtn.className = 'icon-btn'; cancelBtn.innerHTML = '&#x2715;';
  function done() { row.remove(); btn.style.display = ''; }
  okBtn.addEventListener('click', () => {
    const name = inp.value.trim(); if (!name) return;
    const area = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
    reqprocAreas.push(area); saveReqprocAreas(reqprocAreas); done(); selectReqprocArea(area.id);
  });
  cancelBtn.addEventListener('click', done);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') okBtn.click(); if (e.key === 'Escape') done(); });
  rowBtns.append(okBtn, cancelBtn); row.append(inp, rowBtns); btn.parentNode.insertBefore(row, btn); inp.focus();
});

document.getElementById('reqprocAddEntryBtn').addEventListener('click', () => {
  createReqprocEntryModal(null, selectedReqprocAreaId);
});

document.getElementById('trustanalyticsAddAreaBtn').addEventListener('click', function() {
  const btn = this;
  if (document.getElementById('trustanalyticsAreaAddRow')) return;
  btn.style.display = 'none';
  const row = document.createElement('div'); row.id = 'trustanalyticsAreaAddRow'; row.className = 'clinical-area-add-row';
  const inp = document.createElement('input'); inp.type = 'text'; inp.className = 'wl-search'; inp.placeholder = 'Area name…'; inp.style.fontSize = '12px';
  const rowBtns = document.createElement('div'); rowBtns.className = 'row-btns';
  const okBtn = document.createElement('button'); okBtn.className = 'add-confirm-btn'; okBtn.textContent = 'add';
  const cancelBtn = document.createElement('button'); cancelBtn.className = 'icon-btn'; cancelBtn.innerHTML = '&#x2715;';
  function done() { row.remove(); btn.style.display = ''; }
  okBtn.addEventListener('click', () => {
    const name = inp.value.trim(); if (!name) return;
    const area = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
    trustanalyticsAreas.push(area); saveTrustanalyticsAreas(trustanalyticsAreas); done(); selectTrustanalyticsArea(area.id);
  });
  cancelBtn.addEventListener('click', done);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') okBtn.click(); if (e.key === 'Escape') done(); });
  rowBtns.append(okBtn, cancelBtn); row.append(inp, rowBtns); btn.parentNode.insertBefore(row, btn); inp.focus();
});

document.getElementById('trustanalyticsAddEntryBtn').addEventListener('click', () => {
  createTrustanalyticsEntryModal(null, selectedTrustanalyticsAreaId);
});

// ── Guides / Snippets / Databases add-area buttons ─────────────────

function _makeAddAreaBtn(btnId, rowId, areasArr, saveAreasFunc, selectFunc) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener('click', function() {
    if (document.getElementById(rowId)) return;
    btn.style.display = 'none';
    const row = document.createElement('div');
    row.id = rowId; row.className = 'clinical-area-add-row';
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'wl-search';
    inp.placeholder = 'Category name\u2026'; inp.style.fontSize = '12px';
    const rowBtns = document.createElement('div'); rowBtns.className = 'row-btns';
    const okBtn = document.createElement('button'); okBtn.className = 'add-confirm-btn'; okBtn.textContent = 'add';
    const cancelBtn = document.createElement('button'); cancelBtn.className = 'icon-btn'; cancelBtn.innerHTML = '&#x2715;';
    function done() { row.remove(); btn.style.display = ''; }
    okBtn.addEventListener('click', () => {
      const name = inp.value.trim(); if (!name) return;
      const area = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
      areasArr.push(area); saveAreasFunc(areasArr); done(); selectFunc(area.id);
    });
    cancelBtn.addEventListener('click', done);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); okBtn.click(); } if (e.key === 'Escape') done(); });
    rowBtns.append(okBtn, cancelBtn); row.append(inp, rowBtns);
    btn.parentNode.insertBefore(row, btn); inp.focus();
  });
}

_makeAddAreaBtn('guidesAddAreaBtn',    'guidesAreaAddRow',    guidesAreas,    saveGuidesAreas,    selectGuidesArea);
_makeAddAreaBtn('snippetsAddAreaBtn',  'snippetsAreaAddRow',  snippetsAreas,  saveSnippetsAreas,  selectSnippetsArea);
_makeAddAreaBtn('databasesAddAreaBtn', 'databasesAreaAddRow', databasesAreas, saveDatabasesAreas, selectDatabasesArea);

document.getElementById('guidesAddEntryBtn').addEventListener('click', () => createGuideModal(null));
document.getElementById('snippetsAddEntryBtn').addEventListener('click', () => createSnipModal(null));
document.getElementById('databasesAddEntryBtn').addEventListener('click', () => createDatabaseModal(null));

// Restore last active tab on load (defaults to Dashboard)
const _savedTab    = localStorage.getItem('rcc_active_tab');
const _validTabs   = ['Todos','Worklog','References','Dashboard','Calendar'];
const _initialTab  = (_savedTab && _validTabs.includes(_savedTab)) ? _savedTab : 'Dashboard';
switchTab(_initialTab);

// Keep --header-h in sync so sticky elements below the header stay correctly positioned
(function() {
  const hdr = document.querySelector('header');
  function updateHeaderH() { document.documentElement.style.setProperty('--header-h', hdr.offsetHeight + 'px'); }
  updateHeaderH();
  new ResizeObserver(updateHeaderH).observe(hdr);
})();

document.getElementById('wlShowArchivedBtn').addEventListener('click', () => {
  wlShowArchived = !wlShowArchived;
  const btn = document.getElementById('wlShowArchivedBtn');
  btn.textContent = wlShowArchived ? 'Hide archived' : 'Show archived';
  btn.style.borderColor = wlShowArchived ? 'var(--accent-muted)' : '';
  btn.style.color = wlShowArchived ? 'var(--accent)' : '';
  renderWL();
});

(function() {
  const btn = document.getElementById('wlViewToggle');
  function applyViewMode() {
    btn.textContent = wlViewMode === 'board' ? '☰ List' : '⊞ Board';
    btn.style.borderColor = wlViewMode === 'board' ? 'var(--accent-muted)' : '';
    btn.style.color = wlViewMode === 'board' ? 'var(--accent)' : '';
    document.querySelector('.wl-layout').classList.toggle('wl-board-mode', wlViewMode === 'board');
  }
  applyViewMode();
  btn.addEventListener('click', () => {
    wlViewMode = wlViewMode === 'board' ? 'list' : 'board';
    localStorage.setItem('rcc_wl_view', wlViewMode);
    applyViewMode();
    renderWL();
  });
})();

document.getElementById('wlNewItemBtn').addEventListener('click', () => createWLModal(null));

['wlSearch','wlFilterType','wlFilterStatus','wlSort'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderWL);
  document.getElementById(id).addEventListener('change', renderWL);
});


document.getElementById('calBtn').addEventListener('click', () => {
  window.open('https://outlook.cloud.microsoft/calendar/view/workweek', '_blank');
});

// ── Collapsible sections ─────────────────────────────────────────
const COLLAPSE_KEY = 'work_todo_collapsed_v1';
const SECTION_BODIES = { thisweek: 'thisWeekBody', reminders: 'remindersBody', recurring: 'recurringBody' };

let collapsedSections = {};
try { collapsedSections = JSON.parse(localStorage.getItem(COLLAPSE_KEY)) || {}; } catch { collapsedSections = {}; }

function applyCollapseState() {
  document.querySelectorAll('.section-header.collapsible').forEach(header => {
    const key = header.dataset.section;
    const bodyId = SECTION_BODIES[key];
    const body = bodyId && document.getElementById(bodyId);
    if (!body) return;
    const isCollapsed = !!collapsedSections[key];
    header.classList.toggle('collapsed', isCollapsed);
    body.style.display = isCollapsed ? 'none' : '';
  });
}

document.querySelectorAll('.section-header.collapsible').forEach(header => {
  header.addEventListener('click', () => {
    const key = header.dataset.section;
    collapsedSections[key] = !collapsedSections[key];
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsedSections));
    applyCollapseState();
  });
});

applyCollapseState();

// ── Popup window mode ──────────────────────────────────────────
(function() {
  const params = new URLSearchParams(location.search);
  const popoutId = params.get('popout');
  if (popoutId !== null) {
    document.body.classList.add('popout-mode');
    // Switch to worklog tab silently
    document.getElementById('panelTodos').classList.remove('active');
    document.getElementById('panelWorklog').classList.add('active');
    document.getElementById('tabTodos').classList.remove('active');
    document.getElementById('tabWorklog').classList.add('active');
    const id = popoutId === 'new' ? null : popoutId;
    setTimeout(() => createWLModal(id), 350);
  }
})();

// Keep any other open windows (main or other popups) in sync when localStorage changes
window.addEventListener('storage', e => {
  if (e.key === 'rcc_wl_sync') {
    loadWL().then(items => { wlItems = items; renderWL(); populateWlDropdowns(); });
  }
  if (e.key === DB_KEY) {
    db = loadDB();
    currentKey = db.currentWeek || weekKey(new Date());
    render();
  }
  if (e.key === REC_KEY) {
    recTasks = loadRec();
    renderRecPanel();
  }
  if (e.key === REM_KEY) {
    reminders = loadReminders();
    renderReminders();
  }
  if (e.key === LINKS_KEY) {
    linkItems = loadLinks();
    renderLinks();
  }
  if (e.key === CONTACTS_KEY) {
    contactItems = loadContacts();
    renderContacts();
  }
  if (e.key === DB_ACCESS_KEY) {
    dbAccessItems = loadDbAccess();
    if (localStorage.getItem('rcc_hub_tab') === 'databases') renderDatabases();
  }
});

// ── Dashboard ─────────────────────────────────────────────────────

let _dashRange = 'week';
let _dashCharts = {};
let _lastDashHash = '';
let _dashCutoff = null;   // ISO date string, snapshotted once per renderDashboard() call

function computeDashCutoff() {
  if (_dashRange === 'all') return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (_dashRange === 'week' ? 7 : 30));
  return localDateStr(cutoff);
}

// Accepts an ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm...).
// ISO strings compare lexicographically, so >= works correctly.
function dashRangeFilter(isoStr) {
  if (!isoStr) return false;
  if (_dashCutoff === null) return true;
  return isoStr >= _dashCutoff;
}

function dashGetAllTasks() {
  const tasks = [];
  Object.keys(db.weeks).forEach(wk => {
    (db.weeks[wk].tasks || []).forEach(t => tasks.push({ ...t, _weekKey: wk }));
  });
  return tasks;
}

function dashFilteredTasks() {
  return dashGetAllTasks().filter(t => dashRangeFilter(t._weekKey));
}

function dashFilteredTimeLogs() {
  const entries = [];
  dashGetAllTasks().forEach(task => {
    (task.timeLogs || []).forEach(log => {
      if (dashRangeFilter((log.start || '').slice(0, 10))) entries.push({ log, task });
    });
  });
  return entries;
}

function destroyDashCharts() {
  Object.values(_dashCharts).forEach(c => { try { c.destroy(); } catch {} });
  _dashCharts = {};
}

function buildDashInsights(filteredTasks, allTasks, allWlItems, filteredTimeLogs) {
  const insights = [];
  const s = n => n !== 1 ? 's' : '';

  // A — Carry-over rate
  const total = filteredTasks.length;
  const carried = filteredTasks.filter(t => t.carried).length;
  const carryRate = total > 0 ? carried / total : 0;
  if (carryRate > 0.3) {
    insights.push({ type: 'warning', head: `${Math.round(carryRate * 100)}% carry-over rate`, body: `${carried} task${s(carried)} rolled to next week. Try committing to fewer items.` });
  } else if (total > 5 && carryRate <= 0.15) {
    insights.push({ type: 'good', head: `Strong completion (${Math.round((1 - carryRate) * 100)}%)`, body: 'You are clearing most tasks within the week they were created.' });
  }

  // B — Blocked items (always relevant, no range filter)
  const blocked = allWlItems.filter(i => i.status === 'Blocked');
  if (blocked.length > 0) {
    const oldestDays = Math.max(...blocked.map(i => Math.floor((Date.now() - new Date(i.updatedAt)) / 86400000)));
    insights.push({ type: 'alert', head: `${blocked.length} item${s(blocked.length)} blocked`, body: `Oldest blocked for ${oldestDays} day${s(oldestDays)}. Resolve dependencies to restore flow.` });
  }

  // C — Stale In Progress (>7 days since last update)
  const stale = allWlItems.filter(i => i.status === 'In Progress' && (Date.now() - new Date(i.updatedAt)) > 7 * 86400000);
  if (stale.length > 0) {
    insights.push({ type: 'warning', head: `${stale.length} item${s(stale.length)} stalled`, body: 'In Progress for 7+ days. Break them down or escalate.' });
  }

  // D — Overdue tasks (all weeks, not range-filtered)
  const today = localDateStr();
  const overdue = allTasks.filter(t => !t.done && t.due && t.due < today);
  if (overdue.length > 0) {
    insights.push({ type: 'alert', head: `${overdue.length} overdue task${s(overdue.length)}`, body: 'Tasks past their due date. Reschedule or close to keep your list clean.' });
  }

  // E — Priority mismatch
  const hi = filteredTasks.filter(t => t.priority === 'High');
  const lo = filteredTasks.filter(t => t.priority === 'Low');
  const hiRate = hi.length > 2 ? hi.filter(t => t.done).length / hi.length : null;
  const loRate = lo.length > 2 ? lo.filter(t => t.done).length / lo.length : null;
  if (hiRate !== null && loRate !== null && loRate > hiRate + 0.15) {
    insights.push({ type: 'warning', head: 'Priority mismatch', body: `Low-priority tasks (${Math.round(loRate * 100)}% done) outpacing High (${Math.round(hiRate * 100)}% done). Review your focus.` });
  }

  // F — No timer data
  if (filteredTimeLogs.length === 0 && allWlItems.length > 0) {
    insights.push({ type: 'info', head: 'No timer data', body: 'Use the timer on work log items to unlock time-based insights.' });
  }

  // Sort: alert first, then warning, good, info; return top 3
  const order = { alert: 0, warning: 1, good: 2, info: 3 };
  return insights.sort((a, b) => order[a.type] - order[b.type]).slice(0, 3);
}

function renderDashboard() {
  // Skip full rebuild if underlying data hasn't changed
  const _hashInput = _dashRange + '|' + Object.keys(db.weeks || {}).length + '|' +
    JSON.stringify(Object.values(db.weeks || {}).map(w => w.tasks.map(t => t.id + t.done + (t.carried||0) + (t.timeLogs ? t.timeLogs.length : 0)))) +
    '|' + wlItems.map(i => i.id + i.status + i.type + i.updatedAt).join(',');
  const _newHash = _hashInput.length + '_' + _hashInput.slice(0, 300);
  if (_newHash === _lastDashHash) return;
  _lastDashHash = _newHash;

  _dashCutoff = computeDashCutoff();   // snapshot cutoff once for entire render
  destroyDashCharts();

  const tasks = dashFilteredTasks();
  const timeLogs = dashFilteredTimeLogs();
  const allTasks = dashGetAllTasks();

  // Shared Chart.js style
  const textColor  = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
  const gridColor  = getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim();
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

  // ── KPI calculations ──
  const done       = tasks.filter(t => t.done).length;
  const total      = tasks.length;
  const carried    = tasks.filter(t => t.carried).length;
  const carryRate  = total > 0 ? Math.round((carried / total) * 100) : 0;
  const totalSecs  = timeLogs.reduce((s, e) => s + (e.log.duration || 0), 0);
  const sessions   = timeLogs.length;
  const wlActive   = wlItems.filter(i => i.status !== 'Archived' && i.status !== 'Complete').length;
  const today      = localDateStr();
  const overdueCount = allTasks.filter(t => !t.done && t.due && t.due < today).length;
  const doneRate   = total > 0 ? Math.round((done / total) * 100) : 0;

  // ── KPI cards ──
  document.getElementById('dashCards').innerHTML = `
    <div class="dash-card">
      <div class="dash-card-label">Tasks done</div>
      <div class="dash-card-value">${done}<span style="font-size:1rem;font-weight:400;color:var(--text-muted)"> / ${total}</span></div>
      <div class="dash-card-sub">${doneRate}% completion rate</div>
    </div>
    <div class="dash-card">
      <div class="dash-card-label">Carry-over rate</div>
      <div class="dash-card-value" style="color:${carryRate > 30 ? '#f59e0b' : 'var(--text)'}">${carryRate}%</div>
      <div class="dash-card-sub">${carried} task${carried !== 1 ? 's' : ''} rolled over</div>
    </div>
    <div class="dash-card">
      <div class="dash-card-label">Time logged</div>
      <div class="dash-card-value">${totalSecs > 0 ? fmtDuration(totalSecs) : '—'}</div>
      <div class="dash-card-sub">${sessions} session${sessions !== 1 ? 's' : ''}</div>
    </div>
    <div class="dash-card">
      <div class="dash-card-label">WL active</div>
      <div class="dash-card-value">${wlActive}</div>
      <div class="dash-card-sub">not complete or archived</div>
    </div>
    <div class="dash-card">
      <div class="dash-card-label">Overdue</div>
      <div class="dash-card-value" style="color:${overdueCount > 0 ? '#ef4444' : 'var(--text)'}">${overdueCount}</div>
      <div class="dash-card-sub">${overdueCount > 0 ? 'past due date' : 'nothing overdue'}</div>
    </div>
  `;

  // ── Insights ──
  const insights = buildDashInsights(tasks, allTasks, wlItems, timeLogs);
  const insightsEl = document.getElementById('dashInsights');
  insightsEl.innerHTML = '';
  insightsEl.style.display = insights.length === 0 ? 'none' : '';
  insights.forEach(ins => {
    const card = document.createElement('div');
    card.className = `dash-insight ${ins.type}`;
    card.innerHTML = `<div class="dash-insight-head">${ins.head}</div><div class="dash-insight-body">${ins.body}</div>`;
    insightsEl.appendChild(card);
  });

  // ── Chart 1: Weekly completion vs carry-over (stacked bar) ──
  const trendWeeks = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i * 7);
    trendWeeks.push(weekKey(d));
  }
  const trendLabels  = trendWeeks.map(wk => `W${getWeekNum(wk)}`);
  const trendDone    = trendWeeks.map(wk => (db.weeks[wk]?.tasks || []).filter(t => t.done).length);
  const trendCarried = trendWeeks.map(wk => (db.weeks[wk]?.tasks || []).filter(t => t.carried).length);
  const hasWeekData  = trendDone.some(v => v > 0) || trendCarried.some(v => v > 0);
  document.getElementById('chartWeekTrendEmpty').style.display = hasWeekData ? 'none' : 'block';
  document.getElementById('chartWeekTrend').style.display = hasWeekData ? 'block' : 'none';
  if (hasWeekData) {
    _dashCharts.weekTrend = new Chart(document.getElementById('chartWeekTrend'), {
      type: 'bar',
      data: {
        labels: trendLabels,
        datasets: [
          { label: 'Done',    data: trendDone,    backgroundColor: accentColor, borderRadius: 3, stack: 's' },
          { label: 'Carried', data: trendCarried, backgroundColor: '#f59e0b',   borderRadius: 3, stack: 's' }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: textColor, font: { size: 10 } } } },
        scales: {
          x: { stacked: true, ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } },
          y: { stacked: true, ticks: { color: textColor, font: { size: 10 }, stepSize: 1 }, grid: { color: gridColor } }
        }
      }
    });
  }

  // ── Chart 2: Time or count by WL type (horizontal bar) ──
  const wlTimeSecs = {};
  const wlCountMap = {};
  wlItems.filter(i => i.status !== 'Archived').forEach(i => {
    if (i.type) {
      wlTimeSecs[i.type] = (wlTimeSecs[i.type] || 0) + (i.timeLogs || []).reduce((s, l) => s + (l.duration || 0), 0);
      wlCountMap[i.type] = (wlCountMap[i.type] || 0) + 1;
    }
  });
  const hasTimeData   = Object.values(wlTimeSecs).some(v => v > 0);
  const wlTypeData    = hasTimeData ? wlTimeSecs : wlCountMap;
  const wlTypeSorted  = Object.entries(wlTypeData).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const hasWlData     = wlTypeSorted.length > 0;
  const wlTitleEl     = document.getElementById('chartWlTypeTitle');
  if (wlTitleEl) wlTitleEl.textContent = hasTimeData ? 'Time by work type' : 'Work log items by type';
  document.getElementById('chartWlTypeEmpty').style.display = hasWlData ? 'none' : 'block';
  document.getElementById('chartWlType').style.display = hasWlData ? 'block' : 'none';
  if (hasWlData) {
    _dashCharts.wlType = new Chart(document.getElementById('chartWlType'), {
      type: 'bar',
      data: {
        labels: wlTypeSorted.map(([l]) => l),
        datasets: [{ data: wlTypeSorted.map(([, v]) => hasTimeData ? Math.round(v / 60) : v), backgroundColor: accentColor, borderRadius: 4, borderSkipped: false }]
      },
      options: {
        indexAxis: 'y', responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => hasTimeData ? ' ' + fmtDuration(wlTimeSecs[wlTypeSorted[ctx.dataIndex][0]]) : ` ${ctx.parsed.x} item${ctx.parsed.x !== 1 ? 's' : ''}` } }
        },
        scales: {
          x: { ticks: { color: textColor, font: { size: 10 }, callback: v => hasTimeData ? v + 'm' : v }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  }

  // ── Chart 3: WL pipeline by status (horizontal bar) ──
  const PIPELINE_STATUSES = ['Not Started', 'In Progress', 'Blocked', 'Under Review', 'Complete'];
  const PIPELINE_COLORS   = ['#94a3b8', accentColor, '#ef4444', '#f59e0b', '#22c55e'];
  const pipelineCounts    = PIPELINE_STATUSES.map(s => wlItems.filter(i => i.status === s).length);
  const hasPipeline       = pipelineCounts.some(v => v > 0);
  document.getElementById('chartPipelineEmpty').style.display = hasPipeline ? 'none' : 'block';
  document.getElementById('chartPipeline').style.display = hasPipeline ? 'block' : 'none';
  if (hasPipeline) {
    _dashCharts.pipeline = new Chart(document.getElementById('chartPipeline'), {
      type: 'bar',
      data: {
        labels: PIPELINE_STATUSES,
        datasets: [{ data: pipelineCounts, backgroundColor: PIPELINE_COLORS, borderRadius: 4, borderSkipped: false }]
      },
      options: {
        indexAxis: 'y', responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} item${ctx.parsed.x !== 1 ? 's' : ''}` } }
        },
        scales: {
          x: { ticks: { color: textColor, font: { size: 10 }, stepSize: 1 }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  }

  // ── Chart 4: Priority completion (grouped bar) ──
  const PRIORITIES    = ['High', 'Med', 'Low'];
  const priDone       = PRIORITIES.map(p => tasks.filter(t => t.priority === p && t.done).length);
  const priTotal      = PRIORITIES.map(p => tasks.filter(t => t.priority === p).length);
  const hasPriData    = priTotal.some(v => v > 0);
  document.getElementById('chartPriorityEmpty').style.display = hasPriData ? 'none' : 'block';
  document.getElementById('chartPriority').style.display = hasPriData ? 'block' : 'none';
  if (hasPriData) {
    _dashCharts.priority = new Chart(document.getElementById('chartPriority'), {
      type: 'bar',
      data: {
        labels: PRIORITIES,
        datasets: [
          { label: 'Done',  data: priDone,  backgroundColor: accentColor, borderRadius: 3 },
          { label: 'Total', data: priTotal, backgroundColor: gridColor,   borderRadius: 3 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: textColor, font: { size: 10 } } } },
        scales: {
          x: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { color: textColor, font: { size: 10 }, stepSize: 1 }, grid: { color: gridColor } }
        }
      }
    });
  }
}

// Range button wiring
document.querySelectorAll('.dash-range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dash-range-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _dashRange = btn.dataset.range;
    renderDashboard();
  });
});

// ── Time slot select population ──────────────────────────────────
function populateTimeSelect(selId, includeNoTime) {
  const sel = document.getElementById(selId);
  if (!sel) return;
  const slots = [];
  if (includeNoTime) slots.push({ value: '', text: 'No time slot' });
  slots.push({ value: '00:00', text: '00:00' });
  for (let h = 7; h <= 18; h++) {
    for (const m of [0, 30]) {
      if (h === 18 && m === 30) continue;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push({ value: `${hh}:${mm}`, text: `${hh}:${mm}` });
    }
  }
  const cur = sel.value;
  sel.innerHTML = '';
  slots.forEach(s => {
    const o = document.createElement('option');
    o.value = s.value; o.textContent = s.text;
    sel.appendChild(o);
  });
  if (cur) sel.value = cur;
}
populateTimeSelect('newTaskTime', false);
populateTimeSelect('recTime', true);

// ── Timer safety: flush any running timers on page close ─────────────────
function flushRunningTimers() {
  let changed = false;
  const now = new Date().toISOString();
  // Task timers
  Object.values(db.weeks || {}).forEach(week => {
    (week.tasks || []).forEach(t => {
      if (t.timerStart) {
        const duration = Math.round((new Date() - new Date(t.timerStart)) / 1000);
        if (duration > 0) {
          if (!t.timeLogs) t.timeLogs = [];
          t.timeLogs.push({ start: t.timerStart, end: now, duration });
        }
        t.timerStart = null;
        changed = true;
      }
    });
  });
  // Recurring task timers
  recTasks.forEach(r => {
    if (r.timerStart) {
      const duration = Math.round((new Date() - new Date(r.timerStart)) / 1000);
      if (duration > 0) {
        if (!r.timeLogs) r.timeLogs = [];
        r.timeLogs.push({ start: r.timerStart, end: now, duration });
      }
      r.timerStart = null;
      changed = true;
    }
  });
  // Work log timers
  wlItems.forEach(w => {
    if (w.timerStart) {
      const duration = Math.round((new Date() - new Date(w.timerStart)) / 1000);
      if (duration > 0) {
        if (!w.timeLogs) w.timeLogs = [];
        w.timeLogs.push({ start: w.timerStart, end: now, duration });
      }
      w.timerStart = null;
      changed = true;
    }
  });
  if (changed) { saveDB(db); saveRec(recTasks); saveWL(wlItems); }
}
// flushRunningTimers() is available for manual use but is not auto-called on
// unload or visibility change — timerStart is already persisted to localStorage
// on every save, so timers survive page refreshes naturally.

// Storage quota check — warn on load if less than 1 MB available
if (navigator.storage && navigator.storage.estimate) {
  navigator.storage.estimate().then(({ usage, quota }) => {
    const available = quota - usage;
    if (available < 1 * 1024 * 1024) {
      const availMB = (available / (1024 * 1024)).toFixed(1);
      showToast(`Storage low — only ${availMB} MB free. Export a backup.`, true);
    }
  });
}

