// Core period/week calculation (BR1-BR6). Loaded before content.js as a plain
// script so both share the page's global scope without a module bundler.
(function (global) {
  const MS_PER_DAY = 86400000;

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // BR4: P1W1 starts on the Sunday on or before Jan 1 of the given year.
  function getYearCycleStart(year) {
    const jan1 = new Date(year, 0, 1);
    return new Date(year, 0, 1 - jan1.getDay());
  }

  // BR3/BR4/BR5/BR6: label for the week starting on `sunday`, evaluated
  // against `year`'s own 52-week cycle. Returns null for out-of-cycle days
  // (BR6 trailing gap) rather than borrowing from an adjacent year.
  function getWeekLabel(sunday, year) {
    const cycleStart = getYearCycleStart(year);
    const days = Math.round((sunday - cycleStart) / MS_PER_DAY);
    if (days < 0 || days > 363) return null;
    const weekIndex = Math.floor(days / 7);
    const period = Math.floor(weekIndex / 4) + 1;
    const week = (weekIndex % 4) + 1;
    return `P${period}W${week}`;
  }

  // Convenience: label for the week containing `date`, using date's own
  // calendar year as the cycle (used for the collapsed "today" badge).
  function getWeekLabelForDate(date) {
    const sunday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
    return getWeekLabel(sunday, date.getFullYear());
  }

  function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // FR3/FR5/FR6: builds all 12 months for `year`, each as a list of
  // Sunday-Saturday week rows with a single period/week label per row
  // (BR3-BR6) and adjacent-month padding days marked for muted styling.
  function buildYearGrid(year) {
    const months = [];
    for (let m = 0; m < 12; m++) {
      const firstOfMonth = new Date(year, m, 1);
      const lastOfMonth = new Date(year, m + 1, 0);
      const gridStart = new Date(year, m, 1 - firstOfMonth.getDay());
      const gridEnd = new Date(year, m, lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

      const weeks = [];
      let cursor = gridStart;
      while (cursor <= gridEnd) {
        const label = getWeekLabel(cursor, year);
        const days = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + i);
          const isPadding = d.getMonth() !== m;
          const dow = d.getDay();
          days.push({
            date: d,
            iso: toISODate(d),
            day: d.getDate(),
            isPadding,
            isWeekend: !isPadding && (dow === 0 || dow === 6),
          });
        }
        weeks.push({ label, days });
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 7);
      }
      months.push({ index: m, name: MONTH_NAMES[m], weeks });
    }
    return months;
  }

  global.PeriodCalendar = {
    MONTH_NAMES,
    getYearCycleStart,
    getWeekLabel,
    getWeekLabelForDate,
    buildYearGrid,
    toISODate,
  };
})(window);
