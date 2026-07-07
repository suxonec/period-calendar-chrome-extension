# Requirements: Period Calendar — Chrome Extension

## 1. Purpose

A Chrome extension that keeps a year-round period calendar visible while browsing, and lets the user jot short notes against individual dates. Delivered as a slim, always-present bar docked to the bottom of the browser viewport, expandable into a full calendar view on demand — rather than a separate file the user has to open.

## 2. Business Rules (Period Calendar Logic — "Mars calendar" fiscal-year model)

- **BR1.** The year is divided into **13 periods** of **4 weeks** each (52 weeks/year, 364 days) — **except** in a leap-week year (see BR6), where Period 13 grows to **5 weeks** (35 days), making the year 53 weeks/371 days.
- **BR2.** Each week runs **Sunday → Saturday**.
- **BR3.** A week's label format is **P{period}W{week}** (e.g., `P1W1`, `P11W3`, or `P13W5` in a leap-week year), where period = 1–13 and week = 1–4 (1–5 for Period 13 in a leap-week year).
- **BR4.** Fiscal year 2000 is anchored to **Sunday 2000-01-02**. Every other fiscal year N is computed **sequentially from year N-1** (not independently):
  1. `start[N] = end[N-1] + 1 day`
  2. `nominal_end[N] = start[N] + 363 days` (the 52-week/364-day end)
  3. `remaining_days[N] = Dec 31 of year N − nominal_end[N]`
  4. `leap[N] = remaining_days[N] >= 5`
  5. `end[N] = nominal_end[N] + 7 days` if `leap[N]`, else `nominal_end[N]`
  6. `year_length[N] = end[N] − start[N] + 1`, always 364 or 371 days
- **BR5.** Because fiscal years chain end-to-end (BR4.1), a fiscal year's boundary drifts a few days from the matching Gregorian year — e.g. fiscal year 2004 runs 2003-12-28 to 2005-01-01. The expanded calendar view for "year Y" shows fiscal year Y's cycle (the one anchored near Jan 1 of Y), not a strict Jan 1–Dec 31 window.
- **BR6.** Leap-week years occur when fewer than 5 calendar days would remain until Dec 31 (BR4.4) — roughly every 5–6 years, coinciding with ISO 53-week years (2004, 2009, 2015, 2020, 2026, 2032, 2037, 2043, …). In those years only, Period 13 has a 5th week (`P13W5`) instead of ending at `P13W4`.
- **BR7.** Edge case: because BR4's chaining leaves no gap between consecutive fiscal years, unlabeled days only occur in the expanded grid's adjacent-month padding cells that fall in a neighboring fiscal year — shown **without a label** rather than borrowing that year's cycle. The sequential recurrence (BR4) is anchored at fiscal year 2000 and has no defined starting point before it; years before 2000 fall back to an independent 52-week-only cycle (the pre-leap-week BR4 rule: Sunday on/before Jan 1, no leap week).

## 3. Functional Requirements

### Must-Have
- **FR1 — Docked bottom bar.** A slim, fixed-position bar appears docked to the bottom of every browser tab/webpage, always visible while browsing.
- **FR2 — Collapsed-state content.** In its collapsed state, the bar shows at minimum: today's date and its current period/week label (e.g., "Jul 4 · P11W1").
- **FR3 — Expand to full calendar.** Clicking the bar expands it into the full year calendar view (all 12 months, weekday columns, period/week column per BR1–BR7), as previously built. Clicking again (or a close control) collapses it back to the bar.
- **FR4 — Year navigation.** Within the expanded view, the user can switch the displayed year, with the calendar and all period/week labels recalculating immediately.
- **FR5 — Adjacent-month padding.** Each month's first/last displayed weeks may include muted dates from the previous/next month to complete a 7-day week.
- **FR6 — Weekend highlighting.** Sunday and Saturday date numbers are visually distinguished from weekdays; padded (adjacent-month) dates stay muted regardless of weekday.
- **FR7 — Per-date notes.** Each date supports a short freeform text note, editable directly in the expanded calendar view.
- **FR8 — Persistent storage across the browser.** Notes and the last-viewed year persist using the extension's own storage (`chrome.storage.local`), so they're available consistently across tabs and browser restarts — not per-page/per-site.
- **FR9 — Fully offline operation.** The extension makes no network calls; all logic and assets are bundled locally (Manifest V3 service worker + content script, no CDN dependencies).
- **FR10 — Non-intrusive overlay.** The bar and expanded view must not block page interaction when collapsed, and must sit above normal page content (z-index) without breaking the layout of the underlying page.

### Should-Have
- **FR11 — Today indicator.** Visually highlight the current date in the expanded view.
- **FR12 — Collapse/dismiss for the session.** Allow the user to temporarily hide the bar on a given tab without uninstalling the extension (re-appears on next navigation or via toolbar icon).
- **FR13 — Toolbar icon fallback.** Clicking the extension's toolbar icon also opens the expanded calendar view directly, as an alternative to clicking the docked bar.
- **FR14 — Bulk clear.** Allow the user to clear all saved notes for the currently displayed year, with a confirmation step.
- **FR15 — Print support.** Provide a way to print the expanded calendar with the bar/editing controls hidden.

### Could-Have
- **FR16 — Cross-device sync.** Use `chrome.storage.sync` instead of/alongside `chrome.storage.local` so notes follow the user across machines signed into the same Chrome profile. *(Trade-off: sync storage has stricter size quotas than local storage.)*
- **FR17 — Per-site opt-out.** Let the user disable the bar on specific sites (e.g., full-screen apps, video sites) via the extension's settings.
- **FR18 — Export/import of notes** to a file for backup or migration.
- **FR19 — Configurable week-start day or period structure**, if the fiscal convention changes.

## 4. Non-Functional Requirements

- **NFR1 — Privacy.** All note data stays local to the browser profile (`chrome.storage`); nothing is transmitted externally. No page content is read or transmitted by the content script.
- **NFR2 — Minimal permissions.** Request only the Chrome permissions actually needed (`storage`, and a content-script match pattern for injecting the bar). Avoid broad permissions (e.g., `<all_urls>` host access) beyond what's required to inject the bar; document clearly why the permission is needed, since "runs on every page" is a meaningful permission to ask users to grant.
- **NFR3 — Performance.** The injected bar must have negligible impact on page load time and must not interfere with the host page's own scripts or styles (isolated CSS/shadow DOM recommended).
- **NFR4 — Manifest V3 compliance.** Built to current Chrome Web Store requirements (Manifest V3), since Manifest V2 extensions are no longer supported/installable.
- **NFR5 — Visual consistency.** The expanded calendar retains the existing clean, professional look (bold month headers, clear grid, amber period/week labels) already established in the HTML prototype; the collapsed bar should be visually unobtrusive (compact height, low-contrast until hovered/expanded).

## 5. Out of Scope

- Native macOS packaging (Dock app, desktop widget) — superseded by this Chrome extension as the primary distribution mechanism.
- Multi-browser support (Firefox/Edge/Safari extension equivalents) — Chrome/Chromium only for this version.
- Localization/multi-language support.
- Integration with external calendars (Google Calendar, Outlook, etc.).

## 6. Open Questions

- **Permission scope:** does the bar need to appear on *all* websites, or only a defined subset (e.g., excluding banking sites or sites where an overlay could interfere)? Affects the `content_scripts` match pattern and how much permission the extension needs to request. *(Owner: Evgeny)*
- **BR7 handling (edge-case gap days / pre-2000 years):** currently resolved as "show no label" for adjacent-fiscal-year padding cells, and an independent legacy 52-week cycle for years before the fiscal anchor (2000). Confirm this remains desired behavior. *(Owner: Evgeny)*
- **Sync vs. local-only storage (FR16):** worth the added complexity and quota constraints, or is single-machine use sufficient for now? *(Owner: Evgeny)*
