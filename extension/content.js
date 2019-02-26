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

document.body.addEventListener('input', () => {
  chrome.runtime.sendMessage({
    type: 'sendInputValues',
    data: getPopulatedInputValues(),
  });
});
