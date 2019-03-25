const MIN_INPUT_SIZE = 3;

function isBase64Encoded(string) {
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
  let payload = [];
  if (requestBody.raw) {
    payload.append(decodeURIComponent(String.fromCharCode.apply(null,
      new Uint8Array(requestBody.raw[0].bytes))));
  } else { // formData
    payload = Object.values(requestBody.formData).flat();
  }
  return atLeastOneNeedleInHaystack(inputs.map(input => input.value), payload);
}

/* tabId: {
 *   inputs: [{id: number, name: string, value: string}]
 *   url: string
 * }
 */
const tabData = {};

chrome.runtime.onMessage.addListener(
  (request, sender) => {
    switch (request.type) {
      case 'sendInputValues':
        tabData[sender.tab.id].inputs = request.data
          .filter(input => input.value.length > MIN_INPUT_SIZE);
        break;
      case 'sendURL':
        tabData[sender.tab.id].url = request.data;
        break;
      default:
        console.log('Unknown message.');
    }
  },
);

chrome.webRequest.onBeforeRequest.addListener((details) => {
  if (new URL(details.url).hostname === new URL(tabData[details.tabId].url).hostname) {
    return { cancel: false };
  }
  let shouldCancel = containsInputsInURL(tabData[details.tabId].inputs, details.url);
  if (details.requestBody) {
    shouldCancel = shouldCancel || containsInputsInPostData(tabData[details.tabId].inputs,
      details.requestBody);
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
chrome.tabs.onCreated.addListener(({ id }) => { tabData[id] = { inputs: [], url: '' }; });
chrome.tabs.onRemoved.addListener(tabId => delete tabData[tabId]);
