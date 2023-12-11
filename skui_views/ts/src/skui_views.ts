import {
  int,
  ptr,
  Environment,
  Links,
  Utils,
  ToWasmManager,
} from "#std/sk_types";

type MouseEventManager = (
  wId: int,
  type: int,
  button: int,
  detail: int,
  clientX: int,
  clientY: int,
  screenX: int,
  screenY: int,
  movementX: int,
  movementY: int,
  ctrlKey: boolean,
  shiftKey: boolean,
  altKey: boolean,
  metaKey: boolean,
) => void;

type KeyboardEventManager = (
  wId: int,
  evtType: int,
  strCodePtr: ptr,
  strKeyPtr: ptr,
  repeat: boolean,
  capsLock: boolean,
  numLock: boolean,
  scrollLock: boolean,
  ctrlKey: boolean,
  shiftKey: boolean,
  altKey: boolean,
  metaKey: boolean,
) => void;

type WheelEventManager = (
  wId: int,
  deltaX: int,
  deltaY: int,
  deltaZ: int,
  ctrlKey: boolean,
  shiftKey: boolean,
  altKey: boolean,
  metaKey: boolean,
) => void;

interface Env extends Environment {
  clipboard: () => Clipboard | null | undefined;
  storage: () => Storage;
  window: () => Window;
  start: (wId: int) => Promise<int>;
  update: () => void;
}

export interface Exported {
  SKIP_SkuiViews_update: () => void;
  SKIP_SKUIJS_windowInitialized: (wId: int) => void;
  SKIP_SKUIJS_manageMouseEvent: MouseEventManager;
  SKIP_SKUIJS_manageWheelEvent: WheelEventManager;
  SKIP_SKUIJS_manageKeyboardEvent: KeyboardEventManager;
  SKIP_SKUIJS_clearKeyboardEvent: (wId: int) => void;
  SKIP_SKUIJS_manageResize: (
    wId: int,
    width: int,
    height: int,
    ratio: int,
  ) => void;
  SKIP_SKUIJS_performPaste: (wId: int, mimeType: ptr, data: ptr) => void;
  SKIP_SKUIMessage_manage: (skMsg: ptr) => void;
}

interface ToWasm {
  SKIP_SKUIJS_sendMessage: (
    wId: int,
    message: ptr,
    async: boolean,
    delay: int,
  ) => void;
  SKIP_SKUIJS_requestClipboard: (wId: int, mimeType: ptr) => void;
  SKIP_SKUIJS_updateClipboard: (wId: int, mimeType: ptr, data: ptr) => void;
  SKIP_SKUIJS_init: (wId: int, skTitle: ptr) => void;
  SKIP_SKUIJS_display: (
    skOutput: ptr | null,
    skError: ptr | null,
    html: boolean,
  ) => void;
}

class LinksImpl implements Links, ToWasm {
  env: Env | undefined;

  constructor(env?: Env) {
    this.env = env;
  }
  SKIP_SKUIJS_sendMessage: (
    wId: int,
    message: ptr,
    async: boolean,
    delay: int,
  ) => void;
  SKIP_SKUIJS_requestClipboard: (wId: int, mimeType: ptr) => void;
  SKIP_SKUIJS_updateClipboard: (wId: int, mimeType: ptr, data: ptr) => void;
  SKIP_SKUIJS_init: (wId: int, skTitle: ptr) => void;
  SKIP_SKUIJS_display: (
    skOutput: ptr | null,
    skError: ptr | null,
    html: boolean,
  ) => void;
  performPaste: (wId: int, mimeType: string, data: string) => void;
  update: () => void;
  manageEvents: (wId: int) => void;
  manageInputEvent: (wId: int, evt: InputEvent) => void;
  manageKeyboardEvent: (wId: int, evt: KeyboardEvent) => void;
  manageWheelEvent: (wId: int, evt: WheelEvent) => void;
  manageMouseEvent: (wId: int, evt: MouseEvent) => void;
  stopEvent = (evt: Event) => {
    evt.preventDefault();
    if (typeof evt.stopPropagation != "undefined") {
      evt.stopPropagation();
    } else if (typeof evt.cancelBubble != "undefined") {
      evt.cancelBubble = true;
    }
  };
  synchronizeWindowSize = (
    resize: (width: int, height: int, ratio: int) => void,
  ) => {
    let window = this.env ? this.env.window() : null;
    if (window) {
      let fWindow = window;
      let canvas = window.document.getElementById(
        "skui_canvas",
      ) as HTMLCanvasElement;
      let resizeFn = () => {
        let ratio = fWindow.devicePixelRatio || 1;
        let width = Math.trunc(fWindow.innerWidth);
        let height = Math.trunc(fWindow.innerHeight);
        canvas.width = ratio * width;
        canvas.height = ratio * height;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        resize(width, height, Math.trunc(ratio * 100));
      };
      fWindow.onresize = resizeFn;
      resizeFn();
    }
  };
  complete = (utils: Utils, exports: object) => {
    let exported = exports as Exported;
    this.SKIP_SKUIJS_sendMessage = (
      wId: int,
      message: ptr,
      async: boolean,
      delay: int,
    ) => {
      let strMessage = utils.importString(message);
      delay = delay ? delay : 0;
      // TODO manage async
      let manageMessage = (message: string) => {
        utils.runWithGc(() =>
          exported.SKIP_SKUIMessage_manage(utils.exportString(message)),
        );
      };
      if (this.env) {
        setTimeout(manageMessage, Math.max(delay, 0), strMessage);
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
        clipboard
          .readText()
          .then((clipText) =>
            setTimeout(this.performPaste, 0, wId, strMimeType, clipText),
          );
      } else {
        let strData = localStorage.getItem("clipboard:" + strMimeType);
        if (strData) {
          setTimeout(this.performPaste, 0, wId, strMimeType, strData);
        }
      }
    };
    this.SKIP_SKUIJS_updateClipboard = (wId: int, mimeType: ptr, data: ptr) => {
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
    this.SKIP_SKUIJS_init = (wId, title) => {
      if (this.env) {
        let strTitle = utils.importString(title);
        this.env.window().document.title = strTitle;
        this.manageEvents(wId);
        this.synchronizeWindowSize((width: int, height: int, ratio: int) =>
          exported.SKIP_SKUIJS_manageResize(wId, width, height, ratio),
        );
        this.env
          .start(wId)
          .then((cId) => exported.SKIP_SKUIJS_windowInitialized(wId))
          .catch((e) => console.error(e));
      }
    };

    this.SKIP_SKUIJS_display = (
      skOutput: ptr | null,
      skError: ptr | null,
      html: boolean,
    ) => {
      if (this.env) {
        let strOutput = skOutput ? utils.importString(skOutput) : null;
        let strError = skError ? utils.importString(skError) : null;
        let window = this.env.window();
        let container = window.document.getElementById(
          "skui_container",
        ) as HTMLElement;
        container = container ? container : document.body;
        if (strError != null) {
          var div = document.createElement("div");
          div.innerHTML = html ? strError : strError.replaceAll("\n", "<br>");
          div.style.fontSize = "16px";
          div.style.fontWeight = "bold";
          div.style.paddingLeft = "30px";
          document.body.appendChild(div);
        }
        if (strOutput != null) {
          var div = document.createElement("div");
          div.innerHTML = html ? strOutput : strOutput.replaceAll("\n", "<br>");
          div.style.fontSize = "16px";
          document.body.appendChild(div);
        }
        let canvas = window.document.getElementById(
          "skui_canvas",
        ) as HTMLCanvasElement;
        if (canvas) canvas.style.display = "none";
        let texthook = window.document.getElementById(
          "skui_texthook",
        ) as HTMLCanvasElement;
        if (texthook) texthook.style.display = "none";
      }
    };

    this.update = () => {
      if (this.env) {
        this.env.window().setTimeout(exported.SKIP_SkuiViews_update, 0);
      }
    };

    this.manageEvents = (wId: int) => {
      let window = this.env ? this.env.window() : null;
      if (window) {
        let texthook = window.document.getElementById("skui_texthook");
        if (texthook) {
          // TODO Manage correctly text area focus
          texthook.focus();
          texthook.addEventListener("input", (evt: InputEvent) =>
            this.manageInputEvent(wId, evt),
          );
        }
        //
        window.addEventListener("keydown", (evt: KeyboardEvent) =>
          this.manageKeyboardEvent(wId, evt),
        );
        window.addEventListener("keyup", (evt: KeyboardEvent) =>
          this.manageKeyboardEvent(wId, evt),
        );
        window.addEventListener("contextmenu", this.stopEvent);
        //
        window.addEventListener("mousedown", (evt: MouseEvent) =>
          this.manageMouseEvent(wId, evt),
        );
        window.addEventListener("mousemove", (evt: MouseEvent) =>
          this.manageMouseEvent(wId, evt),
        );
        window.addEventListener("mouseup", (evt: MouseEvent) =>
          this.manageMouseEvent(wId, evt),
        );
        //
        window.addEventListener(
          "wheel",
          (evt: WheelEvent) => this.manageWheelEvent(wId, evt),
          { passive: false },
        );
        window.onfocus = () => exported.SKIP_SKUIJS_clearKeyboardEvent(wId);
      }
    };

    this.manageInputEvent = (wId: int, evt: InputEvent) => {
      this.stopEvent(evt);
      if (
        evt.inputType == "insertText" ||
        (evt.inputType == "insertCompositionText" && evt.data == "`")
      ) {
        let backQuoteKey = (type: int) => {
          utils.runWithGc(() => {
            exported.SKIP_SKUIJS_manageKeyboardEvent(
              wId,
              type,
              utils.exportString("Space"),
              utils.exportString("`"),
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
            );
          });
        };
        // Press '`'
        backQuoteKey(0);
        // Release '`'
        backQuoteKey(2);
      }
    };

    this.manageKeyboardEvent = (wId: int, evt: KeyboardEvent) => {
      if (evt.code == "F11" || evt.code == "F12") {
        return;
      }
      this.stopEvent(evt);
      let type: int;
      switch (evt.type) {
        case "keydown":
          type = 0;
          break;
        case "keypress":
          type = 1;
          break;
        case "keyup":
          type = 2;
          break;
        case "contextmenu":
          type = 3;
          break;
        default:
          throw new Error("Unsuported KeyboardEvent type: " + evt.type);
      }
      var key = evt.key;
      var code = evt.code;
      if (evt.altKey && key == "L") {
        code = "Digit6";
        key = "|";
      } else if (evt.altKey && key == "n") {
        key = "~";
      }
      utils.runWithGc(() => {
        exported.SKIP_SKUIJS_manageKeyboardEvent(
          wId,
          type,
          utils.exportString(code),
          utils.exportString(key),
          evt.repeat,
          evt.getModifierState("CapsLock"),
          evt.getModifierState("NumLock"),
          evt.getModifierState("ScrollLock"),
          evt.ctrlKey,
          evt.shiftKey,
          evt.altKey,
          evt.metaKey,
        );
      });
    };

    this.manageWheelEvent = (wId: int, evt: WheelEvent) => {
      this.stopEvent(evt);
      let deltaX = evt.deltaX;
      let deltaY = evt.deltaY;
      let deltaZ = evt.deltaZ;
      if (evt.deltaMode == 0x01) {
        let scrollLineHeight = 16;
        deltaX *= scrollLineHeight;
        deltaY *= scrollLineHeight;
        deltaZ *= scrollLineHeight;
      }
      exported.SKIP_SKUIJS_manageWheelEvent(
        wId,
        deltaX,
        deltaY,
        deltaZ,
        evt.ctrlKey,
        evt.shiftKey,
        evt.altKey,
        evt.metaKey,
      );
    };
    this.manageMouseEvent = (wId: int, evt: MouseEvent) => {
      if (evt.type == "wheel") {
        this.manageWheelEvent(wId, evt as WheelEvent);
        return;
      }
      this.stopEvent(evt);
      if (evt.type != "contextmenu") {
        let type: int;
        switch (evt.type) {
          case "mousemove":
            type = 0;
            break;
          case "mousedown":
            type = 1;
            break;
          case "mouseup":
            type = 2;
            break;
          //case "click": type = 3; break;
          default:
            throw new Error("Unsuported MouseEvent type: " + evt.type);
        }
        exported.SKIP_SKUIJS_manageMouseEvent(
          wId,
          type,
          evt.button,
          evt.detail,
          evt.clientX,
          evt.clientY,
          evt.screenX,
          evt.screenY,
          evt.movementX,
          evt.movementY,
          evt.ctrlKey,
          evt.shiftKey,
          evt.altKey,
          evt.metaKey,
        );
      }
    };
    if (this.env) {
      this.env.update = this.update;
    }
  };
}
class Manager implements ToWasmManager {
  env: Env | undefined;

  constructor(env?: Env) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    // TODO check why that function is needed
    wasm["SKIP_SKUIX11_sendMessage"] = (
      wId: int,
      message: ptr,
      async: boolean,
      delay: int,
    ) => console.log(["SKIP_SKUIX11_sendMessage", wId, message, async, delay]);
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl(this.env);
    toWasm.SKIP_SKUIJS_sendMessage = (
      wId: int,
      message: ptr,
      async: boolean,
      delay: int,
    ) => links.SKIP_SKUIJS_sendMessage(wId, message, async, delay);
    toWasm.SKIP_SKUIJS_requestClipboard = (wId: int, mimeType: ptr) =>
      links.SKIP_SKUIJS_requestClipboard(wId, mimeType);
    toWasm.SKIP_SKUIJS_updateClipboard = (wId: int, mimeType: ptr, data: ptr) =>
      links.SKIP_SKUIJS_updateClipboard(wId, mimeType, data);
    toWasm.SKIP_SKUIJS_display = (
      skOutput: ptr | null,
      skError: ptr | null,
      html: boolean,
    ) => links.SKIP_SKUIJS_display(skOutput, skError, html);
    toWasm.SKIP_SKUIJS_init = (wId: int, skTitle: ptr) =>
      links.SKIP_SKUIJS_init(wId, skTitle);
    return links;
  };
}

/** @sk init */
export function init(env?: Environment) {
  return Promise.resolve(new Manager(env ? (env as Env) : undefined));
}
