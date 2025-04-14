import type {
  int,
  ptr,
  Environment,
  Links,
  Utils,
  ToWasmManager,
  Shared,
  Nullable,
} from "../skipwasm-std/index.js";
import {
  SkuiUtils,
  type Text,
  l,
  f,
  check,
  Raw,
} from "../skui-base/skui_types.js";
import type * as Internal from "./internal.js";

interface Exported {
  SKIP_UiEnginePicture_register: (id: int, width: int, height: int) => void;
  SKIP_UiEnginePicture_unregister: (id: int) => void;
  SKIP_UiEnginePicture_resized: (
    id: int,
    width: int,
    height: int,
    result: int,
    error: Nullable<ptr<Internal.I18NText>>
  ) => void;
}

interface ToWasm {
  SKIP_UiEnginePicture_delete: (id: int) => void;
  SKIP_UiEnginePicture_resize: (id: int, width: int, height: int) => void;
  SKIP_UiEnginePicture_asTexture: (id: int, ctx: int) => int;
}

interface Env extends Environment {
  window: () => Window;
  imageAsTexture: (ctx: int, image: HTMLImageElement) => int;
}

function resize(
  document: Document,
  image: HTMLImageElement,
  width: int,
  height: int,
  then: (img: HTMLImageElement) => void,
  otherwise: (msg: Text | string) => void
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ctx && image != null) {
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
    const rImage = new Image();
    rImage.onload = () => then(rImage);
    rImage.onerror = () => otherwise(l("image load failed"));
    rImage.src = canvas.toDataURL();
  } else {
    otherwise(l("2D context cannot be retrieved"));
  }
}

export class PictureShared implements Shared {
  getName = () => "picture";
  register: (image: HTMLImageElement) => int;
  unregister: (id: int) => void;

  constructor(
    register: (image: HTMLImageElement) => int,
    unregister: (id: int) => void
  ) {
    this.register = register;
    this.unregister = unregister;
  }
}

class State {
  imgId = 0;
  images = new Map<int, HTMLImageElement>();

  register(image: HTMLImageElement) {
    const id = ++this.imgId;
    this.images.set(id, image);
    return id;
  }

  delete(id: int) {
    this.images.delete(id);
  }

  get(id: int) {
    return this.images.get(id);
  }
}

class LinksImpl implements Links, ToWasm {
  state: State;
  env?: Env;

  constructor(env?: Env) {
    this.state = new State();
    this.env = env;
  }

  SKIP_UiEnginePicture_delete!: (id: int) => void;
  SKIP_UiEnginePicture_resize!: (id: int, width: int, height: int) => void;

  SKIP_UiEnginePicture_asTexture = (id: int, ctx: int) => {
    const image = this.env ? this.state.get(id) : null;
    if (image) {
      return this.env!.imageAsTexture(ctx, image);
    }
    return 0;
  };

  complete = (utils: Utils, exports: object) => {
    const skuiUtils = new SkuiUtils(utils, exports);
    const exported = exports as Exported;
    this.SKIP_UiEnginePicture_delete = (id: int) => {
      this.state.delete(id);
    };
    this.SKIP_UiEnginePicture_resize = (id: int, width: int, height: int) => {
      const notify = (img: int | null, msg: Text | null) => {
        utils.runWithGc(() => {
          let skError: Nullable<ptr<Internal.I18NText>> = null;
          if (msg) {
            const format = l("Unable to resize image: {1}.");
            const message = f(format, [msg]);
            skError = skuiUtils.exportLocale(message);
          }
          exported.SKIP_UiEnginePicture_resized(
            id,
            width,
            height,
            img ? img : 0,
            skError
          );
        });
      };
      if (this.env) {
        const image = this.state.get(id);
        if (image) {
          resize(
            this.env.window().document,
            image,
            width,
            height,
            (img) => {
              const imgId = this.state.register(img);
              exported.SKIP_UiEnginePicture_register(
                imgId,
                img.width,
                img.height
              );
              notify(imgId, null);
            },
            (msg) => {
              notify(null, check(msg));
            }
          );
        } else {
          notify(null, f(l("Image not found {1}"), [new Raw(id.toString())]));
        }
      } else {
        notify(null, l("Environment not initialized"));
      }
    };
    if (this.env) {
      this.env.shared.set(
        "picture",
        new PictureShared(
          (img: HTMLImageElement) => {
            const imgId = this.state.register(img);
            exported.SKIP_UiEnginePicture_register(
              imgId,
              img.width,
              img.height
            );
            return imgId;
          },
          (id: int) => {
            exported.SKIP_UiEnginePicture_unregister(id);
          }
        )
      );
    }
  };
}

class Manager implements ToWasmManager {
  env: Env | undefined;

  constructor(env?: Env) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    const toWasm = wasm as ToWasm;
    const links = new LinksImpl(this.env);
    toWasm.SKIP_UiEnginePicture_delete =
      links.SKIP_UiEnginePicture_delete.bind(links);
    toWasm.SKIP_UiEnginePicture_resize =
      links.SKIP_UiEnginePicture_resize.bind(links);
    toWasm.SKIP_UiEnginePicture_asTexture =
      links.SKIP_UiEnginePicture_asTexture.bind(links);
    return links;
  };
}

export function init(env?: Environment) {
  return Promise.resolve(new Manager(env ? (env as Env) : undefined));
}
