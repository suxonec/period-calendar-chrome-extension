// Core period/week calculation (BR1-BR6). Loaded before content.js as a plain
// script so both share the page's global scope without a module bundler.
(function (global) {
  const MS_PER_DAY = 86400000;

  // BR4: fiscal year 2000 is anchored to this fixed Sunday. Every later (or
  // earlier) fiscal year's boundaries are derived from this single point via
  // the sequential recurrence in computeFiscalYear — years are NOT computed
  // independently of one another (unlike the pre-leap-week implementation).
  const ANCHOR_YEAR = 2000;
  const ANCHOR_START = new Date(2000, 0, 2);

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  function daysBetween(a, b) {
    return Math.round((a - b) / MS_PER_DAY);
  }

  // BR4/leap-week rule: fiscal year N's start is fiscal year N-1's end + 1
  // day (chained, no gaps/overlaps). Length is 364 days (52 weeks) unless
  // fewer than 5 calendar days would remain until Dec 31 of year N, in which
  // case a 5th week is appended to Period 13, making the year 371 days (53
  // weeks). Cached per year since each year depends on the previous one.
  const fiscalYearCache = new Map();

  function computeFiscalYear(year) {
    if (fiscalYearCache.has(year)) return fiscalYearCache.get(year);

    let bounds;
    if (year === ANCHOR_YEAR) {
      bounds = finishFiscalYear(ANCHOR_START, year);
    } else if (year > ANCHOR_YEAR) {
      const prev = computeFiscalYear(year - 1);
      bounds = finishFiscalYear(addDays(prev.end, 1), year);
    } else {
      // The sequential recurrence has no defined starting point before the
      // anchor year, so years before 2000 fall back to an independent
      // 52-week cycle (BR4's old on-or-before-Jan-1 rule, no leap week).
      const jan1 = new Date(year, 0, 1);
      bounds = finishFiscalYear(new Date(year, 0, 1 - jan1.getDay()), year, true);
    }

    fiscalYearCache.set(year, bounds);
    return bounds;
  }

  function finishFiscalYear(start, year, forceNoLeap) {
    const nominalEnd = addDays(start, 363);
    const yearEndRef = new Date(year, 11, 31);
    const remainingDays = daysBetween(yearEndRef, nominalEnd);
    const leap = !forceNoLeap && remainingDays >= 5;
    const end = leap ? addDays(nominalEnd, 7) : nominalEnd;
    return { start, end, leap, weeks: leap ? 53 : 52 };
  }

  // BR4: P1W1 starts on fiscal year `year`'s computed start date.
  function getYearCycleStart(year) {
    return computeFiscalYear(year).start;
  }

  // BR3/BR4/BR5/BR6: label for the week starting on `sunday`, evaluated
  // against `year`'s own fiscal cycle. Returns null for days outside that
  // cycle (e.g. Gregorian-grid padding cells belonging to the adjacent
  // fiscal year) rather than borrowing from it.
  function getWeekLabel(sunday, year) {
    const bounds = computeFiscalYear(year);
    const days = daysBetween(sunday, bounds.start);
    if (days < 0 || days >= bounds.weeks * 7) return null;
    const weekIndex = Math.floor(days / 7);
    // Periods 1-12 are always 4 weeks (weekIndex 0-47). Period 13 absorbs
    // the leap week, growing from 4 to 5 weeks (weekIndex 48-51, or 48-52
    // in a leap year) instead of the normal 4-week span.
    let period;
    let week;
    if (weekIndex < 48) {
      period = Math.floor(weekIndex / 4) + 1;
      week = (weekIndex % 4) + 1;
    } else {
      period = 13;
      week = weekIndex - 48 + 1;
    }
    return `P${period}W${week}`;
  }

  // Finds the fiscal year whose [start, end] cycle contains `date`. Needed
  // because a fiscal year's boundaries drift a few days from the matching
  // Gregorian year (e.g. fiscal 2004 runs 2003-12-28 to 2005-01-01), so
  // `date`'s own calendar year is only a starting guess, not the answer.
  function getFiscalYearForDate(date) {
    let year = date.getFullYear();
    for (let i = 0; i < 3; i++) {
      const bounds = computeFiscalYear(year);
      if (date < bounds.start) {
        year -= 1;
      } else if (date > bounds.end) {
        year += 1;
      } else {
        return year;
      }
    }
    return date.getFullYear();
  }

  // Convenience: label for the week containing `date` (used for the
  // collapsed "today" badge).
  function getWeekLabelForDate(date) {
    const sunday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
    const year = getFiscalYearForDate(sunday);
    return getWeekLabel(sunday, year);
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
    computeFiscalYear,
  };
})(window);
