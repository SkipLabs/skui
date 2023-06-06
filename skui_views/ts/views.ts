import {int, ptr, Environment, Links, Utils, ToWasmManager, Shared} from "#skui_base/types";

type MouseEventManager = (
  wId: int, type: int,
  altKey: boolean, ctrlKey: boolean, shiftKey: boolean, metaKey: boolean,
  button: int, detail: int,
  clientX: int, clientY: int, screenX: int, screenY: int,
  movementX: int, movementY: int
) => void;

type KeyboardEventManager = (
  wId: int, evtType: int,
  strCodePtr: ptr, strKeyPtr: ptr,
  repeat: boolean,
  capsLock: boolean, numLock: boolean, scrollLock: boolean,
  ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean,
) => void;

type WheelEventManager = (
  wId: int, 
  deltaX: int, deltaY: int, deltaZ: int,
  ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean,
) => void;

interface Env extends Environment {
  clipboard: () => Clipboard | null | undefined;
  storage: () => Storage;
}

export class ViewsShared implements Shared {
  getName = () => "views";
  update: () => void;

  constructor(update: () => void) {
    this.update = update;
  }
}

export interface Exported {
  SKIP_SkuiViews_update: () => void;
  SKIP_SKUIJS_windowInitialized: (wId: int) => void;
  SKIP_SKUIJS_manageMouseEvent: MouseEventManager
  SKIP_SKUIJS_manageWheelEvent: WheelEventManager
  SKIP_SKUIJS_manageKeyboardEvent: KeyboardEventManager
  SKIP_SKUIJS_clearKeyboardEvent: (wId: int) => void;
  SKIP_SKUIJS_manageResize: (wId: int, width: int, height: int) => void;
  SKIP_SKUIJS_performPaste: (wId: int, mimeType: ptr, data: ptr) => void;
}

interface ToWasm {
  SKIP_SKUIJS_sendMessage: (wId: int, message: ptr, async: boolean, delay: int) => void;
  SKIP_SKUIJS_requestClipboard: (wId: int, mimeType: ptr) => void;
  SKIP_SKUIJS_updateClipboard: (wId: int, mimeType: ptr, data: ptr) => void;
}

class LinksImpl implements Links, ToWasm {
  env: Env | undefined;

  constructor(env?: Env) {
    this.env = env;
  }

  SKIP_SKUIJS_sendMessage: (wId: int, message: ptr, async: boolean, delay: int) => void;
  SKIP_SKUIJS_requestClipboard: (wId: int, mimeType: ptr) => void;
  SKIP_SKUIJS_updateClipboard: (wId: int, mimeType: ptr, data: ptr) => void;
  performPaste: (wId: int, mimeType: string, data: string) => void;
  
  complete = (utils: Utils, exports: object) => {
    let exported = exports as Exported;
    this.SKIP_SKUIJS_sendMessage = (wId: int, message: ptr, async: boolean, delay: int) => {
      let strMessage = utils.importString(message);
      delay = delay ? delay : 0;
      // TODO manage async
      if (this.env) {
        setTimeout(utils.manageMessage, Math.max(delay, 0), strMessage);
      } else {
        console.log(["Message sent", strMessage, delay]);
      }
    };
    this.performPaste = (wId: int, strMimeType: string, strData: string) => {
      utils.runWithGc(function () {
        exported.SKIP_SKUIJS_performPaste(
          wId,
          utils.exportString(strMimeType),
          utils.exportString(strData),
        );
      });
    };
    this.SKIP_SKUIJS_requestClipboard = (wId: int, mimeType: ptr) => {
      let clipboard = this.env ? this.env.clipboard() : null;
      let strMimeType = utils.importString(mimeType);
      if (strMimeType.startsWith("text/plain") && clipboard) {
        clipboard.readText().then(
          clipText => setTimeout(this.performPaste, 0, wId, strMimeType, clipText)
        );
      } else {
        let strData = localStorage.getItem("clipboard:" + strMimeType);
        if (strData) {
          setTimeout(this.performPaste, 0, wId, strMimeType, strData)
        }
      }
    };
    this.SKIP_SKUIJS_updateClipboard  = (wId: int, mimeType: ptr, data: ptr) => {
      let clipboard = this.env ? this.env.clipboard() : null;
      let strMimeType = utils.importString(mimeType);
      let strData = utils.importString(data);
      if (strMimeType.startsWith("text/plain") && clipboard) {
        clipboard.writeText(strData);
        if (!clipboard.readText) {
          localStorage.setItem("clipboard:" + strMimeType, strData);
        }
      } else {
        localStorage.setItem("clipboard:" + strMimeType, strData);
      }
    };
    return new ViewsShared(exported.SKIP_SkuiViews_update);
  }
}

class Manager implements ToWasmManager {
  env: Env | undefined;

  constructor(env?: Env) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl(this.env);
    toWasm.SKIP_SKUIJS_sendMessage =  (wId: int, message: ptr, async: boolean, delay: int) => links.SKIP_SKUIJS_sendMessage(wId, message, async, delay);
    toWasm.SKIP_SKUIJS_requestClipboard =  (wId: int, mimeType: ptr) => links.SKIP_SKUIJS_requestClipboard(wId, mimeType);
    toWasm.SKIP_SKUIJS_updateClipboard =  (wId: int, mimeType: ptr, data: ptr) => links.SKIP_SKUIJS_updateClipboard(wId, mimeType, data);
    return links;
  }
}

export function init(env?: Environment) {
  return Promise.resolve(new Manager(env ? env as Env : undefined));
}

