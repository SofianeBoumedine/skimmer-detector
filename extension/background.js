const MIN_INPUT_SIZE = 3;
/* tabId: {
 *   inputs: [{id: string, name: string, value: string}]
 *   url: string
 *   mismatchingScripts: [string]
 * }
 */
const tabData = {};

function initTabData(tabId) {
  tabData[tabId] = {
    inputs: [],
    url: '',
    mismatchingScripts: [],
  };
}

function safeUpdateTabData(tabId, data) {
  if (!tabData[tabId]) {
    initTabData(tabId);
  }
  tabData[tabId] = {
    ...tabData[tabId],
    ...data,
  };
}

function safeGetTabData(tabId, field) {
  if (!tabData[tabId]) {
    initTabData(tabId);
  }
  return tabData[tabId][field];
}

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

  xhr.onreadystatechange = function () {
    if (this.readyState === this.DONE && content !== xhr.response) {
      if (safeGetTabData(tabId, 'mismatchingScripts').indexOf(src) === -1) {
        safeUpdateTabData(tabId, {
          mismatchingScripts: [...safeGetTabData(tabId, 'mismatchingScripts'), src],
        });
      }
    }
  };
}

chrome.runtime.onMessage.addListener(
  (request, sender) => {
    switch (request.type) {
      case 'sendInputValues':
        safeUpdateTabData(sender.tab.id, {
          inputs: request.data.filter(input => input.value.length > MIN_INPUT_SIZE),
        });
        break;
      case 'sendURL':
        safeUpdateTabData(sender.tab.id, { url: request.data });
        break;
      case 'sendScriptContent':
        compareScriptContent(sender.tab.id, request.data.src, request.data.content);
        break;
      case 'initTab':
        initTabData(sender.tab.id);
        break;
      default:
        console.log('Unknown message.');
    }
  },
);

chrome.webRequest.onBeforeRequest.addListener((details) => {
  // Whitelist all requests from non-tab pages or this extension
  if (details.tabId < 0 || details.initiator === `chrome-extension://${chrome.runtime.id}`) {
    return { cancel: false };
  }
  // Whitelist all requests going to the same hostname or requests from extensions
  if (safeGetTabData(details.tabId, 'url')
    && new URL(details.url).hostname === new URL(safeGetTabData(details.tabId, 'url')).hostname) {
    return { cancel: false };
  }

  // getFilename(details.url).match(/jquery(?:-(\d(?:\.\d){0,3}))?(?:\.(min))?\.js/g) &&
  // console.log(details.initiator, /jquery(?:-(\d(?:\.\d){0,3}))?(?:\.(min))?\.js/g
  // .exec(getFilename(details.url)));

  let shouldCancel = containsInputsInURL(tabData[details.tabId].inputs, details.url);
  if (details.requestBody) {
    shouldCancel = shouldCancel || containsInputsInPostData(tabData[details.tabId].inputs,
      details.requestBody);
  }
  if (safeGetTabData(details.tabId, 'mismatchingScripts').map(url => new URL(url).hostname)
    .indexOf(new URL(details.url).hostname) !== -1) {
    shouldCancel = true;
  }
  if (shouldCancel) {
    sendAnnouncement(details.tabId, 'Request cancelled because user credentials were detected.');
  }
  return { cancel: shouldCancel };
},
{
  urls: ['<all_urls>'],
  types: ['sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping',
    'media', 'websocket', 'other'],
},
['blocking', 'requestBody']);

// Update tab dictionary on creation & destruction
chrome.tabs.onCreated.addListener(({ id }) => { tabData[id] = { inputs: [], url: '', mismatchingScripts: [] }; });
chrome.tabs.onRemoved.addListener(tabId => delete tabData[tabId]);
