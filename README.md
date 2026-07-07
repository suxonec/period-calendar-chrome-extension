# Period Calendar

A Chrome extension that keeps a year-round 13-period / 4-week calendar visible while you browse. A small pill docked to the bottom-right corner of the page shows today's date and its period/week label; click it to pop up the full year view and jot notes against any date.

![Period Calendar expanded view](assets/screenshot.png)

## Features

- **Always-on corner pill** — shows today's date and period/week label (e.g. "P7W3 · Jul 4") without getting in the way of the page.
- **Full year calendar** — click the pill to expand into all 12 months, with a period/week label per week row.
- **Per-date notes** — click any date to attach a short note, saved locally and available across every tab.
- **Year navigation** — switch years and every label recalculates instantly.
- **Bulk clear** — wipe all notes for the currently displayed year, with a confirmation step.
- **Print support** — print the calendar with the pill and editing controls hidden.
- **Fully offline** — no network calls, no accounts, no analytics. Everything is stored locally via `chrome.storage.local`.

## The period/week system

- The year is divided into **13 periods**, normally **4 weeks** each (52 weeks/year) — except in a leap-week year, where Period 13 grows to **5 weeks** (53 weeks/year).
- Weeks run **Sunday → Saturday**, labeled `P{period}W{week}` (e.g. `P1W1`, `P11W3`, or `P13W5` in a leap-week year).
- Fiscal year 2000 is anchored to **Sunday, 2000-01-02**; every later year's `P1W1` starts the day after the previous year ends — so cycles chain continuously rather than resetting each January 1.
- A year gets a leap week (5th week in Period 13) when fewer than 5 calendar days would otherwise remain until December 31 — roughly every 5–6 years (2004, 2009, 2015, 2020, 2026, 2032, 2037, 2043, …).

Full details are in [period-calendar-requirements.md](period-calendar-requirements.md).

## Installing

**From the Chrome Web Store:** [Period Calendar on the Chrome Web Store](https://chromewebstore.google.com/detail/kcfcdcconjgicnblbbmfcimojcdhiggn) — click **Add to Chrome**.

**From source (for development):**

1. Clone this repo.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select this repository's folder.

## Privacy

Period Calendar makes no network requests and stores everything (notes, last-viewed year) locally in your browser. See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.

## Development

See [CLAUDE.md](CLAUDE.md) for the architecture and internals (shadow-DOM content script, storage schema, period/week calculation).
