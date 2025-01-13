import type { Environment } from "@skip-wasm/std";

export interface GLEnv extends Environment {
  clipboard: () => Clipboard | null | undefined;
  window: () => Window;
  canvas: () => HTMLCanvasElement;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
  update: () => void;
}

export function complete(env: Environment) {
  const glenv = env as GLEnv;
  const global = typeof window == "undefined" ? self : window;
  glenv.clipboard = () => navigator.clipboard;
  if ("location" in global) {
    const win = global as Window;
    glenv.window = () => win;
    glenv.requestAnimationFrame = (callback) =>
      win.requestAnimationFrame(callback);
    glenv.cancelAnimationFrame = (handle) => win.cancelAnimationFrame(handle);
    const window = glenv.window();
    const document = glenv.window().document;
    let container = document.getElementById("skui_container");
    container = container ? container : document.body;
    let texthook = document.getElementById("skui_texthook");
    if (!texthook) {
      texthook = document.createElement("textarea");
      texthook.id = "skui_texthook";
      container.appendChild(texthook);
    }
    let elem = document.getElementById("skui_canvas");
    if (!elem) {
      elem = document.createElement("canvas");
      elem.id = "skui_canvas";
      container.appendChild(elem);
    }
    const canvas = elem as HTMLCanvasElement;
    canvas.style.overflow = "hidden";
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    const width = Math.trunc(window.innerWidth);
    const height = Math.trunc(window.innerHeight);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width.toString() + "px";
    canvas.style.height = height.toString() + "px";
    glenv.canvas = () => canvas;
  }
}
