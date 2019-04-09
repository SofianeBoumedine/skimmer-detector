const LOG = chrome.runtime.getManifest().log || false;

export function log(...messages) { // eslint-disable-line import/prefer-default-export
  if (!LOG) {
    return false;
  }
  console.log(`[SkimmerDetector @ ${(new Date()).toLocaleTimeString()}]`, ...messages); // eslint-disable-line no-console
  return true;
}

export function sendMessage(type, data, tabId) {
  if (tabId) {
    log(`Sending message type ${type} to tab ${tabId}...`);
    chrome.tabs.sendMessage(tabId, { type, data });
  } else {
    log(`Sending message type ${type} to background...`);
    chrome.runtime.sendMessage({ type, data });
  }
}
