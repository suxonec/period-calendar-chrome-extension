# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project State

Implemented: plain (no build step) Manifest V3 extension. Load unpacked via `chrome://extensions` → Developer mode → "Load unpacked" → select this directory.

There is no bundler/transpiler — all files are loaded as-is by Chrome. There's also no test runner; `shared/period-calendar.js` is verified ad hoc with `node -e` snippets (see below) since it has no `chrome.*` dependency.

## What This Is

A Chrome extension implementing a "period calendar" — a custom 13-period/4-week calendar system, always available while browsing, with per-date freeform notes stored via `chrome.storage.local`. Fully offline, no network calls, no backend.

Full requirements, functional/non-functional requirements, and open questions are in [period-calendar-requirements.md](period-calendar-requirements.md). Read it before changing scope — it's the source of truth for Must/Should/Could-Have priority and explicitly lists out-of-scope items (no Firefox/Safari support, no localization, no Chrome Web Store publishing for now).

**Deviation from the written FR1:** the requirements describe a full-width slim bar docked to the bottom of the viewport. Per direct user instruction, the collapsed state was instead implemented as a small pill anchored to the bottom-**right** corner (styled after a browser extension that shows multiple timezone clocks in that same corner). Clicking the pill pops up the full year grid as a floating panel anchored above it, rather than a full-width expansion. If the written requirements doc is ever revised, reconcile FR1/FR3's wording with this corner-pill behavior.

**Known discrepancy, resolved:** FR2's example ("Jul 4 · P11W1") does not match what BR1–BR6 literally compute for that date (they yield P7W3) — confirmed with the user that BR1–BR6 as written are authoritative and the example text is stale/illustrative. Trust the business rules over that example if it's ever edited.

## Architecture

- [manifest.json](manifest.json) — MV3 manifest. `permissions: ["storage"]` only; content script matches `<all_urls>` (deliberate choice — user opted for broad injection over a restricted allowlist, see NFR2 in the requirements for the trade-off).
- [background.js](background.js) — service worker. Only job: on toolbar-icon click (`chrome.action.onClicked`), message the active tab's content script to force-open the expanded panel (FR13).
- [shared/period-calendar.js](shared/period-calendar.js) — pure date logic, no DOM/`chrome.*` calls. Exposes `window.PeriodCalendar` (`getYearCycleStart`, `getWeekLabel`, `getWeekLabelForDate`, `buildYearGrid`, `toISODate`, `computeFiscalYear`). This is the BR1–BR7 implementation and the only place that math should live.
- [content/styles.js](content/styles.js) — sets `window.PERIOD_CALENDAR_CSS` (a template string). Kept separate from content.js purely so the stylesheet is easy to skim on its own; injected into the shadow root's `<style>` tag rather than declared in the manifest's content-script `css` array, so it never touches the host page's DOM (NFR3 isolation).
- [content/content.js](content/content.js) — everything else: builds the closed shadow-DOM host, renders the pill and the expanded panel, owns all UI state (`year`, `notes`, `open`, `dismissed`, `editingIso`, `theme`), wires events, and talks to `chrome.storage.local`.
- [icons/](icons/) — `icon.svg` is the source (rasterized with `sips -s format png`, no other image tooling available in this environment); `icon{16,32,48,128}.png` are generated and referenced from `manifest.json`. Regenerate all four sizes if `icon.svg` changes — don't hand-edit the PNGs.
- [dist/](dist/) — packaging output, not source. `period-calendar.zip` is the upload artifact for the Chrome Web Store Developer Dashboard (rebuild with `zip -r dist/period-calendar.zip manifest.json background.js shared content icons -x "icons/icon.svg" -x "*.DS_Store"` after any change). `store-listing.md` is the reference text for the dashboard's listing/privacy-practices fields. Visibility is intended as **Unlisted** (shareable via link, not publicly searchable) — the user asked for "shareable," not fully public.

Content scripts are loaded as three plain (non-module) scripts in manifest order — `period-calendar.js` → `styles.js` → `content.js` — sharing one global scope per tab, not ES modules. Keep new shared code attached to `window.*` rather than introducing `import`/`export`, or the manifest's script-order loading breaks.

### State and storage

Two `chrome.storage.local` keys, both read once at startup in `content.js`'s `loadState()`:
- `periodCalendar.lastYear` — last-viewed year (FR8/FR4), written on every year-nav click.
- `periodCalendar.notes` — a single flat object `{ "YYYY-MM-DD": "note text" }` covering all years. FR14's "clear notes for the current year" filters this object by ISO-date prefix rather than using per-year keys.
- `periodCalendar.theme` — `'dark'` (default) or `'light'`, toggled from the header button. Applied by toggling a `pc-theme-light` class on the shadow host, which flips a block of CSS custom properties defined on `:host`/`:host(.pc-theme-light)` in [content/styles.js](content/styles.js) — add new colors as variables there rather than hard-coded hex values, or they won't respond to the toggle.

`dismissed` (FR12, session-only hide) and `open`/`editingIso` are in-memory only in `content.js` — never persisted, so they reset naturally on page navigation since the content script re-injects fresh per page load.

### Period/week calculation (the trickiest part — read before touching it)

This is a **sequential fiscal-year model** ("Mars calendar"), not independent per-calendar-year cycles — see BR1–BR7 in [period-calendar-requirements.md](period-calendar-requirements.md) for the authoritative rules. Summary:

- **13 periods/year, 4 weeks/period normally (52 weeks/364 days total)** — except in a leap-week year, where Period 13 grows to 5 weeks (53 weeks/371 days). Weeks run Sunday → Saturday.
- **Label format:** `P{period}W{week}`, e.g. `P1W1`, `P11W3`, or `P13W5` in a leap-week year.
- **Anchor + chaining (BR4):** fiscal year 2000 starts Sunday 2000-01-02 (`ANCHOR_START`). Every other fiscal year N's start is fiscal year N-1's end + 1 day — `computeFiscalYear(N)` derives this recursively and memoizes it in `fiscalYearCache` (a `Map`), since years are **not** independent. A year becomes a 371-day leap-week year when fewer than 5 calendar days would remain until Dec 31 after a normal 364-day cycle — roughly every 5–6 years (2004, 2009, 2015, 2020, 2026, 2032, 2037, 2043, …).
- **Years before the anchor (2000) fall back to the old independent-per-year rule** (Sunday on/before Jan 1, always 52 weeks, no leap week) — the sequential recurrence has no defined starting point further back.
- **Fiscal year ≠ Gregorian year window (BR5):** because years chain end-to-end, fiscal year Y's boundaries drift a few days from Jan 1–Dec 31 (e.g. fiscal 2004 runs 2003-12-28 to 2005-01-01). `buildYearGrid(year)` still builds the Gregorian year's 12 months and labels every week via `getWeekLabel(sunday, year)` against fiscal year `year`'s own cycle — it never borrows the neighboring fiscal year's cycle for padding cells.
- **`getWeekLabelForDate` resolves the correct fiscal year itself** (via `getFiscalYearForDate`) rather than assuming `date.getFullYear()`, since a date near Dec 31/Jan 1 may belong to the adjacent fiscal year once cycles are chained.
- **Out-of-cycle days (BR7):** `getWeekLabel` returns `null` for any Sunday outside `[fiscalStart(Y), fiscalStart(Y) + weeks*7)`. Callers must handle `null` (no label) — now only occurs for Gregorian-grid padding cells that fall in a neighboring fiscal year, since 364/371-day cycles are exact multiples of 7 (no leftover days within a cycle itself).

## Key Constraints From Requirements

- **Storage:** `chrome.storage.local` only for now (FR8) — `chrome.storage.sync` is a Could-Have (FR16) with a noted trade-off (stricter size quotas), not implemented.
- **Permissions:** content-script matches `<all_urls>` — a deliberate decision (see Architecture above), not an oversight; don't "fix" it back to a restricted pattern without checking with the user first.
- **No network access at all** (FR9/NFR1) — no CDN dependencies, no telemetry, nothing transmitted externally, no reading of page content by the content script. Don't add `fetch`/`XMLHttpRequest` anywhere.
