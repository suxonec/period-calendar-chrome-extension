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
- [shared/period-calendar.js](shared/period-calendar.js) — pure date logic, no DOM/`chrome.*` calls. Exposes `window.PeriodCalendar` (`getYearCycleStart`, `getWeekLabel`, `getWeekLabelForDate`, `buildYearGrid`, `toISODate`). This is the BR1–BR6 implementation and the only place that math should live.
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

- **13 periods/year, 4 weeks/period, 52 weeks/year total.** Weeks run Sunday → Saturday.
- **Label format:** `P{period}W{week}`, e.g. `P1W1`, `P11W3` (period 1–13, week 1–4).
- **Year anchor (BR4):** for year Y, `getYearCycleStart(Y)` = the Sunday on or before Jan 1 of Y — can fall in late December of Y-1.
- **Cycles don't span years (BR5):** every displayed date in year Y's grid — including adjacent-month padding cells — gets its label from `getWeekLabel(sunday, Y)`, i.e. always Y's own cycle, never Y-1's or Y+1's. `buildYearGrid` relies on this: it never switches cycle year mid-grid, even for December's trailing padding days that are chronologically in January of Y+1.
- **Trailing gap days (BR6):** `getWeekLabel` returns `null` for any Sunday outside `[cycleStart(Y), cycleStart(Y)+363]`. Callers must handle `null` (no label), not treat it as an error — confirmed 52 unique labels and a handful of expected `null`s at each year's tail when testing `buildYearGrid`.

## Key Constraints From Requirements

- **Storage:** `chrome.storage.local` only for now (FR8) — `chrome.storage.sync` is a Could-Have (FR16) with a noted trade-off (stricter size quotas), not implemented.
- **Permissions:** content-script matches `<all_urls>` — a deliberate decision (see Architecture above), not an oversight; don't "fix" it back to a restricted pattern without checking with the user first.
- **No network access at all** (FR9/NFR1) — no CDN dependencies, no telemetry, nothing transmitted externally, no reading of page content by the content script. Don't add `fetch`/`XMLHttpRequest` anywhere.
