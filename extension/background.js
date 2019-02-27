function isBase64Encoded(string) {
  return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(string);
}

function atLeastOneNeedleInHaystack(needles, haystack) {
  if (!needles || !haystack) {
    return false;
  }
  return haystack.some(haystackElem => needles.some((needle) => {
    if (isBase64Encoded(haystackElem)) {
      if (atob(haystackElem).indexOf(needle) !== -1) {
        return true;
      }
    }
    return haystackElem.indexOf(needle) !== -1;
  }));
}

function containsInputInURL(inputs, url) {
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
 *   inputs: [{id, name, value}]
 * }
 */
const tabData = {};

chrome.runtime.onMessage.addListener(
  (request, sender) => {
    if (request.type === 'sendInputValues') {
      tabData[sender.tab.id].inputs = request.data;
    }
  },
);

chrome.webRequest.onBeforeRequest.addListener((data) => {
  let shouldCancel = containsInputInURL(tabData[data.tabId].inputs, data.url);
  if (data.requestBody) {
    shouldCancel = shouldCancel || containsInputsInPostData(tabData[data.tabId].inputs,
      data.requestBody);
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
chrome.tabs.onCreated.addListener(({ id }) => { tabData[id] = { inputs: [] }; });
chrome.tabs.onRemoved.addListener(tabId => delete tabData[tabId]);
