import type {
  float,
  Environment,
  Links,
  ToWasmManager,
  Utils,
} from "../skipwasm-std/index.js";

interface ToWasm {
  SKIP_JS_timeStamp(): float;
  SKIP_Math_atan2(y: float, x: float): float;
}

class LinksImpl implements Links, ToWasm {
  constructor(private env: Environment) {}

  SKIP_JS_timeStamp() {
    return this.env.timestamp();
  }

  SKIP_Math_atan2(y: float, x: float) {
    return Math.atan2(y, x);
  }

  complete(_utils: Utils, _exports: object) {
    return;
  }
}

class Manager implements ToWasmManager {
  private environment: Environment;

  constructor(environment: Environment) {
    this.environment = environment;
  }

  prepare = (wasm: object) => {
    const toWasm = wasm as ToWasm;
    const links = new LinksImpl(this.environment);
    toWasm.SKIP_JS_timeStamp = links.SKIP_JS_timeStamp.bind(links);
    toWasm.SKIP_Math_atan2 = links.SKIP_Math_atan2.bind(links);
    return links;
  };
}

export function init(env: Environment) {
  return Promise.resolve(new Manager(env));
}
