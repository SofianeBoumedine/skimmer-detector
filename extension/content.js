function log(...messages) {
  console.log('[SkimmerDetector] ', ...messages);
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

function sendScriptContent(src, content) {
  chrome.runtime.sendMessage({
    type: 'sendScriptContent',
    data: { src, content },
  });
}

let num = 0;

chrome.runtime.onMessage.addListener(
  (request) => {
    switch (request.type) {
      case 'sendAnnouncement':
        document.body.insertAdjacentHTML('beforeend', `<div style="position: fixed;top:${num++ * 14}px;right:0;width: 20%;background:black;color:white;font:12px sans-serif;z-index:9999;">${request.data}</div>`);
        break;
      default:
        console.log('Unknown message.');
    }
  },
);

[...document.scripts].filter(({ src }) => src !== '').forEach(({ src }) => {
  const xhr = new XMLHttpRequest();
  xhr.open('get', src, true);
  xhr.send();

  xhr.onreadystatechange = function () {
    if (this.readyState === this.DONE) {
      sendScriptContent(src, xhr.response);
    }
  };
});

// Bind the body to send updates to any page inputs when they're modified (input events are
// bubbled up)
document.body.addEventListener('input', () => sendInputValues());
// On page load, send new data
sendInputValues();
