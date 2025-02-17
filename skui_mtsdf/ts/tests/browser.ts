import {
  run,
  type ModuleInit,
  runtimeInit,
  posixInit,
  baseInit,
  regexpInit,
  commonInit,
} from "@skui/common";
import { environment as createEnvironment } from "@skui/common/browser.js";

const modules: ModuleInit[] = [
  runtimeInit,
  posixInit,
  baseInit,
  regexpInit,
  commonInit,
];

const wasmurl = new URL("./test.wasm", import.meta.url);

export async function load() {
  const data = await run(wasmurl, modules, [], createEnvironment);
  return data.main;
}
