export type float = number;
export type int = number;
export type ptr = number;

export type Opt<T> = T | null;

export enum Stream {
  OUT,
  ERR,
  DEBUG,
}

export class State {
  exceptionId = 0;
  exceptions = new Map<int, Exception>();
}

export class Exception {
  id: int;
  err: Error;
  
  constructor(err: Error, state) {
    this.id = ++state.exceptionId;
    this.err = err;
    state.exceptions.set(this.id, this);
  }
}

class SkException extends Error {
  constructor(msg: string) {
      super(msg);
  }
}

export interface Shared {
  getName: () => string;
}

export interface FileSystem {
  openFile(filename: string): number;
  closeFile(fd: int): void;
  watchFile(filename: string, f: (change: string) => void): void;
  writeToFile(fd: int, content: string): void;
  appendToFile(filename: string, content: string): void;
}

export interface Environment {
  arguments: Array<string>;
  timestamp: () => float;
  decodeUTF8: (utf8: ArrayBuffer) => string;
  encodeUTF8: (str: string) => Uint8Array;
  onException: () => void;
  base64Decode: (base64: String) => Uint8Array;
  fs: () => FileSystem;
}

interface Memory {
  buffer: ArrayBuffer;
}

interface Exported {
  SKIP_throw_EndOfFile: () => void;
  SKIP_String_byteSize: (strPtr: ptr) => int;
  SKIP_Obstack_alloc: (size: int) => ptr;
  sk_string_create: (addr: ptr, size: int) => ptr;
  SKIP_call0: (fnc: ptr) => ptr;
  SKIP_checkObstack: () => ptr;
  SKIP_cleanObstack: (ptr: ptr) => void;
  SKIP_getFloatAt: (addr: ptr, index: int) => float;
  SKIP_skfs_init: (size: int) => void;
  SKIP_initializeSkip: () => void;
  SKIP_skfs_end_of_init: () => void;
  SKIP_printCall: (txtPtr: ptr) => void;
  SKIP_callWithException: (fnc: ptr, exc: int) => ptr;
  SKIP_I18N_text: (txtPtr: ptr, optCat: Opt<ptr>) => ptr;
  SKIP_I18N_raw: (txtPtr: ptr) => ptr;
  SKIP_I18N_format: (formatPtr: ptr, parameters: ptr) => ptr;
  SKIP_I18N_textVector: () => ptr;
  SKIP_I18N_pushText: (vector: ptr, txtPtr: ptr) => void;
  SKIP_createByteArray: (size: int) => ptr;
  SKIP_setByte: (skArray: ptr, index: int, value: int) => ptr;
  SKIP_chillByteArray: (skArray: ptr) => ptr;
  SKIP_SKUIMessage_manage: (skMsg: ptr) => void;
  SKIP_SKUIMessage_messageFailure: (skMsg: ptr) => void;
  SKIP_getExceptionMessage: (skExc: ptr) => ptr;
  SKIP_get_persistent_size: () => int;
  SKIP_get_version: () => number;
  skip_main: () => void;
  memory: Memory;
  __heap_base: any;
}

export interface WasmSupplier {
  completeWasm: (wasm: object, utils: Utils) => void;
}

export class Utils {
  private exports: Exported;
  private env: Environment;
  private state: State;

  args: Array<string>;
  private current_stdin: number;
  private stdin: string;
  private stdout: Array<string>;
  private stderr: Array<string>;
  private stddebug: Array<string>;
  private exitCode: int;
  private mainFn ?: string;
  
  exit = (code: int) => this.exitCode = code;

  constructor(
    exports: WebAssembly.Exports,
    env: Environment,
    mainFn ?: string,
  ) {
    this.args = new Array();
    this.current_stdin = 0;
    this.exitCode = 0;
    this.stdin = "";
    this.stdout = new Array();
    this.stderr = new Array();
    this.exports = exports as any as Exported;
    this.env = env;
    this.state = new State();
    this.mainFn = mainFn;
  }
  log = (strPtr: ptr, kind?: Stream) => {
    let toDisplay = this.importString(strPtr);
    if (toDisplay != "") {
      kind = kind ? kind : Stream.OUT;
      if (kind == Stream.DEBUG) {
        this.stddebug.push(toDisplay);
      } else if (kind == Stream.ERR) {
          this.stderr.push(toDisplay);
      } else {
        this.stdout.push(toDisplay);
      }
    }
  };

  clearMainEnvironment = (new_args: Array<string> = [], new_stdin: string = "") => {
    this.args = new_args;
    this.current_stdin = 0;
    this.exitCode = 0;
    this.stdin = new_stdin;
    this.stdout = new Array();
    this.stderr = new Array();
    this.stddebug = new Array();
  }

  main = (new_args: Array<string>, new_stdin: string) => {
    this.clearMainEnvironment(new_args, new_stdin);
    if (!this.mainFn) {
      this.exports.skip_main();
    } else {
      this.exports[this.mainFn]();
    }
    if (this.stddebug.length > 0) {
      console.log(this.stddebug.join(""));
    }
    if (this.exitCode != 0 || this.stderr.length > 0) {
      let message = this.stderr.length > 0 ? this.stderr.join("") : "Internal error with code: " + this.exitCode;
      throw new Error(message)
    }
    return this.stdout.join("");
  }

  importOptString = (strPtr: ptr) => {
    if (strPtr > 0)  {
      return this.importString(strPtr)
    }
    return null;
  };
  importString = (strPtr: ptr) => {
    let size = this.exports.SKIP_String_byteSize(strPtr);
    let utf8 = new Uint8Array(this.exports.memory.buffer, strPtr, size);
    return this.env.decodeUTF8(utf8);
  };
  exportString: (s: string) => ptr = (s: string) => {
    var data = new Uint8Array(this.exports.memory.buffer);
    // @ts-ignore
    var i = 0, addr = this.exports.SKIP_Obstack_alloc(s.length * 4);
    for (var ci = 0; ci != s.length; ci++) {
      var c = s.charCodeAt(ci);
      if (c < 128) {
        data[addr + i++] = c;
        continue;
      }
      if (c < 2048) {
        data[addr + i++] = c >> 6 | 192;
      } else {
        if (c > 0xd7ff && c < 0xdc00) {
          if (++ci >= s.length)
            throw new Error('UTF-8 encode: incomplete surrogate pair');
          var c2 = s.charCodeAt(ci);
          if (c2 < 0xdc00 || c2 > 0xdfff)
            throw new Error('UTF-8 encode: second surrogate character 0x' + c2.toString(16) + ' at index ' + ci + ' out of range');
          c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
          data[addr + i++] = c >> 18 | 240;
          data[addr + i++] = c >> 12 & 63 | 128;
        } else data[addr + i++] = c >> 12 | 224;
        data[addr + i++] = c >> 6 & 63 | 128;
      }
      data[addr + i++] = c & 63 | 128;
    }
    return this.exports.sk_string_create(addr, i);
  };
  exportBytes: (view: Uint8Array) => ptr = (view: Uint8Array) => {
    var exps = this.exports;
    var skArray = exps.SKIP_createByteArray(view.length);
    view.forEach(function (item, index) {
      exps.SKIP_setByte(skArray, index, item);
    });
    return exps.SKIP_chillByteArray(skArray);
  }
  call = (fnId: ptr) => {
    return this.exports.SKIP_call0(fnId);
  };
  callWithException = (fnId: ptr, exception: Exception | null) => {
    return this.exports.SKIP_callWithException(fnId, exception ? exception.id : 0);
  };
  runWithGc = <T>(fn: () => T) => {
    let obsPos = this.exports.SKIP_checkObstack();
    try {
      let res = fn();
      this.exports.SKIP_cleanObstack(obsPos);
      return res;
    } catch (ex) {
      this.exports.SKIP_cleanObstack(obsPos);
      throw ex;
    }
  };
  getBytesFromBuffer = (dataPtr: ptr, length: int) => {
    return new Uint8ClampedArray(this.exports.memory.buffer, dataPtr, length);
  };
  getFloats32 = (dataPtr: ptr, length: int) => {
    let values = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      values[i] = this.exports.SKIP_getFloatAt(dataPtr, i);
    };
    return values;
  };
  init = () => {
    let heapBase = this.exports.__heap_base.valueOf();
    let size = this.exports.memory.buffer.byteLength - heapBase;
    this.exports.SKIP_skfs_init(size);
    this.exports.SKIP_initializeSkip();
    this.exports.SKIP_skfs_end_of_init();
  }
  text = (strTxt: string, strCat: Opt<string>) => {
    const skText = this.exportString(strTxt);
    const skCategory = strCat ? this.exportString(strCat) : null;
    return this.exports.SKIP_I18N_text(skText, skCategory);
  }
  raw = (strTxt: string) => {
    const skText = this.exportString(strTxt);
    return this.exports.SKIP_I18N_raw(skText);
  }
  format = (format: ptr, params: Array<ptr>) => {
    const vector = this.exports.SKIP_I18N_textVector();
    params.forEach(ptr => this.exports.SKIP_I18N_pushText(vector, ptr));
    return this.exports.SKIP_I18N_format(format, vector);
  }
  exportLocale = (text: string | Text) => {
    const verified = check(text);
    if (verified instanceof Raw) {
      return this.raw(verified.text);
    } else if (verified instanceof Locale) {
      return this.text(verified.text, verified.category);
    } else {
      const f = verified as Format;
      return this.format(
        this.exportLocale(f.format),
        f.parameters.map(this.exportLocale)
      );
    }
  }
  etry = (f: ptr, exn_handler: ptr) => {
    try {
      return this.call(f);
    } catch (exn) {
      let exception = (exn instanceof SkException) ? null : new Exception(exn, this.state);
      return this.callWithException(exn_handler, exception);
    }
  }
  ethrow = (skExc: ptr) => {
    if (this.env && this.env.onException) this.env.onException();
    let skMessage = skExc != null && skExc != 0 ? this.exports.SKIP_getExceptionMessage(skExc) : null;
    let message = skMessage != null && skMessage != 0 ? this.importString(skMessage) : "SKFS Internal error";
    throw new SkException(message);
  }
  deleteException = (actor: int) => {
    this.state.exceptions.delete(actor);
  }
  getExceptionMessage = (actor: int) => {
    let msg : string;
    if (this.state.exceptions.has(actor)) {
      msg = this.state.exceptions.get(actor)!.err.message;
    } else {
      msg = "No message supplied"
    }
    return this.exportString(msg);
  }
  manageMessage = (message: string) => {
    this.runWithGc(
      () => this.exports.SKIP_SKUIMessage_manage(
        this.exportString(message)
      )
    )
  }
  messageFailure = (message: string) => {
    this.runWithGc(
      () => this.exports.SKIP_SKUIMessage_messageFailure(
        this.exportString(message)
      )
    )
  }
  getPersistentSize = () => this.exports.SKIP_get_persistent_size();
  getVersion = () => this.exports.SKIP_get_version();
  getMemoryBuffer = () => this.exports.memory.buffer;

  readStdInLine = () => {
    let lineBuffer = new Array<int>();
    const endOfLine = 10;
    if (this.current_stdin >= this.stdin.length) {
      this.exports.SKIP_throw_EndOfFile();
    }
    while (this.stdin.charCodeAt(this.current_stdin) !== endOfLine) {
      if (this.current_stdin >= this.stdin.length) {
        if (lineBuffer.length == 0) {
          this.exports.SKIP_throw_EndOfFile();
        } else {
          return lineBuffer;
        }
      }
      lineBuffer.push(this.stdin.charCodeAt(this.current_stdin));
      this.current_stdin++;
    }
    this.current_stdin++;
    return lineBuffer;
  }

  getStdInChar = () => {
    if (this.current_stdin >= this.stdin.length) {
      this.exports.SKIP_throw_EndOfFile();
    }
    let result = this.stdin.charCodeAt(this.current_stdin);
    this.current_stdin++;
    return result;
  }
}

export interface Links {
  complete: (utils: Utils, exports: object) => Shared | null;
}

export interface ToWasmManager {
  prepare: (wasm: object) => Links | null;
}

enum I18N {
  RAW,
  LOCALE,
  FORMAT
}

export interface Text {
  toJSON: () => object;
}

export class Raw implements Text {
  text: string;

  constructor(text: string, category?: string) {
    this.text = text;
  }

  toJSON: () => object = () => {
    return {
      type: "text",
      fields: {
        type: I18N.RAW,
        value: this.text,
      }
    }
  };
}

export class Locale implements Text {
  text: string;
  category: Opt<string>;

  constructor(text: string, category?: string) {
    this.text = text;
    this.category = category ? category : null;
  }

  toJSON: () => object = () => {
    return {
      type: "text",
      fields: {
        type: I18N.LOCALE,
        value: this.text,
        category: this.category,
      }
    }
  };
}

export const l = (text: string, category?: string) => {
  return new Locale(text, category)
}

export const f = (format: Text | string, parameters: Array<Text | string>) => {
  return new Format(format, parameters)
}

export const check : (value: Text | string) => Text = (value: Text | string) => {
  if (value instanceof Text) {
    return value as Text
  } else {
    return new Raw(value as string)
  }
}

export class Format implements Text {
  format: Text | string;
  parameters: Array<Text | string>;

  constructor(format: Text | string, parameters: Array<Text | string>) {
    this.format = format;
    this.parameters = parameters;
  }

  toJSON: () => object = () => {
    return {
      type: "text",
      fields: {
        type: I18N.FORMAT,
        pattern: check(this.format),
        parameters: this.parameters.map(check)
      }
    }
  };
}

export function humanSize(bytes: int) {
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let u = -1;
  const r = 10 ** 1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(1) + ' ' + units[u];
}

export function loadWasm(
  buffer: ArrayBuffer,
  managers: Array<ToWasmManager>,
  environment : Environment,
  main ?: string,
) {
  let wasm = {};
  let links = managers.map(manager => manager.prepare(wasm));
  return WebAssembly.instantiate(buffer, { env: wasm }).then(
    result => {
      let instance = result.instance;
      let exports = instance.exports as any;
      let utils = new Utils(instance.exports, environment, main);
      utils.init();
      let shared = new Map<string, Shared>();
      links.forEach(link => {
        if (link) {
          let s = link.complete(utils, exports);
          if (s) {
            shared.set(s.getName(), s);
          }          
        }
      });
      if (!main) {
        utils.main(environment.arguments, "");
      }
      return shared;
    }
  );
}

function start(
  modules: Array<string>,
  buffer: Uint8Array,
  environment: Environment,
  main ?: string,
  managers?: Array<ToWasmManager>
) {
  let promises = modules.map(name => import(name).then(module => {
    if (module.init) {
      return module.init(environment)
    } else {
      return null
    }
  }))
  return Promise.all(promises).then(cs => cs.filter(c => c != null)).then(
    ms => loadWasm(buffer, managers ? managers.concat(ms) : ms, environment, main)
  )
}

/** @sk run */
export function run(
  wasm64: string,
  environment: string,
  modules : Array<string>,
  congifs : Array<string>,
  main ?: string,
  managers ?: Array<ToWasmManager>,
) {
  let promises = congifs.map(name => import(name).then(config => {
    if (config.config) {
      return config.config();
    } else {
      return null;
    }
  }))
  return Promise.all(
    [
      import(environment),
      Promise.all(promises).then(cs => cs.filter(c => c != null)),
    ]
  ).then(
    result => {
      let env = result[0].environment(result[1]);
      return import("./" + wasm64 + ".wasm.mjs").then(wm => env.base64Decode(wm.base64)).then(
        buffer => start(modules, buffer, env, main, managers)
      );
    }
  ).catch(e => {throw e;});
}