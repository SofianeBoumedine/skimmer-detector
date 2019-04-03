import tabData from './classes/TabData';
import { log } from './utils/common';

const MIN_INPUT_SIZE = 3;

function sendAnnouncement(tabId, message) {
  chrome.tabs.sendMessage(tabId, {
    type: 'sendAnnouncement',
    data: message,
  });
}


/**
 * Attempts to identify where a string is base-64 encoded or not.
 * @param string The raw string to be examined.
 * @returns {boolean} Returns true if the string matches a base-64 string. False otherwise.
 */
function isBase64Encoded(string) {
  return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(string);
}

// function getFilename(url) {
//   return url.split('/').pop().split('#')[0].split('?')[0];
// }

/**
 * Determines whether one or more elements in needles are present in any of the haystacks.
 * Checks both raw input and base64 encoded versions of the needles.
 * @param needles The array of needles needed to be checked.
 * @param haystacks The array of haystacks in which the needle(s) may reside.
 * @returns {boolean} Whether one or more needles were found in one or more haystacks in either
 * raw or base64 encoded form.
 */
function atLeastOneNeedleInHaystack(needles, haystacks) {
  if (!needles || !haystacks) {
    return false;
  }
  return haystacks.some(haystackElem => needles.some((needle) => {
    if (isBase64Encoded(haystackElem)) {
      if (atob(haystackElem).indexOf(needle) !== -1) {
        return true;
      }
    }
    return haystackElem.indexOf(needle) !== -1;
  }));
}

function containsInputsInURL(inputs, url) {
  return atLeastOneNeedleInHaystack(inputs.map(input => input.value),
    [...new URL(url).searchParams.values()]);
}

function containsInputsInPostData(inputs, requestBody) {
  if (requestBody.raw) {
    return atLeastOneNeedleInHaystack(inputs.map(input => input.value),
      [decodeURIComponent(String.fromCharCode.apply(null,
        new Uint8Array(requestBody.raw[0].bytes)))]);
  }
  if (requestBody.formData) {
    return atLeastOneNeedleInHaystack(inputs.map(input => input.value),
      Object.values(requestBody.formData).flat());
  }
  return false;
}

function compareScriptContent(tabId, src, content) {
  const xhr = new XMLHttpRequest();
  xhr.open('get', src, true);
  xhr.send();

  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.DONE && content !== xhr.response) {
      if (tabData.get(tabId, 'mismatchingScripts').indexOf(src) === -1) {
        tabData.set(tabId, 'mismatchingScripts',
          [...tabData.get(tabId, 'mismatchingScripts'), src]);
      }
    }
  };
}

chrome.runtime.onMessage.addListener(
  (request, sender) => {
    switch (request.type) {
      case 'sendInputValues':
        tabData.set(sender.tab.id, 'inputs',
          request.data.filter(input => input.value.length > MIN_INPUT_SIZE));
        break;
      case 'sendURL':
        tabData.set(sender.tab.id, 'url', request.data);
        break;
      case 'sendScriptContent':
        compareScriptContent(sender.tab.id, request.data.src, request.data.content);
        break;
      default:
        log(`Unknown message: ${request.type}`);
    }
  },
);

chrome.webRequest.onBeforeRequest.addListener(({
  tabId,
  initiator,
  url,
  requestBody,
  type,
}) => {
  // Whitelist all requests from non-tab pages or this extension
  if (tabId <= 0 || initiator === `chrome-extension://${chrome.runtime.id}`) {
    return { cancel: false };
  }

  if (!tabData.get(tabId)) {
    log(`Tab ${tabId} doesn't exist.`);
    if (type === 'main_frame') {
      log(`Tab ${tabId} is a main frame. Creating...`);
      tabData.create(tabId, url);
    } else {
      tabData.create(tabId);
    }
  }

  // Whitelist all requests going to the same hostname or requests from extensions
  if (tabData.get(tabId, 'url')
    && new URL(url).hostname === new URL(tabData.get(tabId, 'url')).hostname) {
    return { cancel: false };
  }

  chrome.tabs.sendMessage(tabId, {
    type: 'requestScriptContent',
    data: { url },
  });

  if (containsInputsInURL(tabData.get(tabId, 'inputs'), url)) {
    sendAnnouncement(tabId, 'Request cancelled because user credentials were detected.');
    return { cancel: true };
  }

  if (requestBody && containsInputsInPostData(tabData.get(tabId, 'inputs'), requestBody)) {
    sendAnnouncement(tabId, 'Request cancelled because user credentials were detected.');
    return { cancel: true };
  }

  if (tabData.get(tabId, 'mismatchingScripts').map(u => new URL(u).hostname)
    .indexOf(new URL(url).hostname) !== -1) {
    sendAnnouncement(tabId, 'Request cancelled because user credentials were detected.');
    return { cancel: true };
  }

  return { cancel: false };
},
{
  urls: ['<all_urls>'],
  types: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object',
    'xmlhttprequest', 'ping', 'media', 'websocket', 'other'],
},
['blocking', 'requestBody']);

// TODO Move this to use webNavigation
// Update tab dictionary on creation & destruction
// chrome.tabs.onCreated.addListener(({ id }) => {
//   tabData.create(id, '');
// });
chrome.tabs.onRemoved.addListener(tabId => tabData.remove(tabId));
