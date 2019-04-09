import tabData from './classes/TabData';
import { log } from './utils/common';
import EventHandlers from './classes/EventHandlers';

const MIN_INPUT_SIZE = 3;
const events = new EventHandlers();

function compareScriptContent(tabId, src, content) {
  const xhr = new XMLHttpRequest();
  xhr.open('get', src, true);
  xhr.send();

  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.DONE && content !== xhr.response) {
      if (tabData.get(tabId, 'mismatchingScripts').indexOf(src) === -1) {
        log(`Files did not match for ${src}`);
        tabData.set(tabId, 'mismatchingScripts',
          [...tabData.get(tabId, 'mismatchingScripts'), src]);
      }
    }
  };
}

chrome.runtime.onMessage.addListener(
  (request, sender) => {
    switch (request.type) {
      case 'sendInputValues':
        tabData.set(sender.tab.id, 'inputs',
          request.data.inputs.filter(input => input.value.length > MIN_INPUT_SIZE));
        break;
      case 'sendScriptContent':
        compareScriptContent(sender.tab.id, request.data.src, request.data.content);
        break;
      default:
        log(`Unknown message: ${request.type}`);
    }
  },
);

function initialiseEventListeners() {
  chrome.webRequest.onBeforeRequest.addListener(events.onBeforeRequest.bind(events), {
    urls: ['<all_urls>'],
    types: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object',
      'xmlhttprequest', 'ping', 'media', 'websocket', 'other'],
  }, ['blocking', 'requestBody']);

  chrome.tabs.onRemoved.addListener(events.onTabRemoved.bind(events));

  chrome.webNavigation.onCompleted.addListener(events.onTabCompleted.bind(events));
}

function init() {
  initialiseEventListeners();
}

init();


// Temporary
chrome.browserAction.onClicked.addListener((tab) => {
  log(tabData.get(tab.id));
});
