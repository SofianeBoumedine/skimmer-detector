import { log } from '../utils/common';

class TabData {
  constructor() {
    this._tabData = {};
  }

  create(tabId, url = '') {
    log(`Creating new record for tab ${tabId}`);
    this._tabData[tabId] = {
      url,
      inputs: [],
      mismatchingScripts: [],
    };
    return this._tabData[tabId];
  }

  get(tabId, property) {
    if (Object.prototype.hasOwnProperty.call(this._tabData, tabId)) {
      if (property) {
        return this._tabData[tabId][property];
      }
      return this._tabData[tabId];
    }
    log(`Could not get ${property ? `property '${property}' in ` : ''}tab ${tabId}`);
    return false;
  }

  set(tabId, property, value) {
    if (Object.prototype.hasOwnProperty.call(this._tabData, tabId)) {
      this._tabData[tabId][property] = value;
      return true;
    }
    log(`Cannot set property in tab ${tabId} for it does not exist`);
    return false;
  }

  remove(tabId) {
    if (!Object.prototype.hasOwnProperty.call(this._tabData, tabId)) {
      log(`Cannot delete tab ${tabId} for it does not exist`);
      return false;
    }
    log(`Deleting data for tab ${tabId}`);
    delete this._tabData[tabId];
    return true;
  }
}

export default new TabData();
