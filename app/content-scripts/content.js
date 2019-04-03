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


function getPopulatedInputValues() {
  return [...document.querySelectorAll('input, textarea')].map(input => ({
    id: input.id || '',
    name: input.name || '',
    value: input.value || '',
  }));
}

function sendInputValues() {
  chrome.runtime.sendMessage({
    type: 'sendInputValues',
    data: getPopulatedInputValues(),
  });
}

let num = 0;

chrome.runtime.onMessage.addListener(
  (request) => {
    switch (request.type) {
      case 'requestScriptContent':
        getScriptContent(request.data.url);
        break;
      case 'sendAnnouncement':
        document.body.insertAdjacentHTML('beforeend', `<div style="position: fixed;top:${num * 14}px;right:0;width: 20%;background:black;color:white;font:12px sans-serif;z-index:9999;">${request.data}</div>`);
        num += 1;
        break;
      default:
        log(`Unknown message: ${request.type}`);
    }
  },
);

// Bind the body to send updates to any page inputs when they're modified (input events are
// bubbled up)
document.body.addEventListener('input', () => sendInputValues());
// On page load, send new data
// TODO: Change this to be done using webNavigation (e.g. onBeforeNavigate/onCompleted)
sendInputValues();
