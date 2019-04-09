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

// function compareScriptContent(tabId, src, content) {
//   const xhr = new XMLHttpRequest();
//   xhr.open('get', src, true);
//   xhr.send();
//
//   xhr.onreadystatechange = () => {
//     if (xhr.readyState === xhr.DONE && content !== xhr.response) {
//       if (tabData.get(tabId, 'mismatchingScripts').indexOf(src) === -1) {
//         tabData.set(tabId, 'mismatchingScripts',
//           [...tabData.get(tabId, 'mismatchingScripts'), src]);
//       }
//     }
//   };
// }

export default FileComparer;

// const lc = new FileComparer('https://clickycloud.com/jquery-1.9.2.2.min.js')
// lc.matchesVerifiedLibrary()
