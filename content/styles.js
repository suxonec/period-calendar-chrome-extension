// CSS injected into the shadow root (kept separate from content.js so the
// stylesheet is easy to skim/edit on its own).
window.PERIOD_CALENDAR_CSS = `
:host {
  all: initial;
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
  background: rgba(28, 28, 30, 0.88);
  color: #d8dadf;
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
  color: #e0a84a;
  font-weight: 600;
}

.pc-pill-date {
  color: #d8dadf;
}

.pc-pill-dismiss {
  margin-left: 2px;
  padding: 0 3px;
  color: #9a9ca3;
  border: none;
  background: transparent;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  border-radius: 3px;
}

.pc-pill-dismiss:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
}

/* ---------- Expanded panel ---------- */

.pc-panel {
  position: fixed;
  right: 8px;
  bottom: 44px;
  z-index: 2147483647;
  width: min(880px, calc(100vw - 16px));
  max-height: calc(100vh - 60px);
  background: #1c1c1e;
  color: #e6e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pc-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex: 0 0 auto;
}

.pc-panel-title {
  font-weight: 700;
  font-size: 15px;
  margin-right: auto;
}

.pc-btn {
  background: rgba(255, 255, 255, 0.06);
  color: #e6e7eb;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 4px 9px;
  font-size: 12px;
  cursor: pointer;
}

.pc-btn:hover {
  background: rgba(255, 255, 255, 0.14);
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
  color: #8a8c92;
  margin-bottom: 2px;
}

.pc-weekday-cell {
  text-align: center;
}

.pc-week-label {
  font-size: 10px;
  font-weight: 700;
  color: #e0a84a;
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
  background: rgba(255, 255, 255, 0.08);
}

.pc-day-weekend {
  color: #6fb3ff;
}

.pc-day-padding {
  color: #55565b;
}

.pc-day-today {
  outline: 1px solid #e0a84a;
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
  background: #e0a84a;
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
  background: #232326;
  color: #e6e7eb;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
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
  background: #17171a;
  color: #e6e7eb;
  border: 1px solid rgba(255, 255, 255, 0.12);
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
