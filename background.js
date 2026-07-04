chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'PERIOD_CALENDAR_OPEN_EXPANDED' }).catch(() => {
    // No content script in this tab (e.g. chrome:// pages) — nothing to do.
  });
});
