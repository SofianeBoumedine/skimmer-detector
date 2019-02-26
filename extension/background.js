let inputValues = {}

chrome.runtime.onMessage.addListener(
    function(request, sender) {
        if (request.type === 'sendInputValues') {
            inputValues[sender.tab.id] = request.data;
        }
    });

chrome.webRequest.onBeforeRequest.addListener(
    function(info) {
        return {cancel: containsInputInURL(inputValues[info.tabId], new URL(info.url))}
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);

function containsInputInURL(inputs, url) {
    if (!inputs || !url) {
        return false;
    }
    return [...url.searchParams.values()].some(param => {
        return inputs.map(input => input.value).some(input => {
            if (isBase64Encoded(param)) {
                if (atob(param).indexOf(input) !== -1) {
                    return true;
                }
            }
            return param.indexOf(input) !== -1;
        })
    });
}

function isBase64Encoded(string) {
    return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(string);
}
