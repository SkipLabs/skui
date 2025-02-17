import {
  run,
  loadEnv,
  Utils,
  type Environment,
  type Links,
  type ModuleInit,
  type ptr,
  type ToWasmManager,
  runtimeInit,
  posixInit,
  baseInit,
  regexpInit,
  commonInit,
  type EnvCreator,
} from "@skui/common";
import type { Array as IArray, Byte } from "@skui/common/internal.js";

let modules: ModuleInit[];

interface ToWasm {
  SKIP_resources_tests_luximr_bin: () => ptr<IArray<Byte>>;
  SKIP_resources_tests_luxirr_bin: () => ptr<IArray<Byte>>;
  SKIP_resources_tests_luxisr_bin: () => ptr<IArray<Byte>>;
  SKIP_resources_tests_xab_bin: () => ptr<IArray<Byte>>;
  SKIP_resources_tests_xdsff_bin: () => ptr<IArray<Byte>>;
  SKIP_resources_tests_xdvso_bin: () => ptr<IArray<Byte>>;
  SKIP_resources_tests_xtnr_bin: () => ptr<IArray<Byte>>;
}

type Resources = {
  SKIP_resources_tests_luximr_bin: Uint8Array;
  SKIP_resources_tests_luxirr_bin: Uint8Array;
  SKIP_resources_tests_luxisr_bin: Uint8Array;
  SKIP_resources_tests_xab_bin: Uint8Array;
  SKIP_resources_tests_xdsff_bin: Uint8Array;
  SKIP_resources_tests_xdvso_bin: Uint8Array;
  SKIP_resources_tests_xtnr_bin: Uint8Array;
};

const wasmurl = new URL("./test.wasm", import.meta.url);

class LinksImpl implements Links {
  private utils!: Utils;

  constructor(private resources: Resources) {}

  complete = (utils: Utils, _exports: object) => {
    this.utils = utils;
  };

  SKIP_resources_tests_luximr_bin() {
    return this.utils.exportBytes(
      this.resources.SKIP_resources_tests_luximr_bin
    );
  }

  SKIP_resources_tests_luxirr_bin() {
    return this.utils.exportBytes(
      this.resources.SKIP_resources_tests_luxirr_bin
    );
  }

  SKIP_resources_tests_luxisr_bin() {
    return this.utils.exportBytes(
      this.resources.SKIP_resources_tests_luxisr_bin
    );
  }

  SKIP_resources_tests_xab_bin() {
    return this.utils.exportBytes(this.resources.SKIP_resources_tests_xab_bin);
  }

  SKIP_resources_tests_xdsff_bin() {
    return this.utils.exportBytes(
      this.resources.SKIP_resources_tests_xdsff_bin
    );
  }

  SKIP_resources_tests_xdvso_bin() {
    return this.utils.exportBytes(
      this.resources.SKIP_resources_tests_xdvso_bin
    );
  }

  SKIP_resources_tests_xtnr_bin() {
    return this.utils.exportBytes(this.resources.SKIP_resources_tests_xtnr_bin);
  }
}

class Manager implements ToWasmManager {
  constructor(private resources: Resources) {}

  prepare = (wasm: object) => {
    const toWasm = wasm as ToWasm;
    const links = new LinksImpl(this.resources);
    toWasm.SKIP_resources_tests_luximr_bin =
      links.SKIP_resources_tests_luximr_bin.bind(links);
    toWasm.SKIP_resources_tests_luxirr_bin =
      links.SKIP_resources_tests_luxirr_bin.bind(links);
    toWasm.SKIP_resources_tests_luxisr_bin =
      links.SKIP_resources_tests_luxisr_bin.bind(links);
    toWasm.SKIP_resources_tests_xab_bin =
      links.SKIP_resources_tests_xab_bin.bind(links);
    toWasm.SKIP_resources_tests_xdsff_bin =
      links.SKIP_resources_tests_xdsff_bin.bind(links);
    toWasm.SKIP_resources_tests_xdvso_bin =
      links.SKIP_resources_tests_xdvso_bin.bind(links);
    toWasm.SKIP_resources_tests_xtnr_bin =
      links.SKIP_resources_tests_xtnr_bin.bind(links);
    return links;
  };
}

export class Loader {
  private env: Environment;

  constructor(private createEnvironment: EnvCreator) {
    this.env = loadEnv(createEnvironment, []);
  }

  async fetch(relPath: string): Promise<Uint8Array> {
    const url = new URL(relPath, import.meta.url);
    const val = await this.env.fetch(url);
    return val instanceof ArrayBuffer ? new Uint8Array(val) : val;
  }

  async load() {
    const SKIP_resources_tests_luximr_bin = await this.fetch("./luximr.bin");
    const SKIP_resources_tests_luxirr_bin = await this.fetch("./luxirr.bin");
    const SKIP_resources_tests_luxisr_bin = await this.fetch("./luxisr.bin");
    const SKIP_resources_tests_xab_bin = await this.fetch("./xab.bin");
    const SKIP_resources_tests_xdsff_bin = await this.fetch("./xdsff.bin");
    const SKIP_resources_tests_xdvso_bin = await this.fetch("./xdvso.bin");
    const SKIP_resources_tests_xtnr_bin = await this.fetch("./xtnr.bin");

    modules = [
      runtimeInit,
      posixInit,
      baseInit,
      regexpInit,
      commonInit,
      (_e: Environment) =>
        Promise.resolve(
          new Manager({
            SKIP_resources_tests_luximr_bin,
            SKIP_resources_tests_luxirr_bin,
            SKIP_resources_tests_luxisr_bin,
            SKIP_resources_tests_xab_bin,
            SKIP_resources_tests_xdsff_bin,
            SKIP_resources_tests_xdvso_bin,
            SKIP_resources_tests_xtnr_bin,
          })
        ),
    ];

    return (await run(wasmurl, modules, [], this.createEnvironment)).main;
  }
}
