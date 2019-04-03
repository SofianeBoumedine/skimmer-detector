import tabData from './TabData';
import { log, sendMessage } from '../utils/common';
import { atLeastOneNeedleInHaystack, sendAnnouncement } from '../utils/utils';

/* eslint class-methods-use-this:0 */

class EventHandlers {
  // TODO: Extract this elsewhere
  _containsInputsInURL(inputs, url) {
    return atLeastOneNeedleInHaystack(inputs.map(input => input.value),
      [...new URL(url).searchParams.values()]);
  }

  // TODO: Extract this elsewhere
  _containsInputsInPostData(inputs, requestBody) {
    const inputVals = inputs.map(input => input.value);
    if (!requestBody.raw) {
      if (requestBody.formData) {
        return atLeastOneNeedleInHaystack(inputVals,
          Object.values(requestBody.formData).flat());
      }
      return false;
    }
    return atLeastOneNeedleInHaystack(inputVals,
      [decodeURIComponent(String.fromCharCode.apply(null,
        new Uint8Array(requestBody.raw[0].bytes)))]);
  }

  onBeforeRequest(details) {
    const {
      tabId,
      initiator,
      url,
      requestBody,
      type,
    } = details;

    // Whitelist all requests from non-tab pages or this extension
    if (tabId <= 0 || initiator === `chrome-extension://${chrome.runtime.id}`) {
      return { cancel: false };
    }

    if (!tabData.get(tabId)) {
      log(`Tab ${tabId} doesn't exist.`);
      if (type === 'main_frame') {
        log(`Tab ${tabId} is a main frame. Creating...`);
        tabData.create(tabId, url);
      } else {
        tabData.create(tabId);
      }
    }

    // Whitelist all requests going to the same hostname or requests from extensions
    if (tabData.get(tabId, 'url')
      && new URL(url).hostname === new URL(tabData.get(tabId, 'url')).hostname) {
      return { cancel: false };
    }

    sendMessage('requestScriptContent', { url }, tabId);

    if (this._containsInputsInURL(tabData.get(tabId, 'inputs'), url)) {
      sendAnnouncement(tabId, 'Request cancelled because user credentials were detected.');
      return { cancel: true };
    }

    if (requestBody && this._containsInputsInPostData(tabData.get(tabId, 'inputs'), requestBody)) {
      sendAnnouncement(tabId, 'Request cancelled because user credentials were detected.');
      return { cancel: true };
    }

    if (tabData.get(tabId, 'mismatchingScripts').map(u => new URL(u).hostname)
      .indexOf(new URL(url).hostname) !== -1) {
      sendAnnouncement(tabId, 'Request cancelled because user credentials were detected.');
      return { cancel: true };
    }

    return { cancel: false };
  }

  onTabRemoved(tabId) {
    tabData.remove(tabId);
  }
}

export default EventHandlers;
