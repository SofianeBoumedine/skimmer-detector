chrome.webRequest.onBeforeRequest.addListener(
    function(info) {

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: "getInputValues"},
                    inputs => findInputsInURL(inputs, new URL(info.url)));
        });

        return {}
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestBody"]
);

function findInputsInURL(inputs, url) {
    url.searchParams.forEach(param => {
        inputs.map(input => input.value).forEach(input => {
            if (isBase64Encoded(param)) {
                const decoded = atob(param);
                if (decoded.indexOf(input) !== -1) {
                    console.log(`Potentially found a skimmer with input value ${input} and URL parameter ${param} (decoded to ${decoded})`);
                    return true;
                }
            }
            if (param.indexOf(input) !== -1) {
                console.log(`Potentially found a skimmer with input value ${input} and URL parameter ${param}`);
                return true;
            }
        })
    });
    return false;
}

function isBase64Encoded(string) {
    return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(string);
}
