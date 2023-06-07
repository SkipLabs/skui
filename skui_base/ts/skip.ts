import {int, float, ptr, Links, Utils, ToWasmManager, Environment} from "#skui_base/types";

interface Env extends Environment {
  window: () => Window | null;
  arguments: Array<string>;
  appendTextTo: (name: string, content: string) => void;
}

class LinksImpl implements Links {
  env: Env | undefined;
  arguments: Array<string>;

  constructor(env?: Env) {
    this.env = env;
    this.arguments = env ? env.arguments : new Array();
  }

  SKIP_print_error: (strPtr: ptr) => void;
  SKIP_print_raw: (strPtr: ptr) => void;
  SKIP_print_char: (code: int) => void;
  SKIP_print_string: (strPtr: ptr) => void;
  SKIP_etry: (f: ptr, exn_handler: ptr) => ptr;
  __cxa_throw: (strPtr: ptr) => void;
  SKIP_JS_timeStamp: () => float;

  SKIP_JS_deleteException: (actor: int) => void;
  SKIP_JS_getExceptionMessage: (actor: int) => ptr;
  SKIP_getArgN: (index: int) => ptr;
  SKIP_FileSystem_appendTextFile: (path: ptr, contents: ptr) => void;

  SKIP_getArgc = () => this.arguments.length;

  complete = (utils: Utils, exports: object) => {
    this.SKIP_etry = utils.etry;
    this.SKIP_print_error = (msg: ptr) => {
      utils.log(msg);
    };
    this.SKIP_print_raw = utils.log;
    this.SKIP_print_string = utils.log;
    this.__cxa_throw = (strPtr: ptr) => {
      let message = strPtr != null && strPtr != 0 ? utils.importString(strPtr) : "SKFS Internal error";
      throw new Error(message);
    };
    this.SKIP_print_char = (c: int) => {
      var str = String.fromCharCode(c);
      if (str == "\n") {
        if (consoleBuffer.trim() != "") {
          console.log(consoleBuffer);
        }
        consoleBuffer = "";
      } else {
        consoleBuffer += str;
      }
    };
    this.SKIP_JS_timeStamp = () => this.env ? this.env.timestamp() : 0.0;
    this.SKIP_JS_deleteException = utils.deleteException;
    this.SKIP_JS_getExceptionMessage = utils.getExceptionMessage;

    this.SKIP_getArgN = (index: int) => utils.exportString(this.arguments[index]);
    this.SKIP_FileSystem_appendTextFile = (path: ptr, contents: ptr) => {
      let strPath = utils.importString(path);
      let strContents = utils.importString(contents);
      if (this.env) {
        this.env.appendTextTo(strPath, strContents);
      }
    }
    return null;
  }
}

class Manager implements ToWasmManager {
  env: Env |  undefined;
  constructor(env?: Env) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl(this.env);
    toWasm._ZSt9terminatev = () => {
        throw new Error("_ZSt9terminatev");
    };
    toWasm._ZNSt9exceptionD2Ev = () => {
        throw new Error("_ZNSt9exceptionD2Ev");
    };
    toWasm._ZNKSt9exception4whatEv=  () => {
        throw new Error("_ZNKSt9exception4whatEv");
    };
    toWasm._ZdlPv=  () => {
        throw new Error("_ZdlPv");
    };
    toWasm.abort=  (err: ptr) => {
        throw new Error("Abort " + err);
    };
    toWasm.abortOnCannotGrowMemory=  (err: ptr) => {
        throw new Error("Abort on cannot grow memory " + err);
    };
    toWasm.__setErrNo = (err: ptr) => {
        throw new Error("ErrNo " + err);
    };
    toWasm.__cxa_throw = (strPtr: ptr) => {
      return links.__cxa_throw(strPtr)
    };
    toWasm.cos =  Math.cos;
    toWasm.sin =  Math.sin;
    toWasm.sqrt =  Math.sqrt;
    toWasm.round =  Math.round;
    toWasm.ceil =  Math.ceil;
    toWasm.pow =  Math.pow;
    toWasm.floor =  Math.floor;
    toWasm.SKIP_Math_log =  Math.log;
    toWasm.SKIP_Math_acos =  Math.acos;
    toWasm.SKIP_Math_arcCos =  Math.acos;
    toWasm.SKIP_Math_asin =  Math.asin;
    toWasm.SKIP_Math_log10 =  Math.log10;
    toWasm.SKIP_Math_exp =  Math.exp;
    toWasm.SKIP_JS_timeStamp = () => links.SKIP_JS_timeStamp();
    toWasm.SKIP_print_error =  (strPtr: ptr) => links.SKIP_print_error(strPtr);
    toWasm.SKIP_print_raw =  (strPtr: ptr) => links.SKIP_print_raw(strPtr);
    toWasm.SKIP_print_char =  (strPtr: ptr) => links.SKIP_print_char(strPtr);
    toWasm.SKIP_print_string =  (strPtr: ptr) => links.SKIP_print_string(strPtr);
    toWasm.SKIP_etry =  (f: ptr, exn_handler: ptr) => links.SKIP_etry(f, exn_handler);
    toWasm.SKIP_JS_deleteException = (actor: int) => links.SKIP_JS_deleteException(actor);
    toWasm.SKIP_JS_getExceptionMessage = (actor: int) => links.SKIP_JS_getExceptionMessage(actor);
    toWasm.SKIP_getArgc = () => links.SKIP_getArgc();
    toWasm.SKIP_getArgN = (index: int) => links.SKIP_getArgN(index);
    toWasm.SKIP_FileSystem_appendTextFile = (path: ptr, contents: ptr) => links.SKIP_FileSystem_appendTextFile(path, contents);
    return links;
  }
}

var consoleBuffer = "";

interface ToWasm {
  _ZSt9terminatev: () => void;
  _ZNSt9exceptionD2Ev: () => void;
  _ZNKSt9exception4whatEv: () => void;
  _ZdlPv: () => void;
  abort: (err: ptr) => void;
  abortOnCannotGrowMemory: (err: ptr) => void;
  __setErrNo: (err: ptr) => void;
  __cxa_throw: (strPtr: ptr) => void;
  SKIP_JS_timeStamp: () => float;
  cos: (v: float) => float;
  sin: (v: float) => float;
  sqrt: (v: float) => float;
  round: (v: float) => float;
  ceil: (v: float) => float;
  pow: (v: float, p: float) => float;
  floor: (v: float) => float;
  SKIP_Math_log: (v: float) => float;
  SKIP_Math_acos: (v: float) => float;
  SKIP_Math_arcCos: (v: float) => float;
  SKIP_Math_asin: (v: float) => float;
  SKIP_Math_log10: (v: float) => float;
  SKIP_Math_exp: (v: float) => float;
  SKIP_print_error: (strPtr: ptr) => void;
  SKIP_print_raw: (strPtr: ptr) => void;
  SKIP_print_char: (strPtr: ptr) => void;
  SKIP_print_string: (strPtr: ptr) => void;
  SKIP_etry: (f: ptr, exn_handler: ptr) => ptr;
  SKIP_JS_deleteException: (actor: int) => void;
  SKIP_JS_getExceptionMessage: (actor: int) => ptr;
  SKIP_getArgc: () => int;
  SKIP_getArgN: (index: int) => ptr;
  SKIP_FileSystem_appendTextFile: (path: ptr, contents: ptr) => void;
}

export function init(env?: Environment) {
  return Promise.resolve(new Manager(env ? env as Env : undefined));
}
