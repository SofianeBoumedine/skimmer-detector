function initTab() {
  chrome.runtime.sendMessage({ type: 'initTab' });
}

// Remove information about scripts on the previous page when the user navigates elsewhere.
initTab();
