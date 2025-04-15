import { launch } from "@skui/engine";
import { init } from "./examples.js";

const wasmurl = new URL("./libskuieng_examples.wasm", import.meta.url);

await launch("skuieng_examples", wasmurl, [init]);
