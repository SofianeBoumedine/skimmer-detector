import tabData from './TabData';
import InputAnalyser from './InputAnalyser';
import { log, sendMessage } from '../utils/common';
import { sendAnnouncement, getDomainAndTld } from '../utils/utils';

/* eslint class-methods-use-this:0 */

class EventHandlers {
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

    if (type === 'main_frame') {
      log(`Tab ${tabId} is a main frame. Updating record...`);
      tabData.create(tabId, url);
      return { cancel: false };
    }

    if (!tabData.get(tabId)) {
      log(`Tab ${tabId} doesn't exist`);
      tabData.create(tabId);
    }

    // Whitelist all requests going to the same hostname
    if (tabData.get(tabId, 'url')
      && getDomainAndTld(url) === getDomainAndTld(tabData.get(tabId, 'url'))) {
      return { cancel: false };
    }

    const ia = new InputAnalyser(tabData.get(tabId, 'inputs').map(input => input.value));
    if (ia.containsInputsInPostData(requestBody) || ia.containsInputsInURLParams(url)) {
      sendAnnouncement(tabId, 'Cancelled because user credentials were detected in request body/URL.');
      return { cancel: true };
    }

    if (tabData.get(tabId, 'mismatchingScripts').map(u => getDomainAndTld(u)).indexOf(getDomainAndTld(url)) !== -1) {
      sendAnnouncement(tabId, 'Cancelled because it was a request from a mismatching script.');
      return { cancel: true };
    }

    sendMessage('requestScriptContent', { url }, tabId);

    return { cancel: false };
  }

  onTabRemoved(tabId) {
    tabData.remove(tabId);
  }

  onTabCompleted(details) {
    sendMessage('requestInputValues', {}, details.tabId);
  }
}

export default EventHandlers;
