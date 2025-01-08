import { run, type ModuleInit } from "@skip-wasm/std";

import { init as runtimeInit } from "@skip-wasm/std/runtime.js";
import { init as posixInit } from "@skip-wasm/std/posix.js";
import { init as baseInit } from "@skui/base/base.js";
import { init as regexpInit } from "@skui/common/regexp.js";
import { init as commonInit } from "@skui/common/common.js";

const modules: ModuleInit[] = [
  runtimeInit,
  posixInit,
  baseInit,
  regexpInit,
  commonInit,
];

const wasmurl = new URL("./test.wasm", import.meta.url);

export async function load() {
  const data = await run(wasmurl, modules, []);
  return data.main;
}
