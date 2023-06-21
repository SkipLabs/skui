import { float, int, Environment, Shared } from "#skui_base/skui_types";

interface Views extends Shared {
  update: () => void;
}

interface Webgl extends Shared {
  start: (wId: int) => Promise<int>;
  imageAsTexture: (ctx: int, image: HTMLImageElement) => int;
}

class Env implements Environment {
  timestamp: () => float;
  window: () => Window;
  canvas: () => HTMLCanvasElement;
  clipboard: () => Clipboard;
  decodeUTF8: (utf8: Uint8Array) => string;
  storage: () => Storage;
  onException: () => void;
  appendTextTo: (name: string, content: string) => void;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
  base64Decode: (base64: String) => Uint8Array;
  update: () => void;
  start: (wId: int) => Promise<int>;
  imageAsTexture: (ctx: int, image: HTMLImageElement) => int;
  arguments: Array<string>;
  configs?: Array<any>;
  throwRuntime = (code: int) => {
    this.onException();
    if (code != 0) {
      throw new Error("Error with code: " + code);
    }
  }

  constructor(window: Window, navigator: Navigator, configs?: Array<any>) {
    this.configs = configs;
    this.timestamp = () => window.performance.now();
    let container = window.document.getElementById("skui_container") as HTMLElement;
    container = container ? container : document.body;
    let texthook = window.document.getElementById("skui_texthook");
    if (!texthook) {
      texthook = window.document.createElement("textarea");
      texthook.id = "skui_texthook";
      container.appendChild(texthook);
    }
    let canvas = window.document.getElementById("skui_canvas") as HTMLCanvasElement;
    if (!canvas) {
      canvas = window.document.createElement("canvas");
      canvas.id = "skui_canvas";
      container.appendChild(canvas);
    }
    canvas.style.overflow = "hidden";
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    let width = Math.trunc(window.innerWidth);
    let height = Math.trunc(window.innerHeight);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    this.window = () => window;
    this.canvas = () => canvas;
    this.clipboard = () => navigator.clipboard;
    var decoder = new TextDecoder('utf8');
    this.decodeUTF8 = (utf8: Uint8Array) => decoder.decode(utf8);
    this.base64Decode = (base64: string) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));;
    this.storage = () => localStorage;
    this.onException = () => { };
    let search = window.location.search.trim().substring(1);
    this.arguments = search.split("/").map(t => decodeURI(t));
    if (configs) {
      this.arguments = configs.map(o  => JSON.stringify(o)).concat(this.arguments);
    }
    this.appendTextTo = (name: string, content: string) => {
      let temp = localStorage.getItem(name);
      content = temp ? temp + content : content;
      localStorage.setItem(name, content);
    };
    this.requestAnimationFrame = (callback) => window.requestAnimationFrame(callback);
    this.cancelAnimationFrame = (handle) => window.cancelAnimationFrame(handle);
  };
  complete = (exports, shared: Map<string, Shared>) => {
    let views = shared.get("views");
    if (views) {
      this.update = (views as Views).update;
    }
    let webgl = shared.get("webgl");
    if (webgl) {
      this.start = (webgl as Webgl).start;
      this.imageAsTexture = (webgl as Webgl).imageAsTexture;
    }
    exports.skip_main();
  }
}

/** @sk env html */
export function environment(configs?: Array<any>) {
  return new Env(window, navigator, configs)
}