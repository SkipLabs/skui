import {int, ptr, Environment, Links, Utils, ToWasmManager, Shared, l, f, check, Text, Raw} from "#skui_base/skui_types";

interface Exported {
  SKIP_UiEnginePicture_register: (id: int, width: int, height: int) => void;
  SKIP_UiEnginePicture_unregister: (id: int) => void;
  SKIP_UiEnginePicture_resized: (id: int, width: int, height: int, result: int, error: ptr | null) => void;
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

async function resize(
  document: Document,
  image: HTMLImageElement,
  width: int, 
  height: int,
  then: (img: HTMLImageElement) => void,
  otherwise: (msg: Text | string) => void
) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d');
  if (ctx && image != null) {
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
    let rImage = new Image();
    rImage.onload = () => then(rImage);
    rImage.onerror = () => otherwise(l("image load failed"));
    rImage.src = canvas.toDataURL();
  } else {
    otherwise(l("2D context cannot be retrieved"))
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
  images = new Map<int,HTMLImageElement>();

  register = (image: HTMLImageElement) => {
    let id = ++this.imgId;
    this.images.set(id, image);
    return id;
  }

  delete = (id : int) => {
    this.images.delete(id);
  }

  get = (id : int) => {
    return this.images.get(id);
  }
}

class LinksImpl implements Links, ToWasm {
  state: State;
  env: Env | undefined;

  constructor(env?: Env) {
    this.state = new State();
    this.env = env;
  }

  SKIP_UiEnginePicture_delete: (id: int) => void;
  SKIP_UiEnginePicture_resize: (id: int, width: int, height: int) => void;
  
  SKIP_UiEnginePicture_asTexture = (id: int, ctx: int) => {
    let image = this.env ? this.state.get(id) : null;
    if (image) {
      return this.env!.imageAsTexture(ctx, image);
    } {
      return  0;
    }
  };

  complete = (utils: Utils, exports: object) => {
    let exported = exports as Exported;
    this.SKIP_UiEnginePicture_delete = (id: int) => {
      this.state.delete(id);
    }
    this.SKIP_UiEnginePicture_resize = (id: int, width: int, height: int) => {
      let notify = (img: int | null, msg: Text | null) => {
        utils.runWithGc(() => {
          let skError = null;
          if (msg) {
            let format = l("Unable to resize image: {1}.");
            let message = f(format, [msg]);
            skError = utils.exportLocale(message);
          }
          exported.SKIP_UiEnginePicture_resized(id, width, height, img ? img : 0, skError)
        });
      };
      if (this.env) {
        let image = this.state.get(id);
        if (image) {
          resize(
            this.env.window().document,
            image, width, height,
            img => {
              let imgId = this.state.register(img);
              exported.SKIP_UiEnginePicture_register(imgId, img.width, img.height);
              notify(imgId, null);
            },
            msg => {
              notify(null, check(msg));
            }
          );
        } else {
          notify(null, f(l("Image not found {1}"), [new Raw('' + id)]));
        }
      } else {
        notify(null,l("Environment not initialized"));
      }
    }
    return new PictureShared(
      (img: HTMLImageElement) => {
        let imgId = this.state.register(img);
        exported.SKIP_UiEnginePicture_register(imgId, img.width, img.height);
        return imgId;
      },
      (id: int) => {
        exported.SKIP_UiEnginePicture_unregister(id);
      }
    );
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
    toWasm.SKIP_UiEnginePicture_delete =  (id: int) => links.SKIP_UiEnginePicture_delete(id);
    toWasm.SKIP_UiEnginePicture_resize =  (id: int, width: int, height: int) => links.SKIP_UiEnginePicture_resize(id, width, height);
    toWasm.SKIP_UiEnginePicture_asTexture =  (id: int, ctx: int) => links.SKIP_UiEnginePicture_asTexture(id, ctx);
    return links;
  }
}

/** @sk init */
export function init(env?: Environment) {
  return Promise.resolve(new Manager(env ? env as Env : undefined));
}