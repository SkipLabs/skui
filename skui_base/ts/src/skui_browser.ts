import { float, int, Environment } from "#skui_base/skui_types";
import { MemFS } from "#skui_base/skui_memfs";

class Env implements Environment {
  fileSystem : MemFS;
  timestamp: () => float;
  window: () => Window;
  canvas: () => HTMLCanvasElement;
  clipboard: () => Clipboard;
  decodeUTF8: (utf8: ArrayBuffer) => string;
  encodeUTF8: (str: string) => Uint8Array;
  storage: () => Storage;
  onException: () => void;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
  base64Decode: (base64: String) => Uint8Array;
  update: () => void;
  arguments: Array<string>;
  configs?: Array<any>;
  throwRuntime = (code: int) => {
    this.onException();
    if (code != 0) {
      throw new Error("Error with code: " + code);
    }
  }
  fs() {
    return this.fileSystem;
  }
  

  constructor(global: WindowOrWorkerGlobalScope, navigator: Navigator, configs?: Array<any>) {
    this.fileSystem = new MemFS();
    this.configs = configs;
    this.timestamp = () => global.performance.now();
    this.clipboard = () => navigator.clipboard;
    var decoder = new TextDecoder('utf8');
    this.decodeUTF8 = (utf8: ArrayBuffer) => decoder.decode(utf8);
    var encoder = new TextEncoder(); // always utf-8
    this.encodeUTF8 = (str: string) =>  encoder.encode(str);
    this.base64Decode = (base64: string) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));;
    this.storage = () => localStorage;
    this.onException = () => { };
    if ('location' in global) {
      let win = global as any;
      this.window = () => win;
      let search = win.location.search.trim().substring(1);
      this.arguments = search.split("/").map(t => decodeURI(t));
      if (configs) {
        this.arguments = configs.map(o  => JSON.stringify(o)).concat(this.arguments);
      }
      this.requestAnimationFrame = (callback) => win.requestAnimationFrame(callback);
      this.cancelAnimationFrame = (handle) => win.cancelAnimationFrame(handle);
    };
  };
}

/** @sk env html */
export function environment(configs?: Array<any>) {
  let global = (typeof window == "undefined") ? self : window;
  return new Env(global, navigator, configs)
}