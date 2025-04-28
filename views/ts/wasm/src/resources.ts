import {
  Utils,
  type Environment,
  type Links,
  type ModuleInit,
  type ptr,
  type ToWasmManager,
} from "../skui-common/index.js";
import type { Array as IArray, Byte } from "../skui-common/internal.js";

interface ToWasm {
  SKIP_skui_views_resources_src_big_bin: () => ptr<IArray<Byte>>;
  SKIP_skui_views_resources_src_small_bin: () => ptr<IArray<Byte>>;
}

type Resources = {
  SKIP_skui_views_resources_src_big_bin: Uint8Array;
  SKIP_skui_views_resources_src_small_bin: Uint8Array;
};

class LinksImpl implements Links {
  private utils!: Utils;

  constructor(private resources: Resources) {}

  complete = (utils: Utils, _exports: object) => {
    this.utils = utils;
  };

  SKIP_skui_views_resources_src_big_bin() {
    return this.utils.exportBytes(
      this.resources.SKIP_skui_views_resources_src_big_bin,
    );
  }

  SKIP_skui_views_resources_src_small_bin() {
    return this.utils.exportBytes(
      this.resources.SKIP_skui_views_resources_src_small_bin,
    );
  }
}

class Manager implements ToWasmManager {
  constructor(private resources: Resources) {}

  prepare = (wasm: object) => {
    const toWasm = wasm as ToWasm;
    const links = new LinksImpl(this.resources);
    toWasm.SKIP_skui_views_resources_src_big_bin =
      links.SKIP_skui_views_resources_src_big_bin.bind(links);
    toWasm.SKIP_skui_views_resources_src_small_bin =
      links.SKIP_skui_views_resources_src_small_bin.bind(links);
    return links;
  };
}

async function fetch_(env: Environment, relPath: string) {
  const url = new URL(relPath, import.meta.url);
  const val = await env.fetch(url);
  return val instanceof ArrayBuffer ? new Uint8Array(val) : val;
}

export const init: ModuleInit = async (env: Environment) => {
  const SKIP_skui_views_resources_src_big_bin = await fetch_(
    env,
    "../assets/big.bin",
  );
  const SKIP_skui_views_resources_src_small_bin = await fetch_(
    env,
    "../assets/small.bin",
  );
  return new Manager({
    SKIP_skui_views_resources_src_big_bin,
    SKIP_skui_views_resources_src_small_bin,
  });
};
