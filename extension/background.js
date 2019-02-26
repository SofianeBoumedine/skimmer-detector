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

const inputs = {};

chrome.runtime.onMessage.addListener(
  (request, sender) => {
    if (request.type === 'sendInputValues') {
      inputs[sender.tab.id] = request.data;
    }
  },
);

chrome.webRequest.onBeforeRequest.addListener(
  info => ({
    cancel: containsInputInURL(inputs[info.tabId].map(input => input.value),
      new URL(info.url)),
  }),
  { urls: ['<all_urls>'] },
  ['blocking'],
);
