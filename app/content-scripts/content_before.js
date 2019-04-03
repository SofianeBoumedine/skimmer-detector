import { log } from '../../src/utils/common';

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

  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.DONE) {
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
