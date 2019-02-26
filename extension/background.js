function isBase64Encoded(string) {
  return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(string);
}

function containsInputInURL(inputVals, url) {
  if (!inputVals || !url) {
    return false;
  }
  return [...url.searchParams.values()].some(param => inputVals.some((input) => {
    if (isBase64Encoded(param)) {
      if (atob(param).indexOf(input) !== -1) {
        return true;
      }
    }
    return param.indexOf(input) !== -1;
  }));
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
      console.log(tabData);
    }
  },
);

chrome.webRequest.onBeforeRequest.addListener(
  info => ({
    cancel: containsInputInURL(tabData[info.tabId].inputs.map(input => input.value),
      new URL(info.url)),
  }),
  { urls: ['<all_urls>'],
    types: ["sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "media", "websocket", "other"],
  },
  ['blocking'],
);

// Update tab dictionary on creation & destruction
chrome.tabs.onCreated.addListener(({id}) => tabData[id] = { inputs: [] });
chrome.tabs.onRemoved.addListener((tabId) => delete tabData[tabId]);
