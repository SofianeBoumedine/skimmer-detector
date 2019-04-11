import { fetchLocalJSONResource } from '../utils/utils';
import { log } from '../utils/common';

class FileComparer {
  _libraryMap = fetchLocalJSONResource('databases/javascriptLibraries.json');

  constructor(url) {
    this._url = url;
  }

  getFileName() {
    return this._url.split('/').pop().split('#')[0].split('?')[0];
  }
}

export default FileComparer;
