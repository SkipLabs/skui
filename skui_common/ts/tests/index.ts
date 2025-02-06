import {
  run,
  type ModuleInit,
  runtimeInit,
  posixInit,
  baseInit,
  regexpInit,
  commonInit,
} from "@skui/common";

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
