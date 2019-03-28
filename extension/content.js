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
