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

document.body.addEventListener('input', () => sendInputValues());

// On page load, send new data
sendInputValues();
sendURL();

[...document.scripts].filter(({ src }) => src !== '').forEach(({ src }) => {
  const xhr = new XMLHttpRequest();
  xhr.open('get', src, true);
  xhr.send();

  xhr.onreadystatechange = function () {
    if (this.readyState === this.DONE) {
      log('in here for ', src);
      sendScriptContent(src, xhr.response);
    }
  };
});
