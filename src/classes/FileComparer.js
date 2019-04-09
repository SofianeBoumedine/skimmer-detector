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

  /* eslint class-methods-use-this:0 */
  async getFileContents(src) {
    fetch(src).then((response) => {
      /* eslint prefer-arrow-callback:0 */
      response.text().then(function (data) {
        log(data);
      });
    }).catch((err) => {
      log('Fetch Error :-S', err);
    });
  }
}

export default FileComparer;
