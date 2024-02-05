import type { Environment } from "#std/sk_types.js";

export interface GLEnv extends Environment {
  clipboard: () => Clipboard | null | undefined;
  window: () => Window;
  canvas: () => HTMLCanvasElement;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
  update: () => void;
}

/** @sk env browser */
export function complete(env: Environment) {
  let glenv = env as GLEnv;
  let global = typeof window == "undefined" ? self : window;
  glenv.clipboard = () => navigator.clipboard;
  if ("location" in global) {
    let win = global as Window;
    glenv.window = () => win;
    glenv.requestAnimationFrame = (callback) =>
      win.requestAnimationFrame(callback);
    glenv.cancelAnimationFrame = (handle) => win.cancelAnimationFrame(handle);
    let window = glenv.window();
    let document = glenv.window().document;
    let container = document.getElementById("skui_container") as HTMLElement;
    container = container ? container : document.body;
    let texthook = document.getElementById("skui_texthook");
    if (!texthook) {
      texthook = document.createElement("textarea");
      texthook.id = "skui_texthook";
      container.appendChild(texthook);
    }
    let canvas = document.getElementById("skui_canvas") as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement("canvas");
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
    glenv.canvas = () => canvas;
  }
}
