const LOG = chrome.runtime.getManifest().log || false;

export function log(...messages) { // eslint-disable-line import/prefer-default-export
  if (!LOG) {
    return false;
  }

  console.log('[SkimmerDetector] ', ...messages); // eslint-disable-line no-console
  return true;
}

export function sendMessage(type, data, tabId) {
  if (tabId) {
    log(`Sending message to tab ${tabId}...`);
    chrome.tabs.sendMessage(tabId, { type, data });
  } else {
    log('Sending message to background...');
    chrome.runtime.sendMessage({ type, data });
  }
}
