function initTab() {
  chrome.runtime.sendMessage({ type: 'initTab' });
}

function sendURL() {
  chrome.runtime.sendMessage({
    type: 'sendURL',
    data: window.location.href,
  });
}

// Remove information about scripts on the previous page when the user navigates elsewhere.
initTab();
// Update page with the new URL
sendURL();
