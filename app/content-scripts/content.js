import { log, sendMessage } from '../../src/utils/common';

function getScriptContent(src) {
  const xhr = new XMLHttpRequest();
  xhr.open('get', src, true);
  xhr.send();

  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.DONE) {
      sendMessage('sendScriptContent', { src, content: xhr.response });
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
  sendMessage('sendInputValues', { inputs: getPopulatedInputValues() });
}

let num = 0;

chrome.runtime.onMessage.addListener(
  (request) => {
    switch (request.type) {
      case 'requestScriptContent':
        log(`Received a request to compare ${request.data.url}`);
        getScriptContent(request.data.url);
        break;
      case 'requestInputValues':
        sendInputValues();
        break;
      case 'sendAnnouncement':
        document.body.insertAdjacentHTML('beforeend', `<div style="position: fixed;top:${num * 14}px;right:0;width: 20%;background:black;color:white;font:12px sans-serif;z-index:9999;">${request.data.message}</div>`);
        num += 1;
        break;
      default:
        log(`Unknown message: ${request.type}`);
    }
  },
);

// Bind the body to send updates to any page inputs when they're modified (input events are
// bubbled up)
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('input', () => sendInputValues());
});

// const originalXMLHttpRequest = window.XMLHttpRequest.prototype.send;
// window.XMLHttpRequest.prototype.send = function (body) {
//   log('somebody just called a send xhr');
//   StackTrace.get()
//     .then((stack) => {
//       const stringifiedStack = stack.map(function(sf) {
//         return sf.toString();
//       }).join('\n');
//       log('stringified stack', stringifiedStack);
//     })
//     .catch((err) =>{
//       log(err.message);
//     });
//   originalXMLHttpRequest.bind(this)(body);
// };
