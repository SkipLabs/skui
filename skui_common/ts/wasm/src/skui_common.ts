import type {
  int,
  ptr,
  Links,
  Utils,
  ToWasmManager,
  Shared,
  Environment,
  Nullable,
} from "@skip-wasm/std";
import type * as Internal from "./internal.js";

interface ToWasm {
  SKIP_IO_isExternalBinary: (id: int) => boolean;
  SKIP_IO_deleteExternalData: (id: int) => void;
  SKIP_IO_getExternalText: (id: int) => Nullable<ptr<Internal.String>>;
  SKIP_IO_getExternalBytes: (
    id: int
  ) => Nullable<ptr<Internal.Array<Internal.Byte>>>;
}

export class CommonShared implements Shared {
  getName = () => "common";

  constructor(public registerData: (data: string | Uint8Array) => void) {}
}

class State {
  dataId = 0;
  data = new Map<int, Data>();

  registerData = (data: string | Uint8Array) => {
    const id = ++this.dataId;
    this.data.set(id, new Data(data));
  };
}

class Data {
  data: string | Uint8Array;

  constructor(data: string | Uint8Array) {
    this.data = data;
  }
  isBinary = () => this.data instanceof Uint8Array;
  getBytes = (
    exportBytes: (view: Uint8Array) => ptr<Internal.Array<Internal.Byte>>
  ) => {
    if (this.data instanceof Uint8Array) {
      return exportBytes(this.data);
    }
    return null;
  };

  getText = (utils: Utils) => {
    if (typeof this.data == "string") {
      return utils.exportString(this.data);
    }
    return null;
  };
}

class LinksImpl implements Links, ToWasm {
  env: Environment;

  constructor(env: Environment) {
    this.env = env;
  }

  state = new State();

  SKIP_IO_isExternalBinary!: (id: int) => boolean;
  SKIP_IO_deleteExternalData!: (id: int) => void;
  SKIP_IO_getExternalText!: (id: int) => Nullable<ptr<Internal.String>>;
  SKIP_IO_getExternalBytes!: (
    id: int
  ) => Nullable<ptr<Internal.Array<Internal.Byte>>>;

  complete = (utils: Utils, _exports: object) => {
    this.SKIP_IO_isExternalBinary = (id: int) => {
      const data = this.state.data.get(id);
      if (data) {
        return data.isBinary();
      }
      return false;
    };
    this.SKIP_IO_deleteExternalData = (id: int) => {
      this.state.data.delete(id);
    };
    this.SKIP_IO_getExternalText = (id: int) => {
      const data = this.state.data.get(id);
      if (data) {
        return data.getText(utils);
      }
      return null;
    };
    this.SKIP_IO_getExternalBytes = (id: int) => {
      const data = this.state.data.get(id);
      if (data) {
        return data.getBytes(utils.exportBytes);
      }
      return null;
    };
    this.env.shared.set("common", new CommonShared(this.state.registerData));
  };
}

class Manager implements ToWasmManager {
  env: Environment;

  constructor(env: Environment) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    const toWasm = wasm as ToWasm;
    const links = new LinksImpl(this.env);
    toWasm.SKIP_IO_isExternalBinary =
      links.SKIP_IO_isExternalBinary.bind(links);
    toWasm.SKIP_IO_deleteExternalData =
      links.SKIP_IO_deleteExternalData.bind(links);
    toWasm.SKIP_IO_getExternalText = links.SKIP_IO_getExternalText.bind(links);
    toWasm.SKIP_IO_getExternalBytes =
      links.SKIP_IO_getExternalBytes.bind(links);
    return links;
  };
}

export function init(env: Environment) {
  return Promise.resolve(new Manager(env));
}
