import {
  run,
  loadEnv,
  Utils,
  type Environment,
  type Links,
  type ModuleInit,
  type ptr,
  type ToWasmManager,
} from "@skip-wasm/std";
import type { Array as IArray, Byte } from "@skiplang/std/internal.js";

import { init as runtimeInit } from "@skip-wasm/std/runtime.js";
import { init as posixInit } from "@skip-wasm/std/posix.js";
import { init as baseInit } from "@skui/base/base.js";
import { init as regexpInit } from "@skui/common/regexp.js";
import { init as commonInit } from "@skui/common/common.js";

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

const env = await loadEnv([]);

async function myfetch(relPath: string): Promise<Uint8Array> {
  const url = new URL(relPath, import.meta.url);
  return env.fetch(url);
}

try {
  const SKIP_resources_tests_luximr_bin = await myfetch("./luximr.bin");
  const SKIP_resources_tests_luxirr_bin = await myfetch("./luxirr.bin");
  const SKIP_resources_tests_luxisr_bin = await myfetch("./luxisr.bin");
  const SKIP_resources_tests_xab_bin = await myfetch("./xab.bin");
  const SKIP_resources_tests_xdsff_bin = await myfetch("./xdsff.bin");
  const SKIP_resources_tests_xdvso_bin = await myfetch("./xdvso.bin");
  const SKIP_resources_tests_xtnr_bin = await myfetch("./xtnr.bin");

  class LinksImpl implements Links {
    private utils!: Utils;

    complete = (utils: Utils, _exports: object) => {
      this.utils = utils;
    };

    SKIP_resources_tests_luximr_bin() {
      return this.utils.exportBytes(SKIP_resources_tests_luximr_bin);
    }

    SKIP_resources_tests_luxirr_bin() {
      return this.utils.exportBytes(SKIP_resources_tests_luxirr_bin);
    }

    SKIP_resources_tests_luxisr_bin() {
      return this.utils.exportBytes(SKIP_resources_tests_luxisr_bin);
    }

    SKIP_resources_tests_xab_bin() {
      return this.utils.exportBytes(SKIP_resources_tests_xab_bin);
    }

    SKIP_resources_tests_xdsff_bin() {
      return this.utils.exportBytes(SKIP_resources_tests_xdsff_bin);
    }

    SKIP_resources_tests_xdvso_bin() {
      return this.utils.exportBytes(SKIP_resources_tests_xdvso_bin);
    }

    SKIP_resources_tests_xtnr_bin() {
      return this.utils.exportBytes(SKIP_resources_tests_xtnr_bin);
    }
  }

  class Manager implements ToWasmManager {
    prepare = (wasm: object) => {
      const toWasm = wasm as ToWasm;
      const links = new LinksImpl();
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

  modules = [
    runtimeInit,
    posixInit,
    baseInit,
    regexpInit,
    commonInit,
    (_e: Environment) => Promise.resolve(new Manager()),
  ];
} catch (e: any) {
  modules = [];
  console.error(e);
  throw e;
}

const wasmurl = new URL("./test.wasm", import.meta.url);

export async function load() {
  const data = await run(wasmurl, modules, []);
  return data.main;
}
