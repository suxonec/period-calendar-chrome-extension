# Privacy Policy — Period Calendar

**Effective date:** July 5, 2026

Period Calendar is a Chrome extension that displays a 13-period / 4-week calendar and lets you attach short notes to individual dates. This policy explains what data the extension handles.

## Data collection

Period Calendar does not collect, transmit, or sell any data. It makes no network requests of any kind.

The only data it stores is:
- **Notes** you write against specific dates.
- **The last year you viewed** in the expanded calendar.

Both are stored using Chrome's built-in `chrome.storage.local` API, entirely on your own device. This data is never sent to the developer, to any third party, or to any external server — the extension has no backend.

## Permissions

- **`storage`** — used only to save your notes and last-viewed year locally, so they persist across browser tabs and restarts.
- **Host permission (all sites)** — the calendar overlay is injected as a content script on web pages so it's available regardless of which site you're browsing. The content script does not read, modify, or transmit any content from the pages you visit.

## Third parties

Period Calendar includes no analytics, advertising, or tracking code, and shares data with no third parties, because it collects none.

## Children's privacy

Period Calendar is not directed at children and does not knowingly collect any data from anyone, including children.

## Changes to this policy

Any future changes to this policy will be posted in this file, in this repository, with an updated effective date.

## Contact

Questions about this policy can be filed as an issue at:
https://github.com/suxonec/period-calendar-chrome-extension/issues
