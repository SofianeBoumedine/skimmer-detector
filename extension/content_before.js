function clearScriptContent() {
  chrome.runtime.sendMessage({ type: 'clearScriptContent' });
}

clearScriptContent();
