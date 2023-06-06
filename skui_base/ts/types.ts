export type float = number;
export type int = number;
export type ptr = number;

export type Opt<T> = T | null;


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

export interface Shared {
  getName: () => string;
}

export interface Environment {
  timestamp: () => float;
  readData: (url: URL) => Promise<ArrayBuffer>;
  decodeUTF8: (utf8: Uint8Array) => string;
  onException: () => void;
  complete(exports: object, shared: Map<string,Shared>)
}


interface Exported {
  SKIP_String_byteSize: (strPtr: ptr) => int;
  SKIP_Obstack_alloc: (size: int) => ptr;
  sk_string_create: (addr: ptr, size: int) => ptr;
  SKIP_call0: (fnc: ptr) => ptr;
  SKIP_checkObstack: () => ptr;
  SKIP_cleanObstack: (ptr: ptr) => void;
  SKIP_getFloatAt: (addr: ptr, index: int) => float;
  SKIP_skfs_init: () => void;
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
}

export function toBeDefined(fn: String) {
  console.log("To be defined: " + fn);
}

export interface WasmSupplier {
  completeWasm: (wasm: object, utils: Utils) => void;
}

export class Utils {
  exports: Exported;
  memory: WebAssembly.Memory;
  lastCall: ptr;
  env: Environment;
  state: State;

  constructor(
    exports: WebAssembly.Exports,
    memory: WebAssembly.Memory,
    env: Environment,
  ) {
    this.exports = exports as any as Exported;
    this.memory = memory;
    this.lastCall = 0;
    this.env = env;
    this.state = new State();
  }
  log = (strPtr: ptr) => {
    let toDisplay = this.importString(strPtr).trim();
    if (toDisplay != "") {
      console.log(toDisplay);
    }
  };
  importOptString = (strPtr: ptr) => {
    if (strPtr > 0)  {
      return this.importString(strPtr)
    }
    return null;
  };
  importString = (strPtr: ptr) => {
    let size = this.exports.SKIP_String_byteSize(strPtr);
    let utf8 = new Uint8Array(this.memory.buffer, strPtr, size);
    return this.env.decodeUTF8(utf8);
  };
  exportString: (s: string) => ptr = (s: string) => {
    var data = new Uint8Array(this.memory.buffer);
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
    var skArray = this.exports.SKIP_createByteArray(view.length);
    view.forEach(function (item, index) {
      this.exports.SKIP_setByte(skArray, index, item);
    });
    return this.exports.SKIP_chillByteArray(skArray);
  }
  call = (fnId: ptr) => {
    return this.exports.SKIP_call0(fnId);
  };
  callWithException = (fnId: ptr, exception: Exception) => {
    return this.exports.SKIP_callWithException(fnId, exception.id);
  };
  runWithGc = <T>(fn: () => T) => {
    let obsPos = this.exports.SKIP_checkObstack();
    let res = fn();
    this.exports.SKIP_cleanObstack(obsPos);
    return res;
  };
  getBytesFromBuffer = (dataPtr: ptr, length: int) => {
    return new Uint8ClampedArray(this.memory.buffer, dataPtr, length);
  };
  getFloats32 = (dataPtr: ptr, length: int) => {
    let values = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      values[i] = this.exports.SKIP_getFloatAt(dataPtr, i);
    };
    return values;
  };
  init = () => {
    this.exports.SKIP_skfs_init();
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
    this.lastCall = f;
    try {
      return this.call(f);
    } catch (exn) {
      let exception = new Exception(exn, this.state);
      return this.callWithException(exn_handler, exception);
    }
  }
  ethrow = (strPtr: ptr) => {
    this.env.onException();
    let message = strPtr != null && strPtr != 0 ? this.importString(strPtr) : "SKFS Internal error";
    throw new Error(message);
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

var loadWasm = (
  buffer: ArrayBuffer,
  managers: Array<ToWasmManager>,
  environment: Environment,
) => {
  let wasm = {};
  let links = managers.map(manager => manager.prepare(wasm));
  return WebAssembly.instantiate(buffer, { env: wasm }).then(
    result => {
      let instance = result.instance;
      let exports = instance.exports as any;
      let utils = new Utils(instance.exports, exports.memory, environment);
      let shared = new Map<string, Shared>();
      links.forEach(link => {
        if (link) {
          let s = link.complete(utils, exports);
          if (s) {
            shared.set(s.getName(), s);
          }          
        }
      });
      utils.init();
      environment.complete(exports, shared);
    }
  );
}

export async function start(modules: Array<string>, path: URL, environment: Environment, managers?: Array<ToWasmManager>) {
  managers = managers ? managers : new Array<ToWasmManager>();
  for (let i = 0; i < modules.length; i++) {
    let evnModule = await import(modules[i]);
    if (evnModule.init) {
        managers.push(await evnModule.init());
    }
  }
  let data = await environment.readData(path);
  let buffer = new Uint8Array(data);
  await loadWasm(buffer, managers, environment);
}

