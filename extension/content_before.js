function log(...messages) {
  console.log('[SkimmerDetector] ', ...messages);
}

function initTab() {
  chrome.runtime.sendMessage({ type: 'initTab' });
}

function sendURL() {
  chrome.runtime.sendMessage({
    type: 'sendURL',
    data: window.location.href,
  });
}

function sendScriptContent(src, content) {
  chrome.runtime.sendMessage({
    type: 'sendScriptContent',
    data: { src, content },
  });
}

function getScriptContent(src) {
  const xhr = new XMLHttpRequest();
  xhr.open('get', src, true);
  xhr.send();

  xhr.onreadystatechange = function () {
    if (this.readyState === this.DONE) {
      sendScriptContent(src, xhr.response);
    }
  };
}

chrome.runtime.onMessage.addListener(
  (request) => {
    switch (request.type) {
      case 'requestScriptContent':
        getScriptContent(request.data.url);
        break;
      default:
        log(`Unknown message: ${request.type}`);
    }
  },
);

// Remove information about scripts on the previous page when the user navigates elsewhere.
initTab();
// Update page with the new URL
sendURL();
