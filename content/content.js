(function () {
  const PC = window.PeriodCalendar;
  const WEEKDAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const STORAGE_KEYS = {
    lastYear: 'periodCalendar.lastYear',
    notes: 'periodCalendar.notes',
    theme: 'periodCalendar.theme',
  };

  const state = {
    year: new Date().getFullYear(),
    notes: {},
    open: false,
    dismissed: false,
    editingIso: null,
    theme: 'dark',
  };

  // ---------- storage ----------

  function loadState(callback) {
    chrome.storage.local.get(
      [STORAGE_KEYS.lastYear, STORAGE_KEYS.notes, STORAGE_KEYS.theme],
      (result) => {
        if (typeof result[STORAGE_KEYS.lastYear] === 'number') {
          state.year = result[STORAGE_KEYS.lastYear];
        }
        state.notes = result[STORAGE_KEYS.notes] || {};
        if (result[STORAGE_KEYS.theme] === 'light' || result[STORAGE_KEYS.theme] === 'dark') {
          state.theme = result[STORAGE_KEYS.theme];
        }
        callback();
      }
    );
  }

  function saveLastYear() {
    chrome.storage.local.set({ [STORAGE_KEYS.lastYear]: state.year });
  }

  function saveNotes() {
    chrome.storage.local.set({ [STORAGE_KEYS.notes]: state.notes });
  }

  function saveTheme() {
    chrome.storage.local.set({ [STORAGE_KEYS.theme]: state.theme });
  }

  // ---------- DOM setup ----------

  const host = document.createElement('div');
  host.id = 'period-calendar-host';
  const shadow = host.attachShadow({ mode: 'closed' });

  const styleEl = document.createElement('style');
  styleEl.textContent = window.PERIOD_CALENDAR_CSS;
  shadow.appendChild(styleEl);

  const root = document.createElement('div');
  root.className = 'pc-root';
  shadow.appendChild(root);

  const pill = document.createElement('div');
  pill.className = 'pc-pill';
  const pillLabel = document.createElement('span');
  pillLabel.className = 'pc-pill-label';
  const pillDate = document.createElement('span');
  pillDate.className = 'pc-pill-date';
  const pillDismiss = document.createElement('button');
  pillDismiss.className = 'pc-pill-dismiss';
  pillDismiss.textContent = '×';
  pillDismiss.title = 'Hide for this tab';
  pill.appendChild(pillLabel);
  pill.appendChild(document.createTextNode('·'));
  pill.appendChild(pillDate);
  pill.appendChild(pillDismiss);
  root.appendChild(pill);

  const panel = document.createElement('div');
  panel.className = 'pc-panel';
  panel.style.display = 'none';
  root.appendChild(panel);

  function mount() {
    (document.body || document.documentElement).appendChild(host);
  }

  function applyTheme() {
    host.classList.toggle('pc-theme-light', state.theme === 'light');
  }

  function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveTheme();
    renderPanel();
  }

  // ---------- pill ----------

  function renderPill() {
    const today = new Date();
    const label = PC.getWeekLabelForDate(today);
    pillLabel.textContent = label || '—';
    pillDate.textContent = `${PC.MONTH_NAMES[today.getMonth()].slice(0, 3)} ${today.getDate()}`;
    pill.style.display = state.dismissed ? 'none' : 'flex';
  }

  pill.addEventListener('click', (e) => {
    if (e.target === pillDismiss) return;
    state.open = !state.open;
    renderPanel();
  });

  pillDismiss.addEventListener('click', (e) => {
    e.stopPropagation();
    state.dismissed = true;
    state.open = false;
    renderPill();
    renderPanel();
  });

  // ---------- panel ----------

  function renderPanel() {
    panel.style.display = state.open ? 'flex' : 'none';
    if (!state.open) return;
    panel.replaceChildren();
    panel.appendChild(buildHeader());
    panel.appendChild(buildBody());
  }

  function buildHeader() {
    const header = document.createElement('div');
    header.className = 'pc-panel-header';

    const leftSpacer = document.createElement('div');

    const yearNav = document.createElement('div');
    yearNav.className = 'pc-year-nav';
    const prevBtn = makeButton('‹', 'Previous year', () => changeYear(-1), 'pc-btn-icon');
    const title = document.createElement('div');
    title.className = 'pc-panel-title';
    title.textContent = String(state.year);
    const nextBtn = makeButton('›', 'Next year', () => changeYear(1), 'pc-btn-icon');
    yearNav.appendChild(prevBtn);
    yearNav.appendChild(title);
    yearNav.appendChild(nextBtn);

    const actions = document.createElement('div');
    actions.className = 'pc-header-actions';
    const todayBtn = makeButton('Today', 'Jump to today', () => goToToday());
    const themeBtn = makeButton(
      state.theme === 'light' ? '🌙' : '☀️',
      state.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode',
      toggleTheme,
      'pc-btn-icon'
    );
    const clearBtn = makeButton('Clear notes', `Clear all notes for ${state.year}`, () => clearYearNotes());
    const closeBtn = makeButton('✕', 'Close', () => {
      state.open = false;
      renderPanel();
    }, 'pc-btn-icon');
    actions.appendChild(todayBtn);
    actions.appendChild(themeBtn);
    actions.appendChild(clearBtn);
    actions.appendChild(closeBtn);

    header.appendChild(leftSpacer);
    header.appendChild(yearNav);
    header.appendChild(actions);
    return header;
  }

  function goToToday() {
    const today = new Date();
    if (state.year !== today.getFullYear()) {
      state.year = today.getFullYear();
      saveLastYear();
    }
    renderPanel();
    const todayEl = panel.querySelector('.pc-day-today');
    if (todayEl) todayEl.scrollIntoView({ block: 'center' });
  }

  function makeButton(text, title, onClick, extraClass) {
    const btn = document.createElement('button');
    btn.className = extraClass ? `pc-btn ${extraClass}` : 'pc-btn';
    btn.textContent = text;
    btn.title = title;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function changeYear(delta) {
    state.year += delta;
    saveLastYear();
    renderPanel();
  }

  function clearYearNotes() {
    const count = Object.keys(state.notes).filter((iso) => iso.startsWith(`${state.year}-`)).length;
    if (count === 0) return;
    const confirmed = window.confirm(`Delete all ${count} note(s) saved for ${state.year}? This cannot be undone.`);
    if (!confirmed) return;
    Object.keys(state.notes).forEach((iso) => {
      if (iso.startsWith(`${state.year}-`)) delete state.notes[iso];
    });
    saveNotes();
    renderPanel();
  }

  function buildBody() {
    const body = document.createElement('div');
    body.className = 'pc-panel-body';

    const months = document.createElement('div');
    months.className = 'pc-months';
    const grid = PC.buildYearGrid(state.year);
    const todayIso = PC.toISODate(new Date());

    grid.forEach((month) => months.appendChild(buildMonth(month, todayIso)));

    body.appendChild(months);
    return body;
  }

  function buildMonth(month, todayIso) {
    const wrap = document.createElement('div');

    const name = document.createElement('div');
    name.className = 'pc-month-name';
    name.textContent = month.name;
    wrap.appendChild(name);

    const weekdayRow = document.createElement('div');
    weekdayRow.className = 'pc-weekday-row';
    weekdayRow.appendChild(document.createElement('div'));
    WEEKDAY_SHORT.forEach((d) => {
      const cell = document.createElement('div');
      cell.className = 'pc-weekday-cell';
      cell.textContent = d;
      weekdayRow.appendChild(cell);
    });
    wrap.appendChild(weekdayRow);

    month.weeks.forEach((week) => {
      const row = document.createElement('div');
      row.className = 'pc-week-row';

      const label = document.createElement('div');
      label.className = 'pc-week-label';
      label.textContent = week.label || '';
      row.appendChild(label);

      week.days.forEach((day) => row.appendChild(buildDayCell(day, todayIso)));
      wrap.appendChild(row);
    });

    return wrap;
  }

  function buildDayCell(day, todayIso) {
    const cell = document.createElement('div');
    const classes = ['pc-day'];
    if (day.isPadding) classes.push('pc-day-padding');
    if (day.isWeekend) classes.push('pc-day-weekend');
    if (day.iso === todayIso) classes.push('pc-day-today');
    if (state.notes[day.iso]) classes.push('pc-day-note-dot');
    cell.className = classes.join(' ');
    cell.textContent = String(day.day);
    cell.addEventListener('click', () => openNoteModal(day.iso));
    return cell;
  }

  // ---------- note modal ----------

  function openNoteModal(iso) {
    state.editingIso = iso;
    renderModal();
  }

  function renderModal() {
    const existing = shadow.querySelector('.pc-modal-backdrop');
    if (existing) existing.remove();
    if (!state.editingIso) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'pc-modal-backdrop';
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    const modal = document.createElement('div');
    modal.className = 'pc-modal';

    const title = document.createElement('div');
    title.className = 'pc-modal-title';
    title.textContent = state.editingIso;
    modal.appendChild(title);

    const textarea = document.createElement('textarea');
    textarea.value = state.notes[state.editingIso] || '';
    textarea.placeholder = 'Add a note for this date…';
    modal.appendChild(textarea);

    const actions = document.createElement('div');
    actions.className = 'pc-modal-actions';
    const deleteBtn = makeButton('Delete', 'Delete note', () => {
      delete state.notes[state.editingIso];
      saveNotes();
      closeModal();
      renderPanel();
    });
    const cancelBtn = makeButton('Cancel', 'Cancel', closeModal);
    const saveBtn = makeButton('Save', 'Save note', () => {
      const text = textarea.value.trim();
      if (text) {
        state.notes[state.editingIso] = text;
      } else {
        delete state.notes[state.editingIso];
      }
      saveNotes();
      closeModal();
      renderPanel();
    });
    actions.appendChild(deleteBtn);
    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    modal.appendChild(actions);

    backdrop.appendChild(modal);
    shadow.appendChild(backdrop);
    textarea.focus();
  }

  function closeModal() {
    state.editingIso = null;
    renderModal();
  }

  // ---------- toolbar icon (FR13) ----------

  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.type === 'PERIOD_CALENDAR_OPEN_EXPANDED') {
      state.dismissed = false;
      state.open = true;
      renderPill();
      renderPanel();
    }
  });

  // ---------- init ----------

  mount();
  loadState(() => {
    applyTheme();
    renderPill();
    renderPanel();
  });

  // Keep the collapsed badge accurate across a midnight rollover.
  setInterval(renderPill, 60 * 1000);
})();
