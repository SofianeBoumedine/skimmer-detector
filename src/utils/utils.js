import { sendMessage, log } from './common';

/**
 * Attempts to identify where a string is base-64 encoded or not.
 * @param string The raw string to be examined.
 * @returns {boolean} Returns true if the string matches a base-64 string. False otherwise.
 */
function _isBase64Encoded(string) {
  return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(string);
}

/**
 * Determines whether one or more elements in needles are present in any of the haystacks.
 * Checks both raw input and base64 encoded versions of the needles.
 * @param needles The array of needles needed to be checked.
 * @param haystacks The array of haystacks in which the needle(s) may reside.
 * @returns {boolean} Whether one or more needles were found in one or more haystacks in either
 * raw or base64 encoded form.
 */
export function atLeastOneNeedleInHaystack(needles, haystacks) {
  if (!needles || !haystacks) {
    return false;
  }
  return haystacks.some(haystackElem => needles.some((needle) => {
    if (_isBase64Encoded(haystackElem)) {
      if (atob(haystackElem).indexOf(needle) !== -1) {
        return true;
      }
    }
    return haystackElem.indexOf(needle) !== -1;
  }));
}

export function sendAnnouncement(tabId, message) {
  sendMessage('sendAnnouncement', { message }, tabId);
}

// Adapted from https://github.com/ghostery/ghostery-extension/blob/master/src/utils/utils.js
export function fetchLocalJSONResource(url) {
  return fetch(url).then((response) => {
    if (!response.ok) {
      return Promise.reject(new Error(`Failed to fetchLocalJSONResource ${url} with status ${response.status} (${response.statusText})`));
    }
    return response.json();
  }).catch((err) => {
    log(`fetchLocalJSONResource error: ${err}`);
    return Promise.reject(new Error(err));
  });
}
