function clearScriptContent() {
  chrome.runtime.sendMessage({ type: 'clearScriptContent' });
}

// Remove information about scripts on the previous page when the user navigates elsewhere.
clearScriptContent();
