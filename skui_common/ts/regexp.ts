import {int, ptr, Links, Utils, ToWasmManager} from "#skui_base/types";

interface Exported {
  SKIP_RegExp_createRangeArray: (size: int) => ptr;
  SKIP_RegExp_setRange: (skRanges: ptr, index: int , start: int, end: int) => void;
  SKIP_RegExp_createRangesVector: () => ptr;
  SKIP_RegExp_pushRanges: (skRangesVec: ptr, skRanges: ptr) => void;
  SKIP_RegExp_ranges: (skRangesVec: ptr) => ptr;
}

interface ToWasm {
  SKIP_RegExp_check: (strPatternPtr: ptr) => void;
  SKIP_RegExp_escape: (strPatternPtr: ptr) => ptr;
  SKIP_RegExp_test: (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => boolean;
  SKIP_RegExp_matchAll: (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => ptr | null;
  SKIP_RegExp_match: (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => ptr | null;
}

class LinksImpl implements Links, ToWasm {
  SKIP_RegExp_check: (strPatternPtr: ptr) => void;
  SKIP_RegExp_escape: (strPatternPtr: ptr) => ptr;
  SKIP_RegExp_test: (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => boolean;
  SKIP_RegExp_matchAll: (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => ptr | null;
  SKIP_RegExp_match: (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => ptr | null;

  complete = (utils: Utils, exports: object) => {
    let exported = exports as Exported;
    this.SKIP_RegExp_check = (strPatternPtr: ptr) => {
      let strPattern = utils.importString(strPatternPtr);
      new RegExp(strPattern);
    };
    this.SKIP_RegExp_escape = (strPatternPtr: ptr) => {
      let strPattern = utils.importString(strPatternPtr);
      let strEscaped = strPattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      return utils.exportString(strEscaped);
    };
    this.SKIP_RegExp_test = (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => {
      let strSubject = utils.importString(strSubjectPtr);
      let strPattern = utils.importString(strPatternPtr);
      var flags = '';
      if (global) {
        flags += 'g';
      }
      if (caseInsensitive) {
        flags += 'i';
      }
      let regExp = new RegExp(strPattern, flags);
      return regExp.test(strSubject);
    }
    this.SKIP_RegExp_match = (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => {
      let strSubject = utils.importString(strSubjectPtr);
      let strPattern = utils.importString(strPatternPtr);
      var flags = '';
      if (global) {
        flags += 'g';
      }
      if (caseInsensitive) {
        flags += 'i';
      }
      let regExp = new RegExp(strPattern, flags);
      let matches = strSubject.match(regExp);
      if (matches != null) {
        let ranges = exported.SKIP_RegExp_createRangeArray(matches.length);
        exported.SKIP_RegExp_setRange(ranges, 0, 0, strSubject.length);
        if (matches.length > 1) {
          let from = 0;
          for (let i = 1; i < matches.length; i++) {
            let idx = strSubject.indexOf(matches[i], from);
            let slen = matches[i].length;
            exported.SKIP_RegExp_setRange(ranges, i, idx, idx + slen);
            from = idx + slen;
          }
        }
        return ranges;
      }
      return null;
    };
    this.SKIP_RegExp_matchAll = (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => {
      let strSubject = utils.importString(strSubjectPtr);
      let strPattern = utils.importString(strPatternPtr);
      var flags = '';
      if (global) {
        flags += 'g';
      }
      if (caseInsensitive) {
        flags += 'i';
      }
      let regExp = new RegExp(strPattern, flags);
      let matches = [...strSubject!.matchAll(regExp)];
      var vector = exported.SKIP_RegExp_createRangesVector();
      matches.forEach((match) => {
        let len = match[0].length;
        let ranges = exported.SKIP_RegExp_createRangeArray(match.length);
        exported.SKIP_RegExp_setRange(ranges, 0, match.index!, match.index! + len);
        if (match.length > 1) {
          let all = match[0];
          let from = 0;
          for (let i = 1; i < match.length; i++) {
            let idx = all.indexOf(match[i], from);
            let slen = match[i].length;
            exported.SKIP_RegExp_setRange(ranges, i, match.index! + idx, match.index! + idx + slen);
            from = idx + slen;
          }
        }
        exported.SKIP_RegExp_pushRanges(vector, ranges);
      });
      return exported.SKIP_RegExp_ranges(vector);
    };
    return null;
  }
}

class Manager implements ToWasmManager {
  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl();
    toWasm.SKIP_RegExp_check =  (strPtr: ptr) => links.SKIP_RegExp_check(strPtr);
    toWasm.SKIP_RegExp_escape =  (strPtr: ptr) => links.SKIP_RegExp_escape(strPtr);
    toWasm.SKIP_RegExp_test =  (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => 
      links.SKIP_RegExp_test(strSubjectPtr, strPatternPtr, caseInsensitive, global);
    toWasm.SKIP_RegExp_matchAll =  (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => 
      links.SKIP_RegExp_matchAll(strSubjectPtr, strPatternPtr, caseInsensitive, global);
    toWasm.SKIP_RegExp_match =  (strSubjectPtr: ptr, strPatternPtr: ptr, caseInsensitive: boolean, global: boolean) => 
      links.SKIP_RegExp_match(strSubjectPtr, strPatternPtr, caseInsensitive, global);
    return links;
  }
}

export var init = () => new Manager();

