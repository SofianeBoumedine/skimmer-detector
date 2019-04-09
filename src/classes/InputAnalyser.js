import { atLeastOneNeedleInHaystack } from '../utils/utils';

class InputAnalyser {
  constructor(inputVals) {
    this._inputVals = inputVals;
  }

  containsInputsInURLParams(url) {
    if (!url) {
      return false;
    }
    return atLeastOneNeedleInHaystack(this._inputVals,
      [...new URL(url).searchParams.values()]);
  }

  containsInputsInPostData(requestBody) {
    if (!requestBody) {
      return false;
    }
    if (!requestBody.raw) {
      if (requestBody.formData) {
        return atLeastOneNeedleInHaystack(this._inputVals,
          Object.values(requestBody.formData).flat());
      }
      return false;
    }
    return atLeastOneNeedleInHaystack(this._inputVals,
      [decodeURIComponent(String.fromCharCode.apply(null,
        new Uint8Array(requestBody.raw[0].bytes)))]);
  }
}

export default InputAnalyser;
