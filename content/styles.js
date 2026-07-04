// CSS injected into the shadow root (kept separate from content.js so the
// stylesheet is easy to skim/edit on its own).
window.PERIOD_CALENDAR_CSS = `
:host {
  all: initial;

  --pc-bg-panel: #1c1c1e;
  --pc-bg-pill: rgba(28, 28, 30, 0.88);
  --pc-text: #e6e7eb;
  --pc-text-muted: #55565b;
  --pc-weekday-header: #8a8c92;
  --pc-accent: #e0a84a;
  --pc-weekend: #6fb3ff;
  --pc-border: rgba(255, 255, 255, 0.08);
  --pc-btn-bg: rgba(255, 255, 255, 0.06);
  --pc-btn-bg-hover: rgba(255, 255, 255, 0.14);
  --pc-btn-border: rgba(255, 255, 255, 0.1);
  --pc-day-hover: rgba(255, 255, 255, 0.08);
  --pc-modal-bg: #232326;
  --pc-input-bg: #17171a;
  --pc-input-border: rgba(255, 255, 255, 0.12);
  --pc-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

:host(.pc-theme-light) {
  --pc-bg-panel: #ffffff;
  --pc-bg-pill: rgba(255, 255, 255, 0.92);
  --pc-text: #1c1c1e;
  --pc-text-muted: #b3b4b8;
  --pc-weekday-header: #6a6b70;
  --pc-accent: #b5790f;
  --pc-weekend: #1a56db;
  --pc-border: rgba(0, 0, 0, 0.1);
  --pc-btn-bg: rgba(0, 0, 0, 0.05);
  --pc-btn-bg-hover: rgba(0, 0, 0, 0.1);
  --pc-btn-border: rgba(0, 0, 0, 0.14);
  --pc-day-hover: rgba(0, 0, 0, 0.06);
  --pc-modal-bg: #ffffff;
  --pc-input-bg: #f2f2f3;
  --pc-input-border: rgba(0, 0, 0, 0.14);
  --pc-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.pc-root, .pc-root * {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
}

/* ---------- Collapsed pill ---------- */

.pc-pill {
  position: fixed;
  right: 8px;
  bottom: 8px;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--pc-bg-pill);
  color: var(--pc-text);
  border-radius: 5px;
  font-size: 12px;
  line-height: 1.4;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  opacity: 0.72;
  transition: opacity 0.15s ease;
}

.pc-pill:hover {
  opacity: 1;
}

.pc-pill-label {
  color: var(--pc-accent);
  font-weight: 600;
}

.pc-pill-date {
  color: var(--pc-text);
}

.pc-pill-dismiss {
  margin-left: 2px;
  padding: 0 3px;
  color: var(--pc-weekday-header);
  border: none;
  background: transparent;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  border-radius: 3px;
}

.pc-pill-dismiss:hover {
  color: var(--pc-text);
  background: var(--pc-day-hover);
}

/* ---------- Expanded panel ---------- */

.pc-panel {
  position: fixed;
  right: 8px;
  bottom: 44px;
  z-index: 2147483647;
  width: min(880px, calc(100vw - 16px));
  max-height: calc(100vh - 60px);
  background: var(--pc-bg-panel);
  color: var(--pc-text);
  border-radius: 8px;
  box-shadow: var(--pc-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pc-panel-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--pc-border);
  flex: 0 0 auto;
}

.pc-year-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.pc-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.pc-panel-title {
  font-weight: 700;
  font-size: 15px;
}

.pc-btn {
  background: var(--pc-btn-bg);
  color: var(--pc-text);
  border: 1px solid var(--pc-btn-border);
  border-radius: 5px;
  padding: 4px 9px;
  font-size: 12px;
  cursor: pointer;
}

.pc-btn:hover {
  background: var(--pc-btn-bg-hover);
}

.pc-btn-icon {
  padding: 4px 8px;
  font-size: 13px;
}

.pc-panel-body {
  overflow-y: auto;
  padding: 10px 14px 16px;
}

.pc-months {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.pc-month-name {
  font-weight: 700;
  font-size: 13px;
  margin: 0 0 6px 2px;
}

.pc-weekday-row, .pc-week-row {
  display: grid;
  grid-template-columns: 34px repeat(7, 1fr);
  gap: 2px;
  align-items: center;
}

.pc-weekday-row {
  font-size: 10px;
  color: var(--pc-weekday-header);
  margin-bottom: 2px;
}

.pc-weekday-cell {
  text-align: center;
}

.pc-week-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--pc-accent);
  text-align: center;
}

.pc-day {
  position: relative;
  text-align: center;
  font-size: 11px;
  padding: 4px 0;
  border-radius: 4px;
  cursor: pointer;
}

.pc-day:hover {
  background: var(--pc-day-hover);
}

.pc-day-weekend {
  color: var(--pc-weekend);
}

.pc-day-padding {
  color: var(--pc-text-muted);
}

.pc-day-today {
  outline: 1px solid var(--pc-accent);
  font-weight: 700;
}

.pc-day-note-dot::after {
  content: "";
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--pc-accent);
}

/* ---------- Note modal ---------- */

.pc-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc-modal {
  width: min(360px, calc(100vw - 32px));
  background: var(--pc-modal-bg);
  color: var(--pc-text);
  border-radius: 8px;
  padding: 14px;
  box-shadow: var(--pc-shadow);
}

.pc-modal-title {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 8px;
}

.pc-modal textarea {
  width: 100%;
  min-height: 90px;
  resize: vertical;
  background: var(--pc-input-bg);
  color: var(--pc-text);
  border: 1px solid var(--pc-input-border);
  border-radius: 5px;
  padding: 8px;
  font-size: 12px;
  font-family: inherit;
}

.pc-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

/* ---------- Print (FR15) ---------- */

@media print {
  .pc-pill,
  .pc-panel-header,
  .pc-modal-backdrop {
    display: none !important;
  }

  .pc-panel {
    position: static;
    width: auto;
    max-height: none;
    box-shadow: none;
    background: #fff;
    color: #000;
  }

  .pc-panel-body {
    overflow: visible;
  }

  .pc-week-label {
    color: #b5790f;
  }
}
`;
