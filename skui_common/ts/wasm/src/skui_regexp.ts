import type {
  int,
  ptr,
  Links,
  Utils,
  ToWasmManager,
  Environment,
  Nullable,
} from "../skipwasm-std/index.js";

import type * as Internal from "./internal.js";

interface Exported {
  SKIP_RegExp_createRangeArray: (
    size: int
  ) => ptr<Internal.Array<Internal.Range>>;
  SKIP_RegExp_setRange: (
    skRanges: ptr<Internal.Array<Internal.Range>>,
    index: int,
    start: int,
    end: int
  ) => void;
  SKIP_RegExp_createRangesVector: () => ptr<Internal.RangesVector>;
  SKIP_RegExp_pushRanges: (
    skRangesVec: ptr<Internal.RangesVector>,
    skRanges: ptr<Internal.Array<Internal.Range>>
  ) => void;
  SKIP_RegExp_ranges: (
    skRangesVec: ptr<Internal.RangesVector>
  ) => ptr<Internal.RangesArray>;
}

interface ToWasm {
  SKIP_RegExp_check: (strPatternPtr: ptr<Internal.String>) => void;
  SKIP_RegExp_escape: (
    strPatternPtr: ptr<Internal.String>
  ) => ptr<Internal.String>;
  SKIP_RegExp_test: (
    strSubjectPtr: ptr<Internal.String>,
    strPatternPtr: ptr<Internal.String>,
    caseInsensitive: boolean,
    global: boolean
  ) => boolean;
  SKIP_RegExp_matchAll: (
    strSubjectPtr: ptr<Internal.String>,
    strPatternPtr: ptr<Internal.String>,
    caseInsensitive: boolean,
    global: boolean
  ) => Nullable<ptr<Internal.RangesArray>>;
  SKIP_RegExp_match: (
    strSubjectPtr: ptr<Internal.String>,
    strPatternPtr: ptr<Internal.String>,
    caseInsensitive: boolean,
    global: boolean
  ) => Nullable<ptr<Internal.Array<Internal.Range>>>;
}

class LinksImpl implements Links, ToWasm {
  private utils!: Utils;
  private exported!: Exported;

  complete = (utils: Utils, exports: object) => {
    this.utils = utils;
    this.exported = exports as Exported;
  };

  SKIP_RegExp_check(strPatternPtr: ptr<Internal.String>) {
    const strPattern = this.utils.importString(strPatternPtr);
    new RegExp(strPattern);
  }

  SKIP_RegExp_escape(strPatternPtr: ptr<Internal.String>) {
    const strPattern = this.utils.importString(strPatternPtr);
    const strEscaped = strPattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    return this.utils.exportString(strEscaped);
  }

  SKIP_RegExp_test(
    strSubjectPtr: ptr<Internal.String>,
    strPatternPtr: ptr<Internal.String>,
    caseInsensitive: boolean,
    global: boolean
  ) {
    const strSubject = this.utils.importString(strSubjectPtr);
    const strPattern = this.utils.importString(strPatternPtr);
    let flags = "";
    if (global) {
      flags += "g";
    }
    if (caseInsensitive) {
      flags += "i";
    }
    const regExp = new RegExp(strPattern, flags);
    return regExp.test(strSubject);
  }

  SKIP_RegExp_match(
    strSubjectPtr: ptr<Internal.String>,
    strPatternPtr: ptr<Internal.String>,
    caseInsensitive: boolean,
    global: boolean
  ) {
    const strSubject = this.utils.importString(strSubjectPtr);
    const strPattern = this.utils.importString(strPatternPtr);
    let flags = "";
    if (global) {
      flags += "g";
    }
    if (caseInsensitive) {
      flags += "i";
    }
    const regExp = new RegExp(strPattern, flags);
    const matches = strSubject.match(regExp);
    if (matches != null) {
      const ranges = this.exported.SKIP_RegExp_createRangeArray(matches.length);
      this.exported.SKIP_RegExp_setRange(ranges, 0, 0, strSubject.length);
      if (matches.length > 1) {
        let from = 0;
        for (let i = 1; i < matches.length; i++) {
          const match = matches[i]!;
          const idx = strSubject.indexOf(match, from);
          const slen = match.length;
          this.exported.SKIP_RegExp_setRange(ranges, i, idx, idx + slen);
          from = idx + slen;
        }
      }
      return ranges;
    }
    return null;
  }

  SKIP_RegExp_matchAll(
    strSubjectPtr: ptr<Internal.String>,
    strPatternPtr: ptr<Internal.String>,
    caseInsensitive: boolean,
    global: boolean
  ) {
    const strSubject = this.utils.importString(strSubjectPtr);
    const strPattern = this.utils.importString(strPatternPtr);
    let flags = "";
    if (global) {
      flags += "g";
    }
    if (caseInsensitive) {
      flags += "i";
    }
    const regExp = new RegExp(strPattern, flags);
    const matches = [...strSubject.matchAll(regExp)];
    const vector = this.exported.SKIP_RegExp_createRangesVector();
    matches.forEach((match) => {
      const len = match[0].length;
      const ranges = this.exported.SKIP_RegExp_createRangeArray(match.length);
      this.exported.SKIP_RegExp_setRange(
        ranges,
        0,
        match.index,
        match.index + len
      );
      if (match.length > 1) {
        const all = match[0];
        let from = 0;
        for (let i = 1; i < match.length; i++) {
          const elem = match[i]!;
          const idx = all.indexOf(elem, from);
          const slen = elem.length;
          this.exported.SKIP_RegExp_setRange(
            ranges,
            i,
            match.index + idx,
            match.index + idx + slen
          );
          from = idx + slen;
        }
      }
      this.exported.SKIP_RegExp_pushRanges(vector, ranges);
    });
    return this.exported.SKIP_RegExp_ranges(vector);
  }
}

class Manager implements ToWasmManager {
  prepare = (wasm: object) => {
    const toWasm = wasm as ToWasm;
    const links = new LinksImpl();
    toWasm.SKIP_RegExp_check = links.SKIP_RegExp_check.bind(links);
    toWasm.SKIP_RegExp_escape = links.SKIP_RegExp_escape.bind(links);
    toWasm.SKIP_RegExp_test = links.SKIP_RegExp_test.bind(links);
    toWasm.SKIP_RegExp_matchAll = links.SKIP_RegExp_matchAll.bind(links);
    toWasm.SKIP_RegExp_match = links.SKIP_RegExp_match.bind(links);
    return links;
  };
}

export function init(_env: Environment) {
  return Promise.resolve(new Manager());
}
