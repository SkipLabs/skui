import {int, Environment, Links, Utils, ToWasmManager} from "#std/sk_types";

interface ToWasm {
  SKIP_FWK_applyCursor: (wId: int, cursor: int) => void;
  SKIP_FWK_update: (wId: int) => void;
}

interface Env extends Environment {
  canvas: () => HTMLCanvasElement;
  update: () => void;
}

class LinksImpl implements Links, ToWasm {
  
  env: Env | undefined; 

  constructor(env?: Env) {
    this.env = env;
  }

  SKIP_FWK_applyCursor =  (wId: int, code: int) => {
    let cursor = "default";
    switch (code) {
      case 0: cursor = "none"; break;
      case 1: cursor = "default"; break;
      case 2: cursor = "pointer"; break;
      case 3: cursor = "grab"; break;
      case 4: cursor = "grabbing"; break;
      case 5: cursor = "crosshair"; break;
      case 6: cursor = "none"; break;
      case 7: cursor = "move"; break;
      case 8: cursor = "n-resize"; break;
      case 9: cursor = "ne-resize"; break;
      case 10: cursor = "e-resize"; break;
      case 11: cursor = "se-resize"; break;
      case 12: cursor = "s-resize"; break;
      case 13: cursor = "sw-resize"; break;
      case 14: cursor = "w-resize"; break;
      case 15: cursor = "nw-resize"; break;
      case 16: cursor = "col-resize"; break;
      case 17: cursor = "row-resize"; break;
      case 18: cursor = "text"; break;
      case 19: cursor = "wait"; break;
      case 20: cursor = "not-allowed"; break;
      case 21: cursor = "cell"; break;
      case 22: cursor = "help"; break;
      case 23: cursor = "copy"; break;
      case 24: cursor = "alias"; break;
      case 25: cursor = "move"; break;
      case 26: cursor = "no-drop"; break;
      case 27: cursor = "help"; break;
    };
    if (this.env) {
      this.env.canvas().style.cursor = cursor;
    } else {
      console.log(["Apply cursor", cursor])
    }
  }
  SKIP_FWK_update: (wId: int) => void;
  
  complete = (utils: Utils, exports: object) => {
    this.SKIP_FWK_update = (wId: int) => {
      if (this.env) {
        this.env.update()
      } else {
        console.log("Update")
      }
    };
    return null;
  }
}

class Manager implements ToWasmManager {
  env:  Env | undefined;

  constructor(env?:  Env) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl(this.env);
    toWasm.SKIP_FWK_applyCursor =  (wId: int, code: int) => links.SKIP_FWK_applyCursor(wId,code);
    toWasm.SKIP_FWK_update =  (wId: int) => links.SKIP_FWK_update(wId);
    return links;
  }
}

/** @sk init */
export function init(env?: Environment) {
  return Promise.resolve(new Manager(env ? env as Env : undefined));
}