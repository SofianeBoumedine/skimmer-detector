class TabData {
  constructor() {
    this._tabData = {};
  }

  create(tabId, url = '') {
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
    return false;
  }

  set(tabId, property, value) {
    if (Object.prototype.hasOwnProperty.call(this._tabData, tabId)) {
      this._tabData[tabId][property] = value;
      return true;
    }
    return false;
  }

  remove(tabId) {
    if (!Object.prototype.hasOwnProperty.call(this._tabData, tabId)) {
      return false;
    }
    delete this._tabData[tabId];
    return true;
  }
}

export default new TabData();
