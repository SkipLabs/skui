import {init} from "#skui_views/skui_utils";

var wasm64 = "/*--WASMB64--*/";
var modules : Array<string> = [/*--MODULES--*/];
var congifs : Array<string> = [/*--CONFIGS--*/];
var buffer = Uint8Array.from(atob(wasm64), c => c.charCodeAt(0));


async function run(congifs : Array<string>) {
  let available = new Array<any>();
  for (let i = 0; i < congifs.length; i++) {
    let rModule = await import(congifs[i]);
    if (rModule.config) {
      available.push(await rModule.config());
    }
  }
  await init(window, navigator, modules, buffer, available).catch(e => console.error(e));
}
