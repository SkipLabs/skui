import {int, ptr, Links, Utils, ToWasmManager, Shared, Environment, Memory} from "#std/sk_types";

interface ToWasm {
  SKIP_IO_isExternalBinary: (id: int) => boolean;
  SKIP_IO_deleteExternalData: (id: int) => void;
  SKIP_IO_getExternalText: (id: int) => ptr | null;
  SKIP_IO_getExternalBytes: (id: int) => ptr | null;
}

export class CommonShared implements Shared {
  getName = () => "common";
  registerData: (data: string | Uint8Array) => void;
  constructor(registerData: (data: string | Uint8Array) => void) {
    this.registerData = registerData;
  }
}

class State {
  dataId = 0;
  data = new Map<int,Data>();

  registerData= (data: string | Uint8Array) => {
    let id = ++this.dataId;
    this.data.set(id, new Data(data));
  }
}

class Data {
  data : string | Uint8Array;

  constructor(data : string | Uint8Array) {
    this.data = data;
  }
  isBinary = () => this.data instanceof Uint8Array;
  getBytes = (exportBytes: (view: Uint8Array) => ptr) =>  {
    if (this.data instanceof Uint8Array) {
      return exportBytes(this.data)
    }
    return null;
  };

  getText = (utils: Utils) =>  {
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

  SKIP_IO_isExternalBinary: (id: int) => boolean;
  SKIP_IO_deleteExternalData: (id: int) => void;
  SKIP_IO_getExternalText: (id: int) => ptr | null;
  SKIP_IO_getExternalBytes: (id: int) => ptr | null;

  complete = (utils: Utils, exports: object) => {
    this.SKIP_IO_isExternalBinary = (id: int) => {
      let data = this.state.data.get(id);
      if (data) {
        return data.isBinary();
      }
      return false;
    }
    this.SKIP_IO_deleteExternalData = (id: int) => {
      this.state.data.delete(id);
    }
    this.SKIP_IO_getExternalText = (id: int) => {
      let data = this.state.data.get(id);
      if (data) {
        return data.getText(utils);
      }
      return null;
    }
    this.SKIP_IO_getExternalBytes = (id: int) => {
      let data = this.state.data.get(id);
      if (data) {
        return data.getBytes(utils.exportBytes);
      }
      return null;
    }
    this.env.shared.set("common", new CommonShared(this.state.registerData))
  }
}

class Manager implements ToWasmManager {
  env: Environment;

  constructor(env: Environment) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl(this.env);
    toWasm.SKIP_IO_isExternalBinary =  (id: int) => links.SKIP_IO_isExternalBinary(id);
    toWasm.SKIP_IO_deleteExternalData =  (id: int) => links.SKIP_IO_deleteExternalData(id);
    toWasm.SKIP_IO_getExternalText =  (id: int) => links.SKIP_IO_getExternalText(id);
    toWasm.SKIP_IO_getExternalBytes =  (id: int) => links.SKIP_IO_getExternalBytes(id);
    return links;
  }
}

/** @sk init */
export function init(env?: Environment) {
  return Promise.resolve(new Manager(env!));
}