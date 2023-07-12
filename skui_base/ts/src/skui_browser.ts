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
  

  constructor(window: Window, navigator: Navigator, configs?: Array<any>) {
    this.fileSystem = new MemFS();
    this.configs = configs;
    this.timestamp = () => window.performance.now();
    this.window = () => window;
    this.clipboard = () => navigator.clipboard;
    var decoder = new TextDecoder('utf8');
    this.decodeUTF8 = (utf8: ArrayBuffer) => decoder.decode(utf8);
    var encoder = new TextEncoder(); // always utf-8
    this.encodeUTF8 = (str: string) =>  encoder.encode(str);
    this.base64Decode = (base64: string) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));;
    this.storage = () => localStorage;
    this.onException = () => { };
    let search = window.location.search.trim().substring(1);
    this.arguments = search.split("/").map(t => decodeURI(t));
    if (configs) {
      this.arguments = configs.map(o  => JSON.stringify(o)).concat(this.arguments);
    }
    this.requestAnimationFrame = (callback) => window.requestAnimationFrame(callback);
    this.cancelAnimationFrame = (handle) => window.cancelAnimationFrame(handle);
  };
}

/** @sk env html */
export function environment(configs?: Array<any>) {
  return new Env(window, navigator, configs)
}