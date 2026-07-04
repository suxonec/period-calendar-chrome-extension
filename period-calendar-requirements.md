# Requirements: Period Calendar — Chrome Extension

## 1. Purpose

A Chrome extension that keeps a year-round period calendar visible while browsing, and lets the user jot short notes against individual dates. Delivered as a slim, always-present bar docked to the bottom of the browser viewport, expandable into a full calendar view on demand — rather than a separate file the user has to open.

## 2. Business Rules (Period Calendar Logic — unchanged)

- **BR1.** The year is divided into **13 periods**, each containing exactly **4 weeks** (52 weeks/year total).
- **BR2.** Each week runs **Sunday → Saturday**.
- **BR3.** A week's label format is **P{period}W{week}** (e.g., `P1W1`, `P11W3`), where period = 1–13 and week = 1–4.
- **BR4.** For any given year Y, the cycle's first week (P1W1) starts on **the Sunday on or before January 1 of year Y**. This means P1W1 can fall in late December of the prior year.
- **BR5.** The period/week calculation is per calendar year — each year's cycle is computed independently using BR4; periods do not continue counting across a year boundary.
- **BR6.** Edge case: trailing days (0–6) at year-end that fall outside both years' 52-week cycles must be shown **without a label** rather than forced into an adjacent period/week.

## 3. Functional Requirements

### Must-Have
- **FR1 — Docked bottom bar.** A slim, fixed-position bar appears docked to the bottom of every browser tab/webpage, always visible while browsing.
- **FR2 — Collapsed-state content.** In its collapsed state, the bar shows at minimum: today's date and its current period/week label (e.g., "Jul 4 · P11W1").
- **FR3 — Expand to full calendar.** Clicking the bar expands it into the full year calendar view (all 12 months, weekday columns, period/week column per BR1–BR6), as previously built. Clicking again (or a close control) collapses it back to the bar.
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
- Publishing to the Chrome Web Store (assume for now this is a personal/unpacked "Developer Mode" install unless the user asks otherwise).

## 6. Open Questions

- **Permission scope:** does the bar need to appear on *all* websites, or only a defined subset (e.g., excluding banking sites or sites where an overlay could interfere)? Affects the `content_scripts` match pattern and how much permission the extension needs to request. *(Owner: Evgeny)*
- **BR6 handling (edge-case gap days):** currently resolved as "show no label." Confirm this remains desired behavior. *(Owner: Evgeny)*
- **Distribution:** load as an unpacked extension (developer mode, no review process, easiest to iterate) vs. eventually publish privately/unlisted on the Chrome Web Store? *(Owner: Evgeny)*
- **Sync vs. local-only storage (FR16):** worth the added complexity and quota constraints, or is single-machine use sufficient for now? *(Owner: Evgeny)*
