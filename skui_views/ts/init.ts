import {int, Environment, start, toBeDefined, Shared} from "#skui_base/types";

var textDecoder = new TextDecoder('utf8');

class Env implements Environment {
  c : HTMLCanvasElement;
  valid: boolean;
  timestamp = () => window.performance.now();
  window = () => window;
  canvas = () => {
    if (!this.c) {
      this.c = document.getElementById("skui_canvas") as HTMLCanvasElement;
    }
    return this.c;
  }
  clipboard = () => navigator.clipboard;
  readData : (url: URL) => Promise<ArrayBuffer> = (url: URL) => fetch(url).then(ab => ab.arrayBuffer());
  decodeUTF8 = textDecoder.decode;
  onException: () => void = () => {
    this.valid = false;
  }
  storage = () => localStorage;
  update : () => void;
  render : () => void;
  setGlContext : (id: int) => void;
  manageMessage : (msg: string) => void;
  complete(exports: object, shared: Map<string,Shared>) {
    this.update = () => toBeDefined("Env.update");
    this.render = () => toBeDefined("Env.render");
    this.setGlContext = (id: int) => toBeDefined("Env.setGlContext");
    this.manageMessage = (msg: string) => toBeDefined("Env.manageMessage");
  }
}

var modules = ["./skip.mjs", "./common.mjs", "./regexp.mjs", "./webgl.mjs"];

//base64 | tr '/+' '_-' | tr -d '=' | tr -d \\n

var path = new URL("./sui_views.wasm");
var env = new Env();

start(modules, path, env);
