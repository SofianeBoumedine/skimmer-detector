const LOG = chrome.runtime.getManifest().log || false;

export function log(...messages) { // eslint-disable-line import/prefer-default-export
  if (!LOG) {
    return false;
  }

  console.log('[SkimmerDetector] ', ...messages); // eslint-disable-line no-console
  return true;
}
