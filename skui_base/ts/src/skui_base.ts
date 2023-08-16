import { float, Environment, Links, ToWasmManager, Utils} from "#std/sk_types";

interface ToWasm {
  SKIP_JS_timeStamp: () => float;
}

class LinksImpl implements Links, ToWasm {
  SKIP_JS_timeStamp: () => float;

  constructor(env: Environment) {
    this.SKIP_JS_timeStamp = () => env ? env.timestamp() : 0.0;
  }

  complete = (utils: Utils, exports: object) => {
  }
}

class Manager implements ToWasmManager {
  private environment: Environment;

  constructor(environment: Environment) {
    this.environment = environment;
  }

  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl(this.environment);
    toWasm.SKIP_JS_timeStamp = () => links.SKIP_JS_timeStamp();
    return links;
  }
}

/** @sk init */
export function init(env?: Environment) {
  return Promise.resolve(new Manager(env!));
}