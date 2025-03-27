import type {
  int,
  ptr,
  Environment,
  Links,
  ToWasmManager,
  Nullable,
} from "../skipwasm-std/index.js";

import { Utils } from "../skipwasm-std/index.js";

import type * as Internal from "../skiplang-std/internal.js";

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
  metaKey: boolean
) => void;

type KeyboardEventManager = (
  wId: int,
  evtType: int,
  strCodePtr: ptr<Internal.String>,
  strKeyPtr: ptr<Internal.String>,
  repeat: boolean,
  capsLock: boolean,
  numLock: boolean,
  scrollLock: boolean,
  ctrlKey: boolean,
  shiftKey: boolean,
  altKey: boolean,
  metaKey: boolean
) => void;

type WheelEventManager = (
  wId: int,
  deltaX: int,
  deltaY: int,
  deltaZ: int,
  ctrlKey: boolean,
  shiftKey: boolean,
  altKey: boolean,
  metaKey: boolean
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
    ratio: int
  ) => void;
  SKIP_SKUIJS_performPaste: (
    wId: int,
    mimeType: ptr<Internal.String>,
    data: ptr<Internal.String>
  ) => void;
  SKIP_SKUIMessage_manage: (skMsg: ptr<Internal.String>) => void;
}

interface ToWasm {
  SKIP_SKUIJS_sendMessage(
    wId: int,
    message: ptr<Internal.String>,
    async: boolean,
    delay: int
  ): void;
  SKIP_SKUIJS_requestClipboard(wId: int, mimeType: ptr<Internal.String>): void;
  SKIP_SKUIJS_updateClipboard(
    wId: int,
    mimeType: ptr<Internal.String>,
    data: ptr<Internal.String>
  ): void;
  SKIP_SKUIJS_init(wId: int, skTitle: ptr<Internal.String>): void;
  SKIP_SKUIJS_display(
    skOutput: Nullable<ptr<Internal.String>>,
    skError: Nullable<ptr<Internal.String>>,
    html: boolean
  ): void;
}

class LinksImpl implements Links, ToWasm {
  private utils!: Utils;
  private exported!: Exported;

  constructor(private env?: Env) {}

  complete(utils: Utils, exports: object) {
    this.utils = utils;
    this.exported = exports as Exported;

    if (this.env) {
      this.env.update = this.update.bind(this);
    }
  }

  SKIP_SKUIJS_sendMessage(
    _wId: int,
    message: ptr<Internal.String>,
    _async: boolean,
    delay: int
  ) {
    const strMessage = this.utils.importString(message);
    delay = delay ? delay : 0;
    // TODO manage async
    const manageMessage = (message: string) => {
      this.utils.runWithGc(() =>
        this.exported.SKIP_SKUIMessage_manage(this.utils.exportString(message))
      );
    };
    if (this.env) {
      setTimeout(manageMessage, Math.max(delay, 0), strMessage);
    } else {
      console.log(["Message sent", strMessage, delay]);
    }
  }

  SKIP_SKUIJS_requestClipboard(wId: int, mimeType: ptr<Internal.String>) {
    const clipboard = this.env?.clipboard();
    const strMimeType = this.utils.importString(mimeType);
    if (strMimeType.startsWith("text/plain") && clipboard) {
      clipboard
        .readText()
        .then((clipText) =>
          setTimeout(
            this.performPaste.bind(this),
            0,
            wId,
            strMimeType,
            clipText
          )
        )
        .catch((reason: unknown) => console.log(reason));
    } else {
      const strData = localStorage.getItem("clipboard:" + strMimeType);
      if (strData) {
        setTimeout(this.performPaste.bind(this), 0, wId, strMimeType, strData);
      }
    }
  }

  SKIP_SKUIJS_updateClipboard(
    _wId: int,
    mimeType: ptr<Internal.String>,
    data: ptr<Internal.String>
  ) {
    const clipboard = this.env ? this.env.clipboard() : null;
    const strMimeType = this.utils.importString(mimeType);
    const strData = this.utils.importString(data);
    if (strMimeType.startsWith("text/plain") && clipboard) {
      clipboard
        .writeText(strData)
        .catch((reason: unknown) => console.log(reason));
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!clipboard.readText) {
        localStorage.setItem("clipboard:" + strMimeType, strData);
      }
    } else {
      localStorage.setItem("clipboard:" + strMimeType, strData);
    }
  }

  SKIP_SKUIJS_init(wId: int, title: ptr<Internal.String>) {
    if (this.env) {
      const strTitle = this.utils.importString(title);
      this.env.window().document.title = strTitle;
      this.manageEvents(wId);
      this.synchronizeWindowSize((width: int, height: int, ratio: int) =>
        this.exported.SKIP_SKUIJS_manageResize(wId, width, height, ratio)
      );
      this.env
        .start(wId)
        .then((_cId) => this.exported.SKIP_SKUIJS_windowInitialized(wId))
        .catch((e: unknown) => console.error(e));
    }
  }

  SKIP_SKUIJS_display(
    skOutput: Nullable<ptr<Internal.String>>,
    skError: Nullable<ptr<Internal.String>>,
    html: boolean
  ) {
    if (this.env) {
      const strOutput = skOutput ? this.utils.importString(skOutput) : null;
      const strError = skError ? this.utils.importString(skError) : null;
      const window = this.env.window();
      let container = window.document.getElementById("skui_container");
      container = container ? container : document.body;
      if (strError != null) {
        const div = document.createElement("div");
        div.innerHTML = html ? strError : strError.replaceAll("\n", "<br>");
        div.style.fontSize = "16px";
        div.style.fontWeight = "bold";
        div.style.paddingLeft = "30px";
        container.appendChild(div);
      }
      if (strOutput != null) {
        const div = document.createElement("div");
        div.innerHTML = html ? strOutput : strOutput.replaceAll("\n", "<br>");
        div.style.fontSize = "16px";
        container.appendChild(div);
      }
      const canvas = window.document.getElementById("skui_canvas");
      if (canvas) canvas.style.display = "none";
      const texthook = window.document.getElementById("skui_texthook");
      if (texthook) texthook.style.display = "none";
    }
  }

  private update() {
    if (this.env) {
      this.env.window().setTimeout(this.exported.SKIP_SkuiViews_update, 0);
    }
  }

  private performPaste(wId: int, strMimeType: string, strData: string) {
    this.utils.runWithGc(() => {
      this.exported.SKIP_SKUIJS_performPaste(
        wId,
        this.utils.exportString(strMimeType),
        this.utils.exportString(strData)
      );
    });
  }

  private manageEvents(wId: int) {
    const window = this.env ? this.env.window() : null;
    if (window) {
      const texthook = window.document.getElementById("skui_texthook");
      if (texthook) {
        // TODO Manage correctly text area focus
        texthook.focus();
        texthook.addEventListener("input", (evt: Event) =>
          this.manageInputEvent(wId, evt as InputEvent)
        );
      }
      //
      window.addEventListener("keydown", (evt: KeyboardEvent) =>
        this.manageKeyboardEvent(wId, evt)
      );
      window.addEventListener("keyup", (evt: KeyboardEvent) =>
        this.manageKeyboardEvent(wId, evt)
      );
      window.addEventListener("contextmenu", this.stopEvent.bind(this));
      //
      window.addEventListener("mousedown", (evt: MouseEvent) =>
        this.manageMouseEvent(wId, evt)
      );
      window.addEventListener("mousemove", (evt: MouseEvent) =>
        this.manageMouseEvent(wId, evt)
      );
      window.addEventListener("mouseup", (evt: MouseEvent) =>
        this.manageMouseEvent(wId, evt)
      );
      //
      window.addEventListener(
        "wheel",
        (evt: WheelEvent) => this.manageWheelEvent(wId, evt),
        { passive: false }
      );
      window.onfocus = () => this.exported.SKIP_SKUIJS_clearKeyboardEvent(wId);
    }
  }

  private manageInputEvent(wId: int, evt: InputEvent) {
    this.stopEvent(evt);
    if (
      evt.inputType == "insertText" ||
      (evt.inputType == "insertCompositionText" && evt.data == "`")
    ) {
      const backQuoteKey = (type: int) => {
        this.utils.runWithGc(() => {
          this.exported.SKIP_SKUIJS_manageKeyboardEvent(
            wId,
            type,
            this.utils.exportString("Space"),
            this.utils.exportString("`"),
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
          );
        });
      };
      // Press '`'
      backQuoteKey(0);
      // Release '`'
      backQuoteKey(2);
    }
  }

  private manageKeyboardEvent(wId: int, evt: KeyboardEvent) {
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
    let key = evt.key;
    let code = evt.code;
    if (evt.altKey && key == "L") {
      code = "Digit6";
      key = "|";
    } else if (evt.altKey && key == "n") {
      key = "~";
    }
    this.utils.runWithGc(() => {
      this.exported.SKIP_SKUIJS_manageKeyboardEvent(
        wId,
        type,
        this.utils.exportString(code),
        this.utils.exportString(key),
        evt.repeat,
        evt.getModifierState("CapsLock"),
        evt.getModifierState("NumLock"),
        evt.getModifierState("ScrollLock"),
        evt.ctrlKey,
        evt.shiftKey,
        evt.altKey,
        evt.metaKey
      );
    });
  }

  private manageWheelEvent(wId: int, evt: WheelEvent) {
    this.stopEvent(evt);
    let deltaX = evt.deltaX;
    let deltaY = evt.deltaY;
    let deltaZ = evt.deltaZ;
    if (evt.deltaMode == 0x01) {
      const scrollLineHeight = 16;
      deltaX *= scrollLineHeight;
      deltaY *= scrollLineHeight;
      deltaZ *= scrollLineHeight;
    }
    this.exported.SKIP_SKUIJS_manageWheelEvent(
      wId,
      deltaX,
      deltaY,
      deltaZ,
      evt.ctrlKey,
      evt.shiftKey,
      evt.altKey,
      evt.metaKey
    );
  }

  private manageMouseEvent(wId: int, evt: MouseEvent) {
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
      this.exported.SKIP_SKUIJS_manageMouseEvent(
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
        evt.metaKey
      );
    }
  }

  private stopEvent(evt: Event) {
    evt.preventDefault();
    if (typeof evt.stopPropagation != "undefined") {
      evt.stopPropagation();
    }
  }

  private synchronizeWindowSize(
    resize: (width: int, height: int, ratio: int) => void
  ) {
    const window = this.env !== undefined ? this.env.window() : null;
    if (window !== null) {
      const fWindow = window;
      const canvas = window.document.getElementById(
        "skui_canvas"
      ) as HTMLCanvasElement;
      const resizeFn = () => {
        const ratio = fWindow.devicePixelRatio || 1;
        const width = Math.trunc(fWindow.innerWidth);
        const height = Math.trunc(fWindow.innerHeight);
        canvas.width = ratio * width;
        canvas.height = ratio * height;
        canvas.style.width = width.toString() + "px";
        canvas.style.height = height.toString() + "px";
        resize(width, height, Math.trunc(ratio * 100));
      };
      fWindow.onresize = resizeFn;
      resizeFn();
    }
  }
}
class Manager implements ToWasmManager {
  env: Env | undefined;

  constructor(env?: Env) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    const toWasm = wasm as ToWasm;
    const links = new LinksImpl(this.env);
    toWasm.SKIP_SKUIJS_sendMessage = links.SKIP_SKUIJS_sendMessage.bind(links);
    toWasm.SKIP_SKUIJS_requestClipboard =
      links.SKIP_SKUIJS_requestClipboard.bind(links);
    toWasm.SKIP_SKUIJS_updateClipboard =
      links.SKIP_SKUIJS_updateClipboard.bind(links);
    toWasm.SKIP_SKUIJS_display = links.SKIP_SKUIJS_display.bind(links);
    toWasm.SKIP_SKUIJS_init = links.SKIP_SKUIJS_init.bind(links);
    return links;
  };
}

export function init(env?: Environment) {
  return Promise.resolve(new Manager(env ? (env as Env) : undefined));
}
