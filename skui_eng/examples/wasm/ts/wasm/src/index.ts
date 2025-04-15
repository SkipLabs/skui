import { launch } from "@skui/engine";

const wasmurl = new URL("./libskuieng_examples.wasm", import.meta.url);

await launch("skuieng_examples", wasmurl);
