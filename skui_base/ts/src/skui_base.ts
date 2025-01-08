import type {
  float,
  Environment,
  Links,
  ToWasmManager,
  Utils,
} from "@skip-wasm/std";

interface ToWasm {
  SKIP_JS_timeStamp(): float;
}

class LinksImpl implements Links, ToWasm {
  constructor(private env: Environment) {}

  SKIP_JS_timeStamp() {
    return this.env.timestamp();
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
    return links;
  };
}

export function init(env: Environment) {
  return Promise.resolve(new Manager(env));
}
