function log(message, logType = 'log') {
  if (logType !== 'log' && logType !== 'error' && logType !== 'info' && logType !== 'warn') return;
  console[logType]('[SkimmerDetector] ', message);
}

function getPopulatedInputValues() {
  return [...document.querySelectorAll('input, textarea')].map(input => ({
    id: input.id || '',
    name: input.name || '',
    value: input.value || '',
  })).filter(input => input.value);
}

function sendInputValues() {
  chrome.runtime.sendMessage({
    type: 'sendInputValues',
    data: getPopulatedInputValues(),
  });
}

document.body.addEventListener('input', () => sendInputValues());

// On page load, send new data
sendInputValues()
