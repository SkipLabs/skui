import {int, ptr, Environment, Links, Utils, ToWasmManager, Shared} from "#skui_base/skui_types";

interface Exported {
  SKIP_UiEngineHandle_register: (id: int, type_: ptr) => void;
  SKIP_UiEngineHandle_unregister: (id: int) => void;
}

interface Env extends Environment {
  importJSONValue: (value: ptr) => any;
  exportJSONValue: (value: any) => ptr;
}

interface ToWasm {
  SKIP_UiEngineHandle_delete: (id: int) => void;
  SKIP_UiEngineHandle_apply: (id: int, type_: ptr, paremeter: ptr) => null | ptr;
}

class State {
  functionId = 0;
  functions = new Map<int,any>();

  register = (value: any) => {
    let id = ++this.functionId;
    this.functions.set(id, value);
    return id;
  }

  delete = (id : int) => {
    let value = this.functions.get(id);
    this.functions.delete(id);
    return value;
  }

  get = (id : int) => {
    return this.functions.get(id);
  }

  apply = (id: int, paremeter: Array<any>) => {
    let fn = this.functions.get(id);
    if (fn && typeof fn == "function") {
      return fn.apply(null, paremeter);
    }
    return null;
  }
}

export class HandleShared implements Shared {
  getName = () => "handle";
  register: (value: any) => int;
  unregister: (value: int) => void;
  constructor(
    register: (value: any) => int,
    unregister: (value: int) => void
  ) {
    this.register = register;
    this.unregister = unregister;
  }
}

class LinksImpl implements Links, ToWasm {
  state: State;
  env: Env | undefined;

  constructor(env?: Env) {
    this.state = new State();
    this.env = env;
  }

  SKIP_UiEngineHandle_delete = (id: int) => this.state.delete(id);
  SKIP_UiEngineHandle_apply: (id: int, type: ptr, paremeter: ptr) => null | ptr;

  complete = (utils: Utils, exports: object) => {
    let exported = exports as Exported;
    this.SKIP_UiEngineHandle_apply = (id: int, skType: ptr, skParemeters: ptr) => {
      if (this.env) {
        let type = utils.importString(skType);
        let parameters = this.env.importJSONValue(skParemeters);
        if (type == "function" && Array.isArray(parameters)) {
          let res = this.state.apply(id, parameters);
          return res !== undefined ? this.env.exportJSONValue(res) : null;
        }
        return null;
      }
      return null;
    }
    return new HandleShared(
      (value: any) => {
        let id = this.state.register(value);
        exported.SKIP_UiEngineHandle_register(id, utils.exportString(typeof value));
        return id;
      },
      (id: int) => exported.SKIP_UiEngineHandle_unregister(id)
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
    let links = new LinksImpl();
    toWasm.SKIP_UiEngineHandle_delete =  (id: int) => links.SKIP_UiEngineHandle_delete(id);
    toWasm.SKIP_UiEngineHandle_apply =  (id: int, type: ptr, paramaters: ptr) => links.SKIP_UiEngineHandle_apply(id, type, paramaters);
    return links;
  }
}

export function init(env?: Environment) {
  return Promise.resolve(new Manager(env ? env as Env : undefined));
}